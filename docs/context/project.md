# Study Flow — Проект контекст

_Последна актуализация: 16 Март 2026_

## Какво е

Study Flow е MVP за деца с дислексия. Детето сканира страница от учебник, Claude генерира адаптирано съдържание (4 модула × 5 карти + 20 quiz въпроса). Без логин — всяко дете има отделен URL: `app.vercel.app/bobi`.

**Пилот:** Боби (дъщеря на Annie) + 2-3 деца. Цел: 8+ сесии за 4 седмици, 80%+ quiz резултат.

---

## Стек

- Next.js 14, TypeScript, Tailwind v4 (конфигурация в `globals.css` с `@theme` — **без** `tailwind.config.ts`)
- GitHub JSON файлове като база данни
- Claude API — Vision за разпознаване, claude-sonnet за адаптация и quiz
- `react-swipeable` за swipe навигация
- Adys.ttf шрифт (dyslexia-friendly, в `/public/fonts/`)
- Vercel deploy — единствен production URL, автоматичен при push към `main`

---

## Поток на сесията

### Learn режим (първо отваряне)
```
Главен екран → Сканирай страница от учебника
→ Claude Vision: разпознава предмет + урок номер
→ Проверява GitHub кеш: съществува ли адаптацията?
  → НЕ: Claude генерира adaptation.json + quiz.json (~30 сек)
  → ДА: зарежда от кеш, без AI calls
→ Intro екран → 4 модула × 5 карти (swipe)
→ Quiz 1 след Модул 2 (5 въпроса от модули 1+2)
→ Quiz 2 след Модул 4 (5 въпроса от модули 3+4)
→ Done екран → резултат → "Вземи теста за преговор"
```

### Reinforcement режим (повторно отваряне)
```
Home → tile на завършен урок → "Отвори урока"
→ Intro → прегледа картите (mode=review)
→ Done → "Вземи теста за преговор"
→ 10 случайни въпроса от quiz.json (без нови AI calls)
→ Резултат
```

---

## Routing

```
/[user]                        — начална страница (последни уроци + сканиране)
/[user]/scan                   — camera/upload
/[user]/loading                — изчакване на AI генерация (обработва 429 rate limit)
/[user]/confirm                — потвърждение на разпознатото
/[user]/lesson/intro           — начален екран на урок        ← page.tsx връща null
/[user]/lesson/[module]/[card] — карта (модул 1-4, карта 1-5) ← page.tsx връща null
/[user]/lesson/separator       — Браво между модули           ← page.tsx връща null
/[user]/lesson/quiz            — quiz въпроси
/[user]/done                   — краен екран с резултат
/[user]/reinforcement          — преговорен тест
/[user]/reinforcement/quiz
/[user]/reinforcement/result
```

### ВАЖНО: LessonLayoutInner

`src/app/[user]/lesson/layout.tsx` зарежда `LessonLayoutInner` — persistent layout компонент, който рендерира **целия UI** за intro, card и separator екраните чрез `usePathname()` detection.

`intro/page.tsx`, `separator/page.tsx`, `[module]/[card]/page.tsx` **задължително връщат `null`**. Ако имат собствен UI, той се наслага и причинява flickering.

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
users/[user]/adaptations/[subject]/lesson-[n]/adaptation.json
users/[user]/adaptations/[subject]/lesson-[n]/quiz.json
users/[user]/sessions.json
rate-limit.json   ← 1 адаптация на 24 часа (проверява се в /api/generate)
```

Адаптацията се кешира в `sessionStorage`. Lazy init при рендер:

```tsx
const [adaptation, setAdaptation] = useState<Adaptation | null>(() => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("adaptation");
  return raw ? (JSON.parse(raw) as Adaptation) : null;
});
```

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
      "started_at": "16:02", "duration_min": 28,
      "type": "learn", "completed": true,
      "quiz_1": { "score": 4, "total": 5, "errors": [2] },
      "quiz_2": { "score": 5, "total": 5, "errors": [] }
    },
    {
      "date": "2026-03-19", "subject": "math", "lesson": 14,
      "started_at": "15:45", "duration_min": 15,
      "type": "reinforcement", "score": 7, "total": 10, "errors": [3, 8, 12]
    }
  ]
}
```

### Subject кодове
`math`, `bio`, `chem`, `phys`, `hist`, `lit`, `gen`

---

## AI calls

| Кога | Call | Вход | Изход |
|------|------|------|-------|
| При сканиране | Claude Vision | снимка | предмет + заглавие + урок номер |
| Ново сканиране | Claude | снимка + инструкции | adaptation.json |
| Ново сканиране | Claude (фонов) | adaptation + инструкции | quiz.json (20 въпроса) |
| Повторно отваряне | — | — | зарежда от GitHub кеш |
| Reinforcement | — | — | random 10 от quiz.json |

**При повторно отваряне — нула AI calls.**

---

## Ключови файлове

| Файл | Роля |
|------|------|
| `src/app/[user]/lesson/LessonLayoutInner.tsx` | Целият lesson UI (intro + cards + separator) |
| `src/app/[user]/lesson/layout.tsx` | Зарежда LessonLayoutInner в Suspense |
| `src/app/[user]/page.tsx` | Home екран |
| `src/app/[user]/done/page.tsx` | Краен екран |
| `src/types/index.ts` | Всички типове + цветови константи (NAV, MODULE_*) |
| `src/lib/navigation.ts` | nextStep / prevStep / nextButtonLabel |
| `src/app/globals.css` | Tailwind v4 @theme + btn-press клас + @font-face |
| `src/app/api/generate/route.ts` | AI генерация + rate limiting |
| `public/icons/` | icon-lesson.svg, icon-trophy-glow.svg, icon-welcome.svg |

---

## Предстои (не е имплементирано)

- Родителски изглед (`/[user]/parent`) — sessions.json read-only, седмичен стрип
- Prefetch на следващия route за по-бърза навигация
- next-intl (BG/EN) — планирано, не имплементирано
