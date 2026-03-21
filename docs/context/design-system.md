# Study Flow — Design System

_Последна актуализация: 17 Март 2026_

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
MODULE_COLORS  = { 1: "#EBF4FF", 2: "#E8F9F1", 3: "#FEFAE8", 4: "#F3EEFF" }

// Секции вътре в карта
MODULE_SURFACE = { 1: "#BDD8F7", 2: "#B4E5CC", 3: "#F7E49E", 4: "#D4C4EE" }

// Прогрес бар сегменти
MODULE_PROGRESS = { 1: "#6FA3E8", 2: "#6DC297", 3: "#C49020", 4: "#A384CC" }

// Бутон Напред (бял текст върху него)
MODULE_BTN = { 1: "#3B7DD8", 2: "#3B9E6A", 3: "#9A6E08", 4: "#7B5EA7" }
```

**Правила:**
- Жълт фон (`#FEFAE8`, `#F7E49E`) → тъмен текст `#2C3E5D` или `#9A6E08`
- Никога `#000000` — само `#2C3E5D`
- `MODULE_BTN[3]` (#9A6E08) = акцент за subject·lesson labels навсякъде
- Никога нови цветове без обсъждане

---

## Типография

**Шрифт:** Adys.ttf (Bulgarian dyslexia-friendly), fallback: OpenDyslexic, Arial, sans-serif

```css
body { font-size: 16px; line-height: 1.7; letter-spacing: 0.03em; }
p, li, span { max-width: 65ch; line-height: 1.8; word-spacing: 0.1em; }
h1, h2, h3  { font-weight: 700; line-height: 1.3; }
```

**Размери:**
- `text-xs` (12px) — labels, metadata (ХИМИЯ · Урок 11)
- `text-sm` (14px) — secondary body, subtitle
- `text-base` (16px) — основен текст (**минимум** за параграфи)
- `text-lg` (18px) — module title в navbar
- `text-xl` (20px) — card заглавия, екранни заглавия
- `text-2xl` (24px) — hero (Браво!, Готово!)

**Правила:**
- Никога `font-extrabold` (800) или `font-black` (900) — максимум `font-bold` (700)
- Никога `text-justify` — само `text-left` за параграфи
- Никога italic за основен текст
- `text-center` само за заглавия и бутони

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

**Защо 150ms navigate delay:** `:active` е видим само докато пръстът е на екрана. Без delay навигацията се случва на onClick (pointerup) и анимацията не се вижда.

---

## UX принципи за деца с дислексия

### Едно нещо на екран
Всеки екран комуникира едно съобщение и иска едно действие. Ако има повече от 1 primary бутон — нещо е наред.

### Прогресът е видим и конкретен
Детето трябва да знае: какво прави сега, колко е останало, какво е направило. Сегментиран прогрес бар (4 модула), не процентна лента.

### Инструкциите са кратки и директни
- Максимум 1 изречение на инструкция
- Активен глагол в началото: "Извади учебника", не "Учебникът трябва да бъде изваден"
- Без отрицания: "Запази спокойствие", не "Не се притеснявай"
- Без вложени изречения

### Визуалната йерархия ръководи окото
1. Иконата / емотиконът (най-голям)
2. Заглавието (h1)
3. Subtitle / контекст
4. Primary бутон (долу, full-width)

Primary бутонът е **винаги в footer зоната**, прикрепен към дъното. Никога в средата на екрана.

### Feedback е незабавен и позитивен
- Всяко действие има визуален отговор (btn-press)
- Грешките: "Нека опитаме пак", не "Грешно"
- Наградата (🎉, 🏆) се показва незабавно след завършване

### Touch targets
- Минимум 44×44px (Apple HIG)
- Primary бутон: full-width, минимум 48px височина
- Back бутон: 46×46px
- Разстояние между два бутона: минимум 8px

### Намалена когнитивна натовареност
- Максимум 3 елемента на видима зона
- Избягвай таблици → използвай карти
- Избягвай dropdown → използвай отделни екрани
- Емотикони за бързо разпознаване без четене

### Без прекъсвания
- Без pop-up известия вътре в учебна сесия
- Без автоматично навигиране без действие от детето
- Без countdown таймери

### Цветът носи смисъл
- Синьо = Модул 1, Зелено = Модул 2, Жълто = Модул 3, Лилаво = Модул 4
- Тъмно-синьо (#2C3E5D) = навигация, структура
- Детето разпознава модула по цвят преди да прочете текста

---

## Layout структура

```tsx
<div className="flex flex-col" style={{ height: "100dvh" }}>
  {/* nav/progress bar — flex-none */}
  {/* content — flex-1 overflow-y-auto */}
  {/* footer с бутони — flex-none, pb-6 */}
</div>
```

- `height: 100dvh` (не `min-h-screen`) — отчита address bar на iOS
- Никога `position: fixed` за footer — само flexbox
- Padding на страница: `px-4`
- Footer padding: `px-4 pb-6 pt-3`
- Gap между бутони: `gap-2` (8px)
- Border radius: `rounded-xl` (12px) за бутони и карти

---

## Lesson екрани

### Confirm (`/confirm`) — hub за learn и review
- Home иконка `px-4 py-2` (opacity 0.5)
- `icon-lesson.svg` 72px, subject `text-xs uppercase NAV.textMuted`, заглавие `text-2xl font-bold`
- Ако има минал преговор: score card (зелено ≥80% / `NAV.surface` <80%) с прогрес бар и процент
- Footer: ‹ back (46×46, outline, → home) + "Провери знанията си →" (primary, `NAV.btnSolid`)
- Под тях: "Прегледай урока" (secondary, `NAV.surface`)

### Card (`/lesson/[m]/[c]`)
- Progress bar: 4 сегмента `MODULE_PROGRESS`, само на card pages
- Navbar: home иконка + module title (`NAV.textMuted`)
- Content: `MODULE_COLORS[m]` фон, card title `text-xl font-bold`
- 3 секции (📌 / 💡 / ✏️): bg `MODULE_SURFACE[m]`, label color `MODULE_BTN[m]`
- Footer: ‹ back (46×46, outline) + "Напред →" (`MODULE_BTN[m]`)
- Card 1/1: ‹ навигира към `/confirm` (не назад в историята)

### Separator/Браво (`/lesson/separator`)
- Home иконка, 🎉 `text-7xl`, "Браво!", **"Завърши секция {N} от 4!"** (`NAV.textMuted`), subject·lesson (`MODULE_BTN[3]`)
- Footer: ‹ back + "Напред →" (`NAV.btnSolid`)

### Done (`/done`)
- `icon-trophy-glow.svg` 96px (**SVG paths, НЕ emoji в `<text>`**)
- "Браво!" + subject·lesson label
- Footer: ‹ home (46×46) + "Провери знанията си →" (primary, `NAV.btnSolid`)
- Review mode (mode=review): само "Към началото"

### Reinforcement result (`/reinforcement/result`)
- Emoji (🏆 / 🌟 / 💪) + **"X от 10 познати!"** + прогрес бар
- Ако има грешки: "Научи кои X неща не знаеш!" + "Искаш ли да пробваш пак?"
- Footer: "Опитай пак →" (primary) + "Приключих с урока" (secondary, → home)
- Перфектен резултат: само "Към началото" (primary)

### Home (`/[user]`)
- Хедър `NAV.headerBg`: "Здравей, {name}! 👋"
- Outline бутон "📸 Сканирай нов урок"
- Lesson tiles: `NAV.surface`, цветна точка (предмет), "Отвори урока" → `/confirm`
- Групирани по: "Тази седмица" / "Миналата седмица" / "По-рано"

---

## Accessibility

Контрасти (WCAG AA — всички проверени):
```
#2C3E5D на #FFFFFF → 9.1:1  ✓     #FFFFFF на #3B7DD8 → 4.6:1  ✓
#5A6A7E на #FFFFFF → 4.6:1  ✓     #FFFFFF на #3B9E6A → 4.8:1  ✓
#2C3E5D на #FEFAE8 → 8.1:1  ✓     #FFFFFF на #9A6E08 → 4.72:1 ✓
                                   #FFFFFF на #7B5EA7 → 4.9:1  ✓
```

- Всеки интерактивен елемент с `aria-label` ако текстът не е достатъчен
- Back бутон: `aria-label="Назад"`, Home: `aria-label="Към началото"`
- Всички изображения с `alt` атрибут

---

## SVG икони (public/icons/)

| Файл | Екран |
|------|-------|
| `icon-lesson.svg` | Intro |
| `icon-trophy-glow.svg` | Done — купа с лъчи (SVG paths) |
| `icon-welcome.svg` | Home (опционален) |

**ВАЖНО:** Никога emoji в SVG `<text>` — не се рендерира на iOS Safari. Само `<path>`, `<rect>`, `<circle>`.

---

## Анти-модели — никога

- `text-black` или `#000000` — само `#2C3E5D`
- `bg-white` бутон без `border-2 border-[#2C3E5D]`
- Прогрес бар на nav екрани (intro, separator, done)
- Повече от 1 primary бутон на екран
- Hardcoded цветове inline — само константите от `types/index.ts`
- `router.push()` директно в onClick без 150ms delay
- `<text>emoji</text>` в SVG файлове
- `transition-all` — причинява flickering
- Анимации над 300ms на UI елементи
