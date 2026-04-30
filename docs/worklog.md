# Work Log

Лог на свършената работа по сесии. Обновява се в края на всяка сесия.

---

## 2026-04-26

**Продуктова нотация — screens / flows / artifacts**
- Нови документи: `docs/screens.md`, `docs/flows.md`, `docs/artifacts.md`
- `screens.md` — 14 екрана в 6 модула (`site`, `home`, `scan`, `lesson`, `quiz`, `parent`); screen_id формат `module/screen` за стесняваща идентификация в задачи и бъг репорти
- `flows.md` — Normal Mode и Test Mode (с `?run=run_NNN` read-only режим)
- `artifacts.md` — всички файлове, които приложението създава/чете: GitHub persistent (enrollment, profile, sessions, adaptation/quiz/original/context/thinking, runs, _index, rate-limit, feedback), sessionStorage кеш, source-controlled prompts
- Почистен `prompt_set` от целия проект (остаряла концепция): `src/types/index.ts` (2 interface-а), 4× `adaptation.json`, 4× `quiz.json`, 3× `adaptation-thinking.json`, 2× `adaptation-context.json` — 13 файла, нула останали (само worklog)

---

## 2026-04-25

**Test Artifacts Panel — динамичен + run преглед**
- Test panel в `confirm/page.tsx`: collapsible, винаги видим header с "🔧 Test mode" + (ако е активен run) името на run-а; "↓ zip all" винаги в header-а
- Файловете в panel-а са динамични — fetch към нов `GET /api/lesson-files-list?user&subject&lesson[&run]`; pill-ове само за реално съществуващи файлове в папката
- Промптите са 3 отделни pill-а (`generate.ts`, `quiz.ts`, `recognize.ts`); в root mode идват от текущите `src/prompts/` (нов `GET /api/prompt-file?name=`); в run mode — snapshot-натите в run папката
- Списък с run папки (`run_001`, `run_002`...) — само в root mode; клик отваря urok-а в нов таб с `?mode=test&run=run_NNN`
- ZIP включва всички реално присъстващи файлове + (в root mode) текущите промпти; име: `lesson-{subject}-{lesson}[-run_NNN].zip`

**Run mode като read-only test преглед**
- `?run=run_NNN` се поддържа в confirm + lesson + quiz + done; пропагира се през `searchParams.toString()` в lesson и през ръчно сглобени URL-и в quiz/done навигацията
- `/api/adaptation` и `/api/lesson-file` приемат optional `run` param с regex валидация `^run_\d{3}$`
- `LessonLayoutInner` в run mode пропуска sessionStorage кеша (за да не презапише root урок в друг таб) и НЕ записва partial session
- `done/page.tsx`, `reinforcement/quiz/page.tsx` — НЕ записват в `/api/session` ако `run` е в URL
- `/api/lesson-file` whitelist разширен по разширение (`.json`, `.jpg`, `.png`, `.webp`, `.ts`, `.md`) с path-traversal защита
- Премахнат legacy `/api/prompt-set/route.ts` (вече ненужен — заменен от `/api/prompt-file`)

---

## 2026-04-19

**Test Mode (mode=test)**
- Добавен `mode=test` URL параметър — при scan на вече съществуващ урок, вместо да зарежда от кеш, архивира текущите файлове в `run_001`, `run_002` и т.н. и регенерира
- Нови функции в `src/lib/github.ts`: `listDirectory`, `deleteFile`, `copyFile` (binary-safe)
- Нов API route `POST /api/archive-lesson` — архивира файлове от root на lesson папката в `run_NNN/`
- `mode=test` се предава като URL параметър през всички страници: home → scan → loading → confirm → lesson → done → quiz → result
- Bypass на rate limits при `mode=test` в `src/app/api/generate/route.ts`
- Test Mode badge в `UserHome` и `confirm` страницата
- Нов API route `GET /api/lesson-file` — secure достъп до lesson файлове (whitelist)

**Bug fix**
- `src/app/api/prepare/route.ts`: `max_tokens: 2048 → 4096` — сложни уроци с 30+ концепции препълваха лимита и връщаха truncated JSON

**Review Mode cleanup**
- Премахнат мъртъв `mode=review` код от `navigation.ts`, `LessonLayoutInner.tsx`, `done/page.tsx`
- Премахната неизползвана функция `nextButtonLabel`

