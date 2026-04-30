# Study Flow — Screens

Карта на всички UI екрани в приложението. `screen_id` е уникален идентификатор във формат `module/screen` — отляво надясно стеснява обхвата (модул → конкретен екран). Използвай го в задачи и бъг репорти, за да е ясно за коя част на приложението става дума.

API routes (`/api/...`) **не са** екрани и не са включени тук — споменати са в `created_by` на artefakti в [artifacts.md](artifacts.md).

---

## Modules

| module | какво обхваща |
|---|---|
| `site` | Публични страници (landing, onboarding, terms) — без `[user]` сегмент |
| `home` | Началната страница на дете (списък уроци) |
| `scan` | Снимане на нов урок и AI генерация |
| `lesson` | Hub на урок + четене на карти + край |
| `quiz` | Преговор (reinforcement quiz) |
| `parent` | Родителски изглед |

---

## Screens

### site

#### `site/landing`
- **route:** `/`
- **purpose:** Публична маркетингова страница с примери и CTA „Запиши се за пилота".
- **entry_from:** външен линк, директно посещение
- **primary_user_action:** клик към `/join`
- **notes:** редиректва записаните потребители ако има profile.json (handled в `/[user]/page.tsx`, не тук)

#### `site/join`
- **route:** `/join`
- **purpose:** Onboarding wizard за нови деца (име, клас, цвят за четене). Записва profile.json и ги добавя в pilot/enrollment.json.
- **entry_from:** `site/landing`
- **primary_user_action:** попълва формата и стига до личния URL `/[user]`
- **notes:** реализиран чрез `JoinWizard.tsx`. При лимит 20 деца връща грешка.

#### `site/terms`
- **route:** `/terms`
- **purpose:** Условия за ползване (статичен текст).
- **entry_from:** линк от `site/landing` или footer
- **primary_user_action:** четене

---

### home

#### `home/list`
- **route:** `/[user]`
- **purpose:** Начален екран на детето — списък с предишни уроци (групирани по седмица) + бутон за нов скан.
- **entry_from:** директен URL, redirect от другаде, бутон „Начало"
- **primary_user_action:** избор на урок (→ `lesson/confirm`) или „Сканирай нов урок" (→ `scan/capture`)
- **notes:** Server component прави `redirect("/join")` ако липсват profile.json и sessions.json. Поддържа `?mode=test` за пренос на test mode през навигацията.

---

### scan

#### `scan/capture`
- **route:** `/[user]/scan`
- **purpose:** Камера/upload на страница от учебник. Извиква Claude Vision (`/api/recognize`) за разпознаване на предмет и номер на урок.
- **entry_from:** `home/list`
- **primary_user_action:** прави снимка → потвърждава предмет/урок → отива на `scan/loading`
- **notes:** Записва base64 изображението в sessionStorage (`scan_image_base64`, `scan_image_type`) преди навигация. Има memory leak fix за изображения.

#### `scan/loading`
- **route:** `/[user]/loading`
- **purpose:** Изчакване на AI генерация. Първо проверява GitHub кеша — ако урокът съществува и не сме в test mode, зарежда от кеш (cached). Иначе извиква `/api/generate` (adaptation) и `/api/quiz` последователно.
- **entry_from:** `scan/capture`
- **primary_user_action:** изчаква (~30 сек), после автоматично → `lesson/confirm`
- **notes:** Обработва 429 (rate limit). В test mode архивира предишната версия в `run_NNN/` чрез `/api/archive-lesson` преди regenerate. Не пише на runs в sessions.

---

### lesson

#### `lesson/confirm`
- **route:** `/[user]/confirm`
- **purpose:** Hub на урока — показва заглавие, списък модули, време за четене, и две действия: „Отвори урока" или „Провери знанията си". Замества несъществуващия `/lesson/intro`.
- **entry_from:** `scan/loading` (нов урок), `home/list` (повторно отваряне)
- **primary_user_action:** избор learn (→ `lesson/card` 1/1) или review (→ `quiz/question`)
- **notes:** В test mode (`?mode=test`) показва жълт panel с download links за всички файлове в lesson папката + бутон за zip. Поддържа `?run=run_NNN` за read-only преглед на стар run.

