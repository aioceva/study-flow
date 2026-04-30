# Study Flow — Artifacts

Списък на всички файлове и данни, които приложението създава или използва. Артефактите са разделени на 3 категории:

- **GitHub (persistent)** — JSON и binary файлове в репото (used as DB).
- **Client-side (sessionStorage)** — кеш в браузъра между routes, не се споделя между сесии.
- **Source-controlled** — файлове в репото, които се четат от runtime код (например prompts).

---

## GitHub (persistent)

### `pilot/enrollment.json`
- **purpose:** Регистър на пилота — лимит и списък на записаните деца (макс 20).
- **created_by:** `POST /api/join` (записване на ново дете чрез `JoinWizard`)
- **used_by:** `POST /api/join` (проверка на лимита), `POST /api/pilot-request` (заявка извън лимита)
- **storage_location:** `pilot/enrollment.json` в GitHub
- **visible_in_test_mode:** no
- **notes:** Структура: `{ limit, enrolled, participants: [{user, name, grade, joinedAt}] }`. Когато `enrolled >= limit`, `/api/join` отказва.

### `pilot/feedback/<timestamp>-<user>.json`
- **purpose:** Запис на feedback съобщение от потребител (текст + кой екран го е изпратил).
- **created_by:** `POST /api/feedback` (от `FeedbackButton` компонента, видим на много екрани)
- **used_by:** Чете се само ръчно от екипа (няма UI за преглед).
- **storage_location:** `pilot/feedback/` папка, един файл на feedback с timestamp в името
- **visible_in_test_mode:** no
- **notes:** Структура: `{ user, name, grade, message, submittedAt, screen }`. Полето `screen` се подава от компонента (където е бил потребителят).

### `users/[user]/profile.json`
- **purpose:** Профил на детето — име, клас, цвят за четене, дата на запис.
- **created_by:** `POST /api/join` едновременно с добавянето в enrollment.json
- **used_by:** `home/list` (server check за authorization), `POST /api/feedback` (взима име/клас за enrich на feedback-а)
- **storage_location:** `users/[user]/profile.json`
- **visible_in_test_mode:** no
- **notes:** Структура: `{ name, grade, readingColor, joinedAt }`. Стари потребители (Боби) могат да нямат profile.json — fallback е проверка за sessions.json.

### `users/[user]/rate-limit.json`
- **purpose:** Брояч на AI генерации per user per day. Лимит 5 на ден.
- **created_by:** `POST /api/generate` при първата генерация за деня
- **used_by:** `POST /api/generate` (преди извикване на Claude — отказва ако `count >= MAX_PER_DAY`)
- **storage_location:** `users/[user]/rate-limit.json`
- **visible_in_test_mode:** no — пропуска се изцяло в test mode
- **notes:** Структура: `{ date: "YYYY-MM-DD", count: number }`. При нов ден count се ресетва.

### `users/[user]/sessions/sessions.json`
- **purpose:** Лог на всички сесии (учене и преговор) за детето.
- **created_by:** `POST /api/session` — извиква се от `LessonLayoutInner` (partial при първа карта), `lesson/done` (completed learn), `quiz/result` (reinforcement)
- **used_by:** `home/list` (sort на tiles по последна активност), `lesson/confirm` (показва най-добър резултат), `quiz/intro` (history), `parent/dashboard` (всички сесии)
- **storage_location:** `users/[user]/sessions/sessions.json`
- **visible_in_test_mode:** no — `?run=` режимът пропуска session writes
- **notes:** Два типа сесии: `learn` (с `status: "completed" | "partial"`) и `reinforcement` (с `total`, `errors[]`).

### `users/[user]/adaptations/_index.json`
- **purpose:** Индекс на всички адаптирани уроци за userа — за бърз листинг на началния екран без обхождане на папки.
- **created_by:** `POST /api/generate` (добавя запис след успешна генерация); `POST /api/archive-lesson` (премахва запис при архивиране в test mode)
- **used_by:** `GET /api/adaptation` (без subject/lesson параметри), `home/list` (визуализация на tiles)
- **storage_location:** `users/[user]/adaptations/_index.json`
- **visible_in_test_mode:** no — индексът отразява само live root-level адаптации, не runs
- **notes:** Масив от `{ subject, lesson, title, savedAt }`. В test mode при regenerate старият запис се маха (защото файловете отиват в run_NNN/) и се добавя нов след регенерация.

