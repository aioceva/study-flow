# Study Flow — Проект контекст

_Последна актуализация: 2 Април 2026_

## Какво е

Study Flow е MVP за деца с дислексия. Детето сканира страница от учебник, Claude генерира адаптирано съдържание (4 модула × 5 карти + 20 quiz въпроса). Без логин — всяко дете има отделен URL: `poc-study-flow.vercel.app/bobi`.

**Пилот:** Боби + ~20 деца. Период: Април–Май 2026. Цел: 8+ сесии за 4 седмици, 80%+ quiz резултат.

---

## Стек

- Next.js 16.1.6, TypeScript, Tailwind v4 (конфигурация в `globals.css` с `@theme` — **без** `tailwind.config.ts`)
- GitHub JSON файлове като база данни
- Claude API — Vision за разпознаване, claude-sonnet за адаптация и quiz
- `react-swipeable` за swipe навигация
- Adys.ttf шрифт (dyslexia-friendly, в `/public/fonts/`)
- Vercel deploy — единствен production URL, автоматичен при push към `main`

---

## Поток на сесията

### Learn режим (първо сканиране)
```
Главен екран → "Сканирай нов урок"
→ Claude Vision: разпознава предмет + урок номер
→ Проверява GitHub кеш: съществува ли адаптацията?
  → НЕ: Claude генерира adaptation.json + quiz.json (~30 сек)
  → ДА: зарежда от кеш, без AI calls
→ Confirm екран (показва предмет, заглавие, subtitle на урока)
→ "Отвори урока" → 4 модула × 5 карти (swipe)
→ Done екран → "Провери знанията си →"
→ Reinforcement quiz (10 въпроса с анимации) → Result екран
```

**Забележка:** Quiz × 2 по средата на урока са ПРЕМАХНАТИ (29 Март 2026).
`navigation.ts`: модул 2 → модул 3 директно, модул 4 → done директно.

### Reinforcement режим (повторно отваряне)
```
Home → tile на урок → "Отвори урока"
→ Confirm екран
→ "Провери знанията си" → 10 случайни въпроса от quiz.json (без нови AI calls)
→ Result: "Ти научи X неща днес" + "Опитай пак" / "Към началото"
— или —
→ "Отвори урока" → 4 модула × 5 карти → Done
```

---

## Routing

```
/                              — landing page / join redirect
/join                          — onboarding за нови деца (JoinWizard)
/[user]                        — начална страница (последни уроци + сканиране)
/[user]/scan                   — camera/upload
/[user]/loading                — изчакване на AI генерация (обработва 429 rate limit)
/[user]/confirm                — hub: показва урока, избор learn/review
/[user]/lesson/[module]/[card] — карта (модул 1-4, карта 1-5) ← page.tsx връща null
/[user]/lesson/separator       — "Браво! Завърши секция X от 4!" между модули ← page.tsx връща null
/[user]/done                   — краен екран
/[user]/reinforcement/quiz     — 10 случайни въпроса от quiz.json
/[user]/reinforcement/result   — резултат + опции
/[user]/parent                 — Дневник (родителски изглед) ✅ имплементиран
```

**Няма `/lesson/quiz` route в потока** — файлът `lesson/quiz/page.tsx` е orphan, предстои изтриване.
**Няма `/lesson/intro` route** — `confirm/page.tsx` изпълнява тази роля.

### ВАЖНО: LessonLayoutInner

`src/app/[user]/lesson/layout.tsx` зарежда `LessonLayoutInner` — persistent layout компонент, който рендерира **целия UI** за card и separator екраните чрез `usePathname()` detection.

`separator/page.tsx` и `[module]/[card]/page.tsx` **задължително връщат `null`**. Ако имат собствен UI, той се наслага и причинява flickering.

---

## Навигация

```tsx
function navigate(url: string) {
  setTimeout(() => startTransition(() => router.push(url)), 150);
}
```

150ms = press анимацията е видима преди смяна на екрана.
`startTransition` = текущият екран остава видим докато новият се подготвя.

`prevStep` / `nextStep` / `nextButtonLabel` → `src/lib/navigation.ts`

---

## GitHub като база данни

```
users/[user]/profile.json                              ← създава се при /join
users/[user]/adaptations/[subject]/lesson-[n]/adaptation.json
users/[user]/adaptations/[subject]/lesson-[n]/quiz.json
users/[user]/adaptations/[subject]/lesson-[n]/original.jpg  ← оригиналната снимка от scan
users/[user]/sessions/sessions.json
pilot/enrollment.json                                  ← брой записани деца (лимит 20)
rate-limit.json                                        ← 1 адаптация на 24 часа
```

Адаптацията се кешира в `sessionStorage`. Lazy init при рендер с валидация на subject/lesson.

---

## Структура на данните

### adaptation.json
```json
{
  "meta": { "user": "bobi", "subject": "math", "lesson": 14, "generated": "2026-03-15", "title": "Линейни уравнения" },
  "modules": [{
    "id": 1, "title": "Какво е уравнение", "color": "#E8F4FD",
    "cards": [{ "id": 1, "title": "...", "what": "...", "why": "...", "example": "..." }]
  }]
}
```