#### `lesson/card`
- **route:** `/[user]/lesson/[module]/[card]` (4 модула × 5 карти = 20 карти)
- **purpose:** Една карта от урока с `what` / `why` / `example` секции и swipe навигация между карти.
- **entry_from:** `lesson/confirm` (старт), предишна `lesson/card`, `lesson/separator`
- **primary_user_action:** swipe или „Напред" → следваща карта; на последната карта от модул → `lesson/separator`; на последната карта от модул 4 → `lesson/done`
- **notes:** **Самата `page.tsx` връща `null`** — целият UI се рендерира от `LessonLayoutInner` в `layout.tsx` (persistent layout с `usePathname()` detection). Записва partial session при първо визуализиране.

#### `lesson/separator`
- **route:** `/[user]/lesson/separator`
- **purpose:** Преходен екран „Браво! Завърши секция X от 4!" между модулите.
- **entry_from:** последна карта на модул 1, 2 или 3
- **primary_user_action:** „Напред" → първа карта на следващ модул
- **notes:** **`page.tsx` връща `null`** — UI идва от `LessonLayoutInner`. Не е route с params — секцията се определя от прехода.

#### `lesson/done`
- **route:** `/[user]/done`
- **purpose:** Краен екран на learn режим. Записва `type: "learn", status: "completed"` сесия.
- **entry_from:** последна карта на модул 4 (`lesson/card` 4/5)
- **primary_user_action:** „Провери знанията си →" (→ `quiz/question`) или „Към началото" (→ `home/list`)

---

### quiz

#### `quiz/intro`
- **route:** `/[user]/reinforcement`
- **purpose:** Intro екран на преговор за конкретен урок — показва най-добър резултат и история на предишните опити.
- **entry_from:** обикновено НЕ се влиза от UI flow — `lesson/confirm` и `lesson/done` водят директно към `quiz/question`. Това е по-скоро deep-link / алтернативна точка.
- **primary_user_action:** „Започни Преговор" → `quiz/question`
- **notes:** Не се ползва активно в основния поток. Проверява дали детето случайно стига до тук от bookmark/обратен бутон.

#### `quiz/question`
- **route:** `/[user]/reinforcement/quiz`
- **purpose:** 10 случайни въпроса от quiz.json с phase state machine: `answering` → `correct` (confetti) или `wrong` → `fact` (обяснение). Зарежда quiz от sessionStorage; ако липсва — от GitHub.
- **entry_from:** `lesson/confirm` (бутон „Провери знанията"), `lesson/done`, `quiz/intro`
- **primary_user_action:** избира отговор → автоматичен преход през phases → след 10 въпроса → `quiz/result`
- **notes:** Phases са вътрешни state-ове, не отделни routes. Поддържа `?run=run_NNN` за работа върху стара версия на quiz-а.

#### `quiz/result`
- **route:** `/[user]/reinforcement/result`
- **purpose:** „Ти научи X неща днес" + опции „Опитай пак" или „Към началото". Записва `type: "reinforcement"` сесия с total + errors.
- **entry_from:** `quiz/question` (след въпрос 10)
- **primary_user_action:** „Опитай пак" (→ `quiz/question`) или „Към началото" (→ `home/list`)

---

### parent

#### `parent/dashboard`
- **route:** `/[user]/parent`
- **purpose:** Родителски Дневник — показва списък сесии с badge за тип (Учене / Започнат урок / Преговор), резултати от преговори.
- **entry_from:** меню от `home/list` (или директен URL)
- **primary_user_action:** четене / филтриране на сесии
- **notes:** UI компонент `SessionList.tsx`. Чете сесии от sessions.json. Не пише данни.