### `users/[user]/adaptations/[subject]/lesson-[n]/adaptation.json`
- **purpose:** Адаптираното съдържание на урока — 4 модула × 5 карти, всяка с `title/what/why/example`.
- **created_by:** `POST /api/generate` (Claude Sonnet от снимка + prompt)
- **used_by:** `lesson/confirm` (показва модули + време), `lesson/card` (рендерира конкретна карта), `LessonLayoutInner` (целия cards UI). Първо проверява sessionStorage кеша; ако липсва — `GET /api/adaptation`.
- **storage_location:** `users/[user]/adaptations/[subject]/lesson-[n]/adaptation.json`
- **visible_in_test_mode:** yes — download link в test panel
- **notes:** Структура: `{ meta: {user, subject, lesson, generated, title}, modules: [{id, title, color, cards: [{id, title, what, why, example}]}] }`. Subject кодове: math, bio, chem, phys, hist, lit, gen.

### `users/[user]/adaptations/[subject]/lesson-[n]/quiz.json`
- **purpose:** 20 quiz въпроса генерирани от адаптацията. От тях се избират 10 случайни при всеки преговор.
- **created_by:** `POST /api/quiz` (втори AI call след `/api/generate`, на база на готовата адаптация)
- **used_by:** `quiz/question` (зарежда от sessionStorage или GitHub)
- **storage_location:** `users/[user]/adaptations/[subject]/lesson-[n]/quiz.json`
- **visible_in_test_mode:** yes — download link в test panel
- **notes:** Структура: `{ meta: {user, subject, lesson, generated, total: 20}, questions: [{id, module_id, card_id, question, explanation, options: [{id, text, correct}]}] }`. `explanation` се показва на „Факт" екрана при грешен отговор.

### `users/[user]/adaptations/[subject]/lesson-[n]/original.jpg`
- **purpose:** Оригиналната снимка от scan — за reference и debugging.
- **created_by:** `POST /api/generate` (writeBinaryFile след успешна генерация)
- **used_by:** не се чете директно от UI — само ръчно за debugging. В test mode е достъпен като download.
- **storage_location:** `users/[user]/adaptations/[subject]/lesson-[n]/original.jpg`
- **visible_in_test_mode:** yes — download link в test panel
- **notes:** Записва се само ако `mediaType` е `image/jpeg`, `image/png` или `image/webp`. Грешка при запис не блокира основния flow.

### `users/[user]/adaptations/[subject]/lesson-[n]/adaptation-context.json`
- **purpose:** Метаданни за качеството на изображението от scan-а (high/low confidence).
- **created_by:** `POST /api/generate` (само ако параметърът `confidence` е подаден от client-а)
- **used_by:** не се чете от UI код — за post-mortem анализ.
- **storage_location:** `users/[user]/adaptations/[subject]/lesson-[n]/adaptation-context.json`
- **visible_in_test_mode:** yes — download link в test panel
- **notes:** Структура: `{ meta: { generated_at }, image_quality: "high" | "low" }`.

### `users/[user]/adaptations/[subject]/lesson-[n]/adaptation-thinking.json`
- **purpose:** Claude `thinking` блокът от генерацията — пълният reasoning процес. **Само в test mode.**
- **created_by:** `POST /api/generate?mode=test` (само ако `thinking` блок е получен от Claude)
- **used_by:** не се чете от UI — за анализ на prompt-а. В test mode е достъпен като download.
- **storage_location:** `users/[user]/adaptations/[subject]/lesson-[n]/adaptation-thinking.json`
- **visible_in_test_mode:** yes — download link в test panel
- **notes:** Структура: `{ meta: { user, subject, lesson, generated_at, mode: "test", version }, thinking: string }`. В normal mode НЕ се записва (thinking е disabled).

