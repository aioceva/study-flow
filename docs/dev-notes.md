# Study Flow — Dev Notes & Капани

_Последна актуализация: 17 Март 2026_

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

// ❌ ГРЕШНО — старата версия имаше собствен UI тук
```

### Динамичният [user] route поглъща всичко

`/preview`, `/test`, `/ui-test` се routing-ват като username="preview".
Никога не създавай такива routes в main branch.

---

## iOS / Mobile капани

### CSS :active без navigate delay не работи

`:active` е видим само докато пръстът е на екрана. `onClick` fires на `pointerup`.
Ако `router.push()` се извика директно в `onClick` — страницата се сменя преди анимацията да се види.

```tsx
// ❌ ГРЕШНО
<button onClick={() => router.push(url)}>

// ✅ ПРАВИЛНО
function navigate(url: string) {
  setTimeout(() => startTransition(() => router.push(url)), 150);
}
<button onClick={() => navigate(url)}>
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
React error #300 ако не е спазено.

### Lazy useState за sessionStorage (избягва "Зарежда...")

```tsx
// ❌ БАВНО — зарежда се в useEffect, показва loading state
const [adaptation, setAdaptation] = useState<Adaptation | null>(null);

// ✅ БЪРЗО — синхронно от sessionStorage при първи render
const [adaptation, setAdaptation] = useState<Adaptation | null>(() => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("adaptation");
  return raw ? (JSON.parse(raw) as Adaptation) : null;
});
```

### startTransition около router.push

```tsx
// По-плавна навигация — текущият екран остава докато новият се зарежда
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
Проверено е в `vercel.json`.

### git push rejected

Ако remote има нови commits: `git pull --rebase && git push`

---

## Имплементирани функционалности (Март 2026)

- ✅ Сканиране и AI генерация (Claude Vision + Claude)
- ✅ Rate limiting: 1 адаптация на 24 часа (`rate-limit.json` в GitHub)
- ✅ 4 модула × 5 карти с swipe навигация
- ✅ Quiz 1 (след модул 2) + Quiz 2 (след модул 4)
- ✅ Reinforcement quiz (10 random от 20)
- ✅ Reinforcement result: "X от 10 познати!", "Опитай пак" / "Приключих с урока"
- ✅ Запис на сесии в `sessions.json`
- ✅ Home с последни уроци tiles (групирани по дата)
- ✅ Confirm екран: hub за learn/review, показва последен резултат от преговор
- ✅ Separator / Done екрани (консистентен дизайн)
- ✅ Separator показва "Завърши секция X от 4!"
- ✅ btn-press анимация на всички бутони
- ✅ Консистентен ‹ back бутон на всички екрани
- ✅ Anti-flickering (lazy adaptation с subject/lesson валидация, startTransition, null page.tsx)
- ✅ SVG trophy icon (без emoji)

## Предстои

- [ ] Родителски изглед (`/[user]/parent`)
- [ ] Prefetch на следващия route за по-бърза навигация