**CI/CD Setup**
- Нов файл `.github/workflows/test.yml` — unit тестове (Vitest) и E2E тестове (Playwright) при всеки push/PR към main
- `vercel.json`: добавен `buildCommand: "npm run test && npm run build"` — unit тестове вървят преди всеки Vercel деплой
- `playwright.config.ts`: Chromium (Pixel 5) в CI, WebKit (iPhone 14) локално; `baseURL`, `expect.timeout: 15s`, screenshot on failure
- Workflow upload на Playwright artifacts при failure за диагностика
- Fixes: `npm install` вместо `npm ci` (lockfile sync issues), `E2E_SKIP_AUTH=true` за bypass на server-side GitHub user check в CI, `waitForLoadState('networkidle')` преди assertion на home page

---

## 2026-04-20

**adaptation-context.json — преместване и оправяне на формат**
- Файлът се записваше в `POST /api/adaptation` (след пълната генерация) — преместен в `POST /api/generate` (фоново, заедно с `original.jpg`), където `promptSet` е наличен
- `confidence` се добавя към FormData в `loading/page.tsx` и се подава на generate route
- Форматът е опростен до спецификацията: `{ meta: { generated_at, prompt_set }, image_quality }` — премахнати излишните полета `user`, `subject`, `lesson`, `version`
- Премахнат блокът за `adaptation-context.json` от `adaptation/route.ts`; `image_quality` от destructuring

**Диагностика на липсващи файлове в lesson-11**
- Установено: `original.jpg` и `adaptation-context.json` СА записани в GitHub (commits `e945df3`, `eba43fa`) — само локално са изтрити (`D` в git status)
- Стар commit на `adaptation-context.json` съдържаше огромен `concept_map` масив от по-стара версия на кода — текущият код вече го няма

**Премахване на preparation/concept_map слоя**
- Изтрит `POST /api/prepare` route — отпадна отделният Claude call за извличане на концепти
- `loading/page.tsx`: премахната Стъпка 2 (prepare), `concept_map` от GitHub save, status `"preparing"` и dot индикатора
- `api/adaptation/route.ts`: премахнат `concept_map` от `adaptation-context.json`; добавен `prompt_set` в meta
- Адаптацията се генерира директно от снимката без текстов междинен слой

**Thinking в test mode**
- `api/generate/route.ts`: при `mode=test` Claude се вика с `thinking: { type: "enabled", budget_tokens: 10000 }` и `max_tokens: 16000`
- Thinking output се записва fire-and-forget в `adaptation-thinking.json` само в test mode (meta: user, subject, lesson, prompt_set, mode, version)

**Test mode бутон на landing page**
- Добавен "Test mode" бутон в nav на `(site)/page.tsx`; линкира към `/bobi?mode=test`

**Bug fixes — robustness при регенерация**
- `api/restore-lesson/route.ts` (нов): при неуспешна регенерация връща архивираните файлове от `run_NNN/` обратно в root
- `loading/page.tsx`: при грешка след архивиране → auto-restore → "Не успях да регенерирам урока. Старото съдържание е запазено."
- `confirm/page.tsx`: при липсваща `adaptation.json` — неактивен бутон + скрит quiz
- `archive-lesson/route.ts`: маха lesson от `_index.json` при архивиране
- `restore-lesson/route.ts`: добавя lesson обратно в `_index.json` след restore
- `api/quiz/route.ts`: `max_tokens: 4096 → 8192`; добавено `stop_reason` logging

**mode=test пропагация — довършване**
- `scan/page.tsx`: ← Назад + 🏠 Home; жълт `🔧 Test` badge в header
- `loading/page.tsx`: "Опитай отново" при грешка
- `reinforcement/page.tsx`: ← Назад
- `UserHome.tsx`: линк към Дневник в менюто
- `parent/page.tsx`: ← Назад, 🏠 Home, ← → седмична навигация

**Bug fix — файловете на урока не се записваха в GitHub**

Идентифицирани и оправени три отделни причини:

1. **Browser abort на fire-and-forget fetch** (`loading/page.tsx`)
   - `POST /api/adaptation` беше fire-and-forget; `router.replace()` след 500ms abort-ваше заявката
   - Поправка: `await fetch("/api/adaptation", ...)` преди навигация

