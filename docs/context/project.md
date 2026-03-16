# Study Flow — Проект контекст

_Последна актуализация: 16 Март 2026_

## Какво е

Study Flow е MVP за деца с дислексия. Детето сканира страница от учебник, Claude генерира адаптирано съдържание (4 модула × 5 карти + 20 quiz въпроса). Без логин — всяко дете има отделен URL: `app.vercel.app/bobi`.

**Пилот:** Боби (дъщеря на Annie) + 2-3 деца. Цел: 8+ сесии за 4 седмици, 80%+ quiz резултат.

---

## Стек

- Next.js 14, TypeScript, Tailwind v4 (конфигурация в `globals.css` с `@theme` — **без** `tailwind.config.ts`)
- GitHub JSON файлове като база данни
- Claude API (Vision за разпознаване + generation за адаптация и quiz)
- `react-swipeable` за swipe навигация
- Adys.ttf шрифт (dyslexia-friendly, в `/public/fonts/`)
- Vercel deploy — единствен production URL, автоматичен при push към `main`

---

## Routing

```
/[user]                        — начална страница (последни уроци + сканиране)
/[user]/scan                   — camera/upload
/[user]/loading                — изчакване на AI генерация
/[user]/confirm                — потвърждение на разпознатото
/[user]/lesson/intro           — начален екран на урок       ← page.tsx връща null
/[user]/lesson/[module]/[card] — карта (модул 1-4, карта 1-5) ← page.tsx връща null
/[user]/lesson/separator       — Браво между модули          ← page.tsx връща null
/[user]/lesson/quiz            — quiz въпроси
/[user]/done                   — краен екран с резултат
/[user]/reinforcement          — преговорен тест
/[user]/reinforcement/quiz
/[user]/reinforcement/result
```

### ВАЖНО: LessonLayoutInner

`src/app/[user]/lesson/layout.tsx` зарежда `LessonLayoutInner` — persistent layout компонент, който рендерира **целия UI** за intro, card и separator екраните.

`intro/page.tsx`, `separator/page.tsx`, `[module]/[card]/page.tsx` **задължително връщат `null`** — ако имат собствен UI, той се наслага върху LessonLayoutInner и причинява flickering.

LessonLayoutInner открива типа екран от `usePathname()`:
- `isCardPage` — 4 URL сегмента, последните 2 са числа
- `isSeparator` — `/lesson/separator`
- `isIntro` — `/lesson/intro`

---

## Навигация

Всички навигационни бутони използват `navigate()` helper с 150ms delay:

```tsx
function navigate(url: string) {
  setTimeout(() => startTransition(() => router.push(url)), 150);
}
```

150ms = press анимацията е видима преди смяна на екрана. `startTransition` = текущият екран остава видим докато новият се подготвя.

`prevStep` / `nextStep` / `nextButtonLabel` са в `src/lib/navigation.ts`.

---

## GitHub като база данни

```
users/[user]/adaptations/[subject]/lesson-[n]/adaptation.json
users/[user]/adaptations/[subject]/lesson-[n]/quiz.json
users/[user]/sessions.json
rate-limit.json   ← 1 адаптация на 24 часа
```

Адаптацията се кешира в `sessionStorage` веднъж заредена. Lazy init в LessonLayoutInner:

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
  "meta": { "user": "bobi", "subject": "math", "lesson": 14, "generated": "2026-03-15", "title": "..." },
  "modules": [{
    "id": 1, "title": "...", "color": "#E8F4FD",
    "cards": [{ "id": 1, "title": "...", "what": "...", "why": "...", "example": "..." }]
  }]
}
```

### sessions.json
```json
{
  "meta": { "user": "bobi" },
  "sessions": [{
    "date": "2026-03-15", "subject": "math", "lesson": 14,
    "started_at": "16:02", "duration_min": 28, "type": "learn", "completed": true,
    "quiz_1": { "score": 4, "total": 5, "errors": [2] },
    "quiz_2": { "score": 5, "total": 5, "errors": [] }
  }]
}
```

### Subject кодове
`math`, `bio`, `chem`, `phys`, `hist`, `lit`, `gen`

---

## Ключови файлове

| Файл | Роля |
|------|------|
| `src/app/[user]/lesson/LessonLayoutInner.tsx` | Целият lesson UI |
| `src/app/[user]/lesson/layout.tsx` | Зарежда LessonLayoutInner в Suspense |
| `src/app/[user]/page.tsx` | Home екран |
| `src/app/[user]/done/page.tsx` | Краен екран |
| `src/types/index.ts` | Всички типове + цветови константи |
| `src/lib/navigation.ts` | nextStep / prevStep / nextButtonLabel |
| `src/app/globals.css` | Tailwind v4 @theme + btn-press клас |
| `public/icons/` | icon-lesson.svg, icon-trophy-glow.svg, icon-welcome.svg |
