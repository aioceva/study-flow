# Study Flow — Dev Notes & Капани

_Последна актуализация: 2 Април 2026_

Натрупани уроци от разработката. Прочети преди да пишеш код.

---

## Routing капани

### page.tsx в lesson routes ТРЯБВА да връща null

`LessonLayoutInner` рендерира **целия UI** за intro, card и separator екраните.
Ако `page.tsx` има собствен UI, той се наслага → двоен рендер → flickering.

```tsx
// ✅ ПРАВИЛНО — separator/page.tsx, intro/page.tsx, [module]/[card]/page.tsx
export default function SeparatorPage() {
  return null;
}
```

### Динамичният [user] route поглъща всичко

`/preview`, `/test`, `/ui-test` се routing-ват като username="preview".
Никога не създавай такива routes в main branch.

---

## iOS / Mobile капани

### URL.createObjectURL() — Memory Leak при неуспешно зареждане

В `scan/page.tsx` — всеки `createObjectURL()` трябва да се освободи с `revokeObjectURL()`.

```tsx
// ✅ ПРАВИЛНО — освобождава при грешка или при cleanup
const url = URL.createObjectURL(file);
try {
  // ... използвай url
} catch {
  URL.revokeObjectURL(url); // освобождава ако нещо се счупи
  throw;
}
// или в useEffect cleanup:
return () => URL.revokeObjectURL(url);
```

Симптом: memory leak при многократно качване на снимки в един tab.

### CSS :active без navigate delay не работи

`:active` е видим само докато пръстът е на екрана. `onClick` fires на `pointerup`.

```tsx
// ❌ ГРЕШНО
<button onClick={() => router.push(url)}>

// ✅ ПРАВИЛНО
function navigate(url: string) {
  setTimeout(() => startTransition(() => router.push(url)), 150);
}
```

### SVG emoji в `<text>` не работи на iOS Safari

```svg
<!-- ❌ ГРЕШНО — не се вижда на iOS -->
<text x="48" y="72" text-anchor="middle" font-size="40">🏆</text>

<!-- ✅ ПРАВИЛНО — SVG paths -->
<path d="M29 22 H67 L63 50 Q56 62 48 62 Q40 62 33 50 Z" fill="#E8C04A"/>
```

### height: 100dvh, не min-h-screen

На iOS Safari `min-h-screen` не отчита address bar-а. Използвай `height: 100dvh`.

---

## React / Next.js капани

### Hooks преди conditional returns (React Rules of Hooks)

`useSwipeable` и всички hooks трябва да са преди `if (!isCardPage) return`.

### Lazy useState за sessionStorage (избягва "Зарежда...")

```tsx
// ✅ БЪРЗО — синхронно от sessionStorage при първи render
const [adaptation, setAdaptation] = useState<Adaptation | null>(() => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("adaptation");
  return raw ? (JSON.parse(raw) as Adaptation) : null;
});
```

### startTransition около router.push

```tsx
startTransition(() => router.push(url))
```

### Tailwind v4 — без tailwind.config.ts

Конфигурацията е в `src/app/globals.css`:
```css
@import "tailwindcss";
@theme inline {
  --color-background: var(--background);
  --font-adys: "Adys", "OpenDyslexic", sans-serif;
}
```

---

## Git / Vercel капани

### vercel.json ignoreCommand

`/users/` папката съдържа данни на потребителите. Промените там не трябва да trigger-ват нов deploy.

### git push rejected

Ако remote има нови commits: `git pull --rebase && git push`

---

## Имплементирани функционалности

### Core (Март 2026)
- ✅ Сканиране и AI генерация (Claude Vision + Claude)
- ✅ Rate limiting: 1 адаптация на 24 часа (`rate-limit.json` в GitHub)
- ✅ 4 модула × 5 карти с swipe навигация
- ✅ Reinforcement quiz (10 random от 20)
- ✅ Запис на сесии в `sessions.json`
- ✅ Home с последни уроци tiles (групирани по дата)
- ✅ Confirm екран: hub за learn/review, показва последен резултат
- ✅ Separator / Done екрани
- ✅ btn-press анимация на всички бутони
- ✅ Anti-flickering (lazy adaptation, startTransition, null page.tsx)
- ✅ SVG trophy icon (без emoji)

