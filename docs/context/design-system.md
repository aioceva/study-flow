# Study Flow — Design System

_Последна актуализация: 16 Март 2026_

## Философия

- **Едно действие на екран** — един primary бутон, един ясен следващ ход
- **Структура, не украса** — цветът означава нещо (модул, статус, награда)
- **Без time pressure** — никъде няма таймер или countdowns
- **Dyslexia-friendly** — Adys шрифт, голям line-height, max 65ch ред

---

## Цветови константи (src/types/index.ts)

### NAV палитра — всички nav/home/done екрани

```typescript
export const NAV = {
  headerBg:  "#2C3E5D",   // хедър на Home
  btnSolid:  "#2C3E5D",   // primary бутони (Започни, Напред, Към началото)
  btnBorder: "#2C3E5D",   // outline бутони
  surface:   "#F0F2F5",   // подложка на карти, secondary зони
  bg:        "#FFFFFF",   // фон на nav екрани
  text:      "#2C3E5D",   // основен текст (9.1:1 на бяло ✓)
  textMuted: "#5A6A7E",   // subtitle, helper (4.6:1 на бяло ✓)
  border:    "#E2E5EA",   // бордюр на карти
};
```

### Модулни палитри — само в учебното съдържание

4 нива на всеки модул: bg (светло) → surface → progress → btn (тъмно)

```typescript
// Фон на content area
MODULE_COLORS = { 1: "#EBF4FF", 2: "#E8F9F1", 3: "#FEFAE8", 4: "#F3EEFF" }

// Секции вътре в карта
MODULE_SURFACE = { 1: "#BDD8F7", 2: "#B4E5CC", 3: "#F7E49E", 4: "#D4C4EE" }

// Прогрес бар сегменти
MODULE_PROGRESS = { 1: "#6FA3E8", 2: "#6DC297", 3: "#C49020", 4: "#A384CC" }

// Бутон Напред (бял текст)
MODULE_BTN = { 1: "#3B7DD8", 2: "#3B9E6A", 3: "#9A6E08", 4: "#7B5EA7" }
```

**Правила:**
- Жълт фон (`#FEFAE8`, `#F7E49E`) → тъмен текст `#2C3E5D` или `#9A6E08`
- Никога `#000000` — само `#2C3E5D`
- `MODULE_BTN[3]` (#9A6E08) = акцент за subject·lesson labels навсякъде

---

## Типография

**Шрифт:** Adys.ttf (Bulgarian dyslexia-friendly), fallback: OpenDyslexic, Arial, sans-serif

```css
body {
  font-size: 16px;
  line-height: 1.7;
  letter-spacing: 0.03em;
}
p, li, span {
  max-width: 65ch;
  line-height: 1.8;
  word-spacing: 0.1em;
}
h1, h2, h3 {
  font-weight: 700;
  line-height: 1.3;
}
```

**Размери:**
- `text-xs` (12px) — labels, metadata (предмет)
- `text-sm` (14px) — secondary body
- `text-base` (16px) — основен текст (минимум за параграфи)
- `text-lg` (18px) — module title в navbar
- `text-xl` (20px) — card заглавия, екранни заглавия
- `text-2xl` (24px) — hero (Браво!, Готово!)

---

## Button Press — btn-press клас

**Всички** навигационни бутони имат `btn-press` клас. Без изключения.

```css
/* globals.css */
.btn-press {
  touch-action: manipulation;
  transition: transform 0.15s ease, filter 0.15s ease; /* плавно връщане */
}
.btn-press:active {
  transform: translateY(2px);
  filter: brightness(0.82);
  transition: none; /* мигновено натискане */
}
```

**Защо 150ms navigate delay:** `:active` е видим само докато пръстът е на екрана. Без delay — навигацията се случва на onClick (pointerup) и анимацията не се вижда.

---

## Lesson екрани

### Intro екран (`/lesson/intro`)
- Home иконка (горе вляво)
- `icon-lesson.svg` (96px)
- Заглавие на урока (`text-xl font-bold`)
- Subject label (`text-sm`, `NAV.textMuted`)
- Footer: solid "Започни →" (`NAV.btnSolid`)

### Card екран (`/lesson/[m]/[c]`)
- Progress bar: 4 сегмента (`MODULE_PROGRESS`), само на card pages
- Navbar: home иконка + module title (`NAV.textMuted`)
- Content area: `MODULE_COLORS[moduleId]` фон
- Card title: `text-xl font-bold`
- 3 секции: 📌 Какво е / 💡 Защо е важно / ✏️ Пример
  - Секция bg: `MODULE_SURFACE[moduleId]`
  - Секция label: `MODULE_BTN[moduleId]` цвят
- Footer: ‹ back (46×46px outline) + "Напред →" (`MODULE_BTN[moduleId]`)

### Separator/Браво екран (`/lesson/separator`)
- Home иконка
- 🎉 (text-7xl), "Браво!", subject·lesson label (`MODULE_BTN[3]`)
- Footer: ‹ back + "Напред →" (`NAV.btnSolid`)

### Done екран (`/done`)
- `icon-trophy-glow.svg` (96px) — SVG paths, **НЕ emoji в `<text>`**
- "Готово!", score card (зелено ≥80% / жълто <80%)
- Footer: "Вземи теста за преговор →" + "Към началото"

### Home екран (`/[user]`)
- Хедър: `NAV.headerBg` с 👋, "Здравей, {name}!"
- Outline бутон "📷 Сканирай нов урок"
- Lesson tiles: `NAV.surface` bg, цветна точка за предмет, "Отвори урока"

---

## Layout структура

```tsx
<div className="flex flex-col" style={{ height: "100dvh" }}>
  {/* nav/progress bar — flex-none */}
  {/* content — flex-1 overflow-y-auto */}
  {/* footer с бутони — flex-none, pb-6 */}
</div>
```

- Никога `position: fixed` за footer — само flexbox
- `height: 100dvh` (не `min-h-screen`) за мобилни браузъри
- Padding на страница: `px-4`
- Footer padding: `px-4 pb-6 pt-3`
- Back бутон: `width: 46px, height: 46px`

---

## SVG икони (public/icons/)

| Файл | Екран | Бележка |
|------|-------|---------|
| `icon-lesson.svg` | Intro | Книга/урок икона |
| `icon-trophy-glow.svg` | Done | Купа с лъчи — SVG paths |
| `icon-welcome.svg` | Home (опционален) | |

**ВАЖНО:** Никога emoji в SVG `<text>` елемент — не се рендерира на iOS Safari. Използвай `<path>`, `<rect>`, `<circle>`.
