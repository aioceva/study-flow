# Work Log

Лог на свършената работа по сесии. Обновява се в края на всяка сесия.

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

**Почистване на prompt структурата**

- Премахнат `src/prompts/index.ts` с `resolvePromptSet()` — динамичното търсене на `*_active` папка е изтрито
- Изтрита `src/prompts/2026-04-19_active/` папка с всичките 4 файла
- Изтрит `prepare.ts` и `preparePrompt` export — preparation/concept_map слоят е окончателно премахнат
- Новите flat файлове: `src/prompts/generate.ts`, `src/prompts/quiz.ts`, `src/prompts/recognize.ts` — идентично съдържание, директно местоположение
- API routes сочат директно: `import { generatePrompt } from "@/prompts/generate"` (и т.н.)
- `promptSet` export премахнат изцяло; `meta.prompt_set` вече не се записва в adaptation.json, quiz.json, adaptation-context.json, adaptation-thinking.json
- `prompt_set?: string` остава optional в types за обратна съвместимост при четене на стари файлове
- `api/prompt-set/route.ts`: премахнат `prepare.ts` от PROMPT_FILES, чете от `src/prompts/` директно, маркиран като legacy (използва се от test mode download в confirm)

**Разследване — bio/lesson-55 липсваше в UI**
- Файловете (adaptation.json, quiz.json, adaptation-context.json) бяха записани успешно в GitHub
- `_index.json` обаче НЕ беше обновен → урокът не се виждаше в UI
- Вероятна причина: SHA conflict при writeJSON на `_index.json` — между read и write стъпките друг commit е сменил SHA-то; грешката е изядена от try/catch в adaptation route и logger в loading page
- Ръчна поправка: добавен bio/lesson-55 директно в `_index.json`
- За следене: ако продължи → добавяне на retry логика за `_index.json` write
