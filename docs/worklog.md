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