2. **Serverless kill на background promises** (`api/generate/route.ts`)
   - `writeBinaryFile` (original.jpg) и `writeJSON` (adaptation-context.json, thinking) бяха fire-and-forget — Vercel ги прекъсваше при return на функцията
   - Поправка: `await Promise.all([...])` за всички три записа преди `return NextResponse.json`

3. **Vercel function timeout** (`api/generate/route.ts`, `api/quiz/route.ts`)
   - Default 60s timeout; test mode с thinking отнема 45-55s → за original.jpg (~500KB base64) не оставаше достатъчно време
   - Поправка: `export const maxDuration = 180` в generate route, `120` в quiz route

**Test mode banner — нови ресурси за сваляне**
- `confirm/page.tsx`: заглавие "Test mode · Lesson files" (беше "Test Mode · Lesson файлове")
- Добавени линкове: `adaptation-thinking.json`, `prompt-set.json`
- Бутон "↓ zip all" — сваля всички lesson файлове + prompt set като ZIP (fflate)
- `api/lesson-file/route.ts`: добавен `adaptation-thinking.json` в allowlist; `original.jpg` вече се сервира като истинско binary (Content-Type: image/jpeg) чрез нов `readBinaryFile` в `github.ts`
- `api/prompt-set/route.ts` (нов): сервира съдържанието на активния prompt set от filesystem

---

## 2026-04-25

**✅ Prompt snapshot в run папка — завършено и работещо локално**

Завършена работата от предишния опит. Истинският root cause беше **GitHub Contents API conflicts** при паралелни writes, не липсващи source файлове.

Диагноза и поправки:
- `archive-lesson` и `generate` правеха `Promise.all` на няколко writes в същата папка — GitHub връщаше 409 (parent tree SHA сменен) или 422 (`sha wasn't supplied`) за част от файловете
- **Sequential writes** в `archive-lesson/route.ts` (3 prompt файла) и `generate/route.ts` (`original.jpg` + `adaptation-context.json` + `adaptation-thinking.json`) — `Promise.all` → `for...of await`
- **github.ts writeFile/writeBinaryFile**: retry-ът вече handle-ва и **422** освен **409** — и двете значат "файлът съществува, дай SHA"
- **github.ts copyFile**: чете SHA на target ако съществува, иначе `restore-lesson` връщаше 422
- **quiz/route.ts**: добавен `jsonrepair` fallback (както в generate) — Claude връщаше валиден на пръв поглед JSON, но с тривиални glitches; quiz route не ги поправяше

Тествано локално с `start.bat`: всички файлове в `run_006/` присъстват — `generate.ts`, `quiz.ts`, `recognize.ts`, `adaptation.json`, `quiz.json`, `original.jpg`, `adaptation-context.json`, `adaptation-thinking.json`.

**Локален dev режим**
- `start.bat` в root: двоен клик → `npm run dev` на http://localhost:3001 (3000 често е зает)
- `docs/README.md`: обновени инструкции за локално стартиране
- Препоръчаният начин за тестване — без deploy към Vercel

---

**Верификация на legacy endpoint**
- Потвърдено: `GET /api/prompt-set` се използва само в `confirm/page.tsx` (lines 29-30 и 169-175) — безопасно за изтриване при test mode cleanup

**Prompt snapshot в run папка (test mode)**
- `api/archive-lesson/route.ts`: при архивиране на урок в test mode, копира `src/prompts/generate.ts`, `quiz.ts`, `recognize.ts` от filesystem в `run_NNN/` папката в GitHub
- Всеки run вече съдържа точните prompt файлове използвани за генерацията
- Грешка на отделен prompt файл не спира архивирането

**Тест политика в CLAUDE.md**
- Добавена секция `## Тестове`: чисти функции получават unit тест, route handlers получават mock описание, `vi.mock` не се въвежда без изрично искане
- Добавена инструкция за worklog: записва се в края на всяка сесия

---

**Разследване — bio/lesson-55 липсваше в UI**
- Файловете (adaptation.json, quiz.json, adaptation-context.json) бяха записани успешно в GitHub
- `_index.json` обаче НЕ беше обновен → урокът не се виждаше в UI
- Вероятна причина: SHA conflict при writeJSON на `_index.json` — между read и write стъпките друг commit е сменил SHA-то; грешката е изядена от try/catch в adaptation route и logger в loading page
- Ръчна поправка: добавен bio/lesson-55 директно в `_index.json`
- За следене: ако продължи → добавяне на retry логика за `_index.json` write