### `users/[user]/adaptations/[subject]/lesson-[n]/run_NNN/*` (test mode)
- **purpose:** Архивирано копие на всички файлове от lesson папката от предишен опит, плюс snapshot на промптите използвани за този run.
- **created_by:** `POST /api/archive-lesson` (извиква се от `scan/loading?mode=test` при cache hit, преди regenerate)
- **used_by:** `lesson/confirm?mode=test` (test panel — листинг и run pills), `lesson/confirm?mode=test&run=run_NNN`, `quiz/question?mode=test&run=run_NNN`
- **storage_location:** `users/[user]/adaptations/[subject]/lesson-[n]/run_NNN/`
- **visible_in_test_mode:** yes — само в test mode се показват
- **notes:** Папките са с формат `run_001`, `run_002`... (валидиран regex `/^run_\d{3}$/`). Съдържание: всички data файлове (adaptation.json, quiz.json, original.jpg, adaptation-context.json, adaptation-thinking.json) + snapshot на `generate.ts`, `quiz.ts`, `recognize.ts` от `src/prompts/`. **`run id` (`run_NNN`)** е името на папката + query param `?run=run_NNN` — не е отделен файл, а идентификатор на конкретен опит за регенерация.

---

## Client-side (sessionStorage)

### `adaptation`
- **purpose:** Кеш на текущата адаптация в браузъра — за да не се чете повторно от GitHub при навигация между карти.
- **created_by:** `scan/loading` (след `/api/generate` или след cache hit от `/api/adaptation`)
- **used_by:** `lesson/confirm`, `lesson/card`, `LessonLayoutInner`
- **storage_location:** `sessionStorage["adaptation"]`
- **visible_in_test_mode:** n/a (винаги активен, browser-side)
- **notes:** Lazy init с валидация на subject/lesson — ако кешът е за друг урок, се игнорира.

### `quiz`
- **purpose:** Кеш на quiz файла в браузъра.
- **created_by:** `scan/loading` (paralelно с adaptation cache)
- **used_by:** `quiz/question`
- **storage_location:** `sessionStorage["quiz"]`
- **visible_in_test_mode:** n/a — в `?run=` режим се пропуска (винаги се чете от run папката)

### `scan_image_base64` + `scan_image_type`
- **purpose:** Прехвърляне на снимката от `scan/capture` към `scan/loading` без да минава през URL.
- **created_by:** `scan/capture` (след capture / upload)
- **used_by:** `scan/loading` (преди `/api/generate`)
- **storage_location:** `sessionStorage["scan_image_base64"]`, `sessionStorage["scan_image_type"]`
- **visible_in_test_mode:** n/a
- **notes:** Изтрива се след успешна генерация (или остава за retry — зависи от current implementation).

---

## Source-controlled (in repo, read at runtime)

### `src/prompts/generate.ts`
- **purpose:** Prompt темплейт за генерация на adaptation.json от изображение.
- **created_by:** ръчно (от dev екипа)
- **used_by:** `POST /api/generate` (внася функцията `generatePrompt`); `POST /api/archive-lesson` (чете файла от диска и го snapshot-ва в `run_NNN/`)
- **storage_location:** `src/prompts/generate.ts`
- **visible_in_test_mode:** yes — в test panel на `lesson/confirm` като download (от `/api/prompt-file` в root mode, от run папката в run mode)
- **notes:** В run папката се записва like-for-like копие на `.ts` файла с името му.

### `src/prompts/quiz.ts`
- **purpose:** Prompt темплейт за генерация на quiz.json от готовата адаптация.
- **created_by:** ръчно
- **used_by:** `POST /api/quiz`; `POST /api/archive-lesson` (snapshot)
- **storage_location:** `src/prompts/quiz.ts`
- **visible_in_test_mode:** yes — download в test panel

### `src/prompts/recognize.ts`
- **purpose:** Prompt темплейт за Claude Vision разпознаване на предмет/урок.
- **created_by:** ръчно
- **used_by:** `POST /api/recognize`; `POST /api/archive-lesson` (snapshot)
- **storage_location:** `src/prompts/recognize.ts`
- **visible_in_test_mode:** yes — download в test panel