### quiz.json
```json
{
  "meta": { "user": "bobi", "subject": "math", "lesson": 14, "generated": "2026-03-15", "total": 20 },
  "questions": [{
    "id": 1, "module_id": 1, "card_id": 1,
    "question": "...",
    "explanation": "Едно изречение обяснение — показва се на Факт екрана при грешен отговор.",
    "options": [
      { "id": "a", "text": "...", "correct": true },
      { "id": "b", "text": "...", "correct": false },
      { "id": "c", "text": "...", "correct": false }
    ]
  }]
}
```

### sessions.json
```json
{
  "meta": { "user": "bobi" },
  "sessions": [
    {
      "date": "2026-03-15", "subject": "math", "lesson": 14,
      "started_at": "14:30", "duration_min": 1,
      "type": "learn", "status": "partial", "completed": false
    },
    {
      "date": "2026-03-15", "subject": "math", "lesson": 14,
      "started_at": "16:02", "duration_min": 28,
      "type": "learn", "status": "completed", "completed": true
    },
    {
      "date": "2026-03-19", "subject": "math", "lesson": 14,
      "started_at": "15:45", "duration_min": 15,
      "type": "reinforcement", "score": 7, "total": 10, "errors": [3, 8, 12]
    }
  ]
}
```

**Session типове:**
- `type: "learn"` + `status: "completed"` — детето е стигнало до `/done` (пълен цикъл)
- `type: "learn"` + `status: "partial"` — детето е минало поне 1 карта, но не е завършило
- `type: "reinforcement"` — завършен reinforcement quiz

`status` е опционален — стари записи без него се третират като `"completed"`.

### Subject кодове
`math`, `bio`, `chem`, `phys`, `hist`, `lit`, `gen`

---

## AI calls

| Кога | Call | Вход | Изход |
|------|------|------|-------|
| При сканиране | Claude Vision | снимка | предмет + заглавие + урок номер |
| Ново сканиране | Claude | снимка + инструкции | adaptation.json |
| Ново сканиране | Claude (фонов) | adaptation + инструкции | quiz.json (20 въпроса + explanation) |
| Повторно отваряне | — | — | зарежда от GitHub кеш |
| Reinforcement | — | — | random 10 от quiz.json |

**При повторно отваряне — нула AI calls.**

---

## Ключови файлове

| Файл | Роля |
|------|------|
| `src/app/[user]/lesson/LessonLayoutInner.tsx` | Целият lesson UI (cards + separator) + partial session tracking |
| `src/app/[user]/lesson/layout.tsx` | Зарежда LessonLayoutInner в Suspense |
| `src/app/[user]/page.tsx` + `UserHome.tsx` | Home екран |
| `src/app/[user]/confirm/page.tsx` | Hub: показва урока, избор learn/review |
| `src/app/[user]/done/page.tsx` | Краен екран + запис на completed сесия |
| `src/app/[user]/parent/page.tsx` | Дневник — родителски изглед |
| `src/app/[user]/parent/SessionList.tsx` | Списък сесии с badge за тип (Учене / Започнат урок / Преговор) |
| `src/app/[user]/reinforcement/quiz/page.tsx` | Reinforcement quiz (phase state machine) |
| `src/app/[user]/scan/page.tsx` | Camera/upload — image upload с memory leak fix |
| `src/app/join/page.tsx` + `JoinWizard.tsx` | Onboarding за нови деца |
| `src/app/api/join/route.ts` | POST /api/join — записване в enrollment.json |
| `src/app/api/generate/route.ts` | AI генерация + rate limiting + запис на original.jpg |
| `src/app/api/session/route.ts` | POST/GET сесии → sessions.json |
| `src/types/index.ts` | Всички типове + цветови константи (NAV, MODULE_*) |
| `src/lib/navigation.ts` | nextStep / prevStep / nextButtonLabel |
| `src/lib/github.ts` | readFile / writeFile / readJSON / writeJSON / writeBinaryFile |
| `src/app/globals.css` | Tailwind v4 @theme + btn-press клас + @font-face |
| `public/icons/` | icon-lesson.svg, icon-trophy-glow.svg, icon-welcome.svg |
| `tests/unit/navigation.test.ts` | Vitest unit tests за navigation helpers |
| `tests/e2e/flows.spec.ts` | Playwright E2E — home / confirm / quiz / parent |
| `vitest.config.ts` + `playwright.config.ts` | Test конфигурации |

---

## Предстои

- [ ] Изтриване на orphan файл `src/app/[user]/lesson/quiz/page.tsx`
- [ ] Prefetch на следващия route за по-бърза навигация
- [ ] next-intl (BG/EN) — планирано, не имплементирано
- [ ] E2E тестове с mock за GitHub (parent dashboard в CI без реален GITHUB_TOKEN)