### UX overhaul (22 Март 2026)
- ✅ Глобален хедър паттерн: scan-style (← icon opacity 0.55 + title inline, 🏠 opacity 0.4, без box backgrounds)
- ✅ Типография: само 3 размера (text-xl / text-base / text-sm)
- ✅ Bold: само в h1 заглавия и card titles — премахнат от бутони, въпроси, отговори, labels
- ✅ Secondary бутони: без border — само NAV.surface фон
- ✅ Навигационни стрелки: само ← → символи (без текст)
- ✅ Основен цвят: #2C3E5D → #4A6FA5 (по-мек, по-малко контрастен)
- ✅ Confirm: карти горе (не центрирани), заглавие в хедъра
- ✅ Quiz екрани: само NAV палитра (без модулни цветове)
- ✅ Drawer меню: "История" → "Дневник"
- ✅ Прогрес бар: сегменти (4 модула) в реда с 🏠 — не отделна лента

### SF-2 + UI redesign (29 Март 2026)
- ✅ **Intermediate quiz-ове МАХНАТИ** — `navigation.ts`: модул 2→3 директно, модул 4→done директно
- ✅ **SF-2: Reinforcement quiz** — phase state machine: `"answering" | "correct" | "wrong" | "fact"`
  - Верен: зелена анимация + confetti + звездички → auto-next (скъсено)
  - Грешен: shake + розово → верният светва зелен → fact screen (скъсено wait)
  - Fact screen: 💡 + `explanation` от AI; fallback → въпрос + верен отговор
  - Ракетата ПРЕМАХНАТА — само синята прогрес лента
  - Прогрес бар: изминати=NAV.btnSolid 100%, текущ=35%, предстоящи=15%
- ✅ **Topbar quiz**: `← Субект · Урок N` bold (scan-style) на всички quiz екрани (въпрос + факт)
- ✅ **Lesson header**: `← Subject · Урок N` + 🏠 в LessonLayoutInner (card + separator)
- ✅ **Sub-header**: `Модул M от 4 · {moduleTitle}` под lesson header
- ✅ **Footer progress**: 5 точки (текуща = pill в MODULE_SURFACE, останали = NAV.border)
- ✅ **FeedbackButton МАХНАТ** от всички екрани
- ✅ **Confirm**: добавено subtitle на урока под хедъра; lesson card title → "Отвори урока"; quiz card без "Спомни си урока"
- ✅ **Done**: lesson header добавен; subtitle на урока под хедъра; "Провери знанията" → white card style с 🏆 (идентична с confirm); "За днес толкова" → "Към началото"
- ✅ **Reinforcement result**: X в "Ти научи X неща днес" = брой **грешни** отговори; "За днес толкова" → "Към началото"
- ✅ **Parent dashboard null safety**: `s.quiz_1 ?? { score: 0, total: 0 }` — стари сесии без quiz поле не crashват
- ✅ **QuizQuestion.explanation**: ново поле в типа + prompt инструкция за AI да генерира 1 изречение обяснение
- ✅ **CSS keyframes**: correct-pop, shake, icon-pop, star-pop, confetti-1..5

### Технически подобрения (2 Април 2026)
- ✅ **Memory leak fix** — `URL.createObjectURL()` се освобождава при грешка в `scan/page.tsx`
- ✅ **Claude JSON валидация** — `validateAdaptation()` в `api/generate/route.ts`; невалидна структура → 422 вместо crash
- ✅ **Original image save** — `writeBinaryFile()` в `github.ts`; оригиналната снимка се записва fire-and-forget до `adaptations/[subject]/lesson-[n]/original.jpg`; само `image/jpeg|png|webp` типове; грешката не блокира потока
- ✅ **Partial learning tracking** — `LearnSession` получи `status?: "completed" | "partial"`; `maybeRecordPartial()` в `LessonLayoutInner` fires при първи → от карта 1/1; `sessionStorage` ключ предотвратява дублиране; badge „Започнат урок" в SessionList; partial се скрива ако completed съществува за същия урок/дата
- ✅ **Минимален тестов слой** — Vitest за unit tests (`navigation.ts`); Playwright E2E за основните flows (home / confirm / quiz / parent); fixtures за adaptation и quiz без реални AI calls

---

## Предстои

- [ ] Изтриване на orphan файл `src/app/[user]/lesson/quiz/page.tsx`
- [ ] Prefetch на следващия route за по-бърза навигация
- [ ] E2E тестове с mock за GitHub (parent dashboard в CI без реален GITHUB_TOKEN)
