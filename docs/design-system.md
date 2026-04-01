# Study Flow — Design System

_Последна актуализация: 29 Март 2026_

## Философия

- **Едно действие на екран** — един primary бутон, един ясен следващ ход
- **Структура, не украса** — цветът означава нещо (модул, статус, награда)
- **Без time pressure** — никъде няма таймер или countdowns
- **Dyslexia-friendly** — Adys шрифт, голям line-height, max 65ch ред
- **Apple-style чистота** — светла палитра, малко елементи, много въздух

---

## Cursor правило

**Глобално, дефинирано в `globals.css`:**

```css
button, a, [role="button"] { cursor: pointer; }
button:disabled               { cursor: default; }
```

- Всеки `<button>`, `<a>` и `[role="button"]` → `cursor: pointer`
- Disabled бутон → `cursor: default`
- Не-clickable елементи → не добавяй `cursor: pointer` ръчно
- Ако добавяш clickable div/span → задължително добави `role="button"` за a11y и cursor

---

## Цветови константи (src/types/index.ts)

### NAV палитра — всички nav/home/done екрани

```typescript
export const NAV = {
  headerBg:  "#4A6FA5",   // хедър на Home
  btnSolid:  "#4A6FA5",   // primary бутони (Започни, Напред, Към началото)
  surface:   "#F0F2F5",   // подложка на карти, secondary зони
  bg:        "#FFFFFF",   // фон на nav екрани
  text:      "#4A6FA5",   // основен текст
  textMuted: "#5A6A7E",   // subtitle, helper
  border:    "#E2E5EA",   // бордюр на карти
};
```

> **Смяна от #2C3E5D на #4A6FA5** (22 Март 2026) — по-мек, по-малко контрастен синьо. По-приятелски за детски интерфейс.

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
- Жълт фон (`#FEFAE8`, `#F7E49E`) → тъмен текст `#4A6FA5` или `#9A6E08`
- Никога `#000000` — само `#4A6FA5`
- `MODULE_BTN[3]` (#9A6E08) = акцент за subject·lesson labels навсякъде
- Никога нови цветове без обсъждане
- Quiz екрани: НЕ използват модулни цветове — само NAV палитра (NAV.bg, NAV.surface)

---

## Типография

**Шрифт:** Adys.ttf (Bulgarian dyslexia-friendly), fallback: OpenDyslexic, Arial, sans-serif

```css
body { font-size: 16px; line-height: 1.7; letter-spacing: 0.03em; }
p, li, span { max-width: 65ch; line-height: 1.8; word-spacing: 0.1em; }
```

### Само 3 размера — без изключения

| Клас | px | Употреба |
|------|----|----------|
| `text-xl` | 20px | Заглавия (h1 хедъри, card titles, "Браво!", "Готово!") |
| `text-base` | 16px | Основен текст, бутони, въпроси и отговори в quiz, съдържание в карти |
| `text-sm` | 14px | Метаданни ("ХИМИЯ · УРОК 11"), helper текст, module labels |

**Никога:** `text-xs`, `text-lg`, `text-2xl`, `text-3xl` или inline `font-size`.

### Bold правило — само заглавия

- **`font-bold` САМО за:** h1 на екран, card titles в урок, "Браво!", "Готово!"
- **НЕ bold:** бутони (→ `font-medium`), въпроси в quiz, отговори, текст в секции, метаданни, section labels (КАКВО Е, ЗАЩО Е ВАЖНО)
- **Правило:** Ако се питаш дали е "заглавие" — ако не е h1 или card title, не е bold

```tsx
// ✅ Bold — заглавия
<h1 className="text-xl font-bold">Химично уравнение</h1>
<h2 className="text-xl font-bold">Пример от живота</h2>

// ✅ font-medium — бутони, labels
<button className="text-base font-medium">Снимай</button>
<p className="text-sm font-medium uppercase">ХИМИЯ · УРОК 11</p>

// ❌ ГРЕШНО — bold в бутон, въпрос, отговор
<button className="font-bold">Напред</button>
<p className="font-semibold">А. Водородът реагира с кислорода</p>
```

---

## Хедър паттерн (scan-style) — всички екрани извън урока

Референция: `src/app/[user]/scan/page.tsx`

```tsx
<div className="flex-none flex items-center justify-between px-4 py-3">
  {/* Ляво: ← icon + заглавие inline */}
  <div className="flex items-center gap-2">
    <button
      className="btn-press w-8 h-8 flex items-center justify-center"
      style={{ opacity: 0.55 }}
      aria-label="Назад"
    >
      <svg width="20" height="20" ...>
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
    </button>
    <h1 className="text-xl font-bold" style={{ color: NAV.text }}>
      Заглавие на екрана
    </h1>
  </div>
  {/* Дясно: home icon */}
  <button
    className="btn-press w-8 h-8 flex items-center justify-center"
    style={{ opacity: 0.4 }}
    aria-label="Начало"
  >
    <svg width="20" height="20" ...>home path</svg>
  </button>
</div>
```

**Правила:**
- Без box background около икони (без `backgroundColor: NAV.surface`)
- ← icon: `opacity: 0.55`, 🏠 icon: `opacity: 0.4`
- Заглавието е винаги `text-xl font-bold` — написва контекста на екрана
- Екрани без back button (home, done): само 🏠 вдясно

---

## Бутони

### Primary бутон
```tsx
<button
  className="btn-press w-full rounded-xl py-3.5 text-white font-medium text-base flex items-center justify-center gap-2"
  style={{ backgroundColor: NAV.btnSolid }}
>
  Действие
</button>
```

### Secondary бутон — БЕЗ border
```tsx
<button
  className="btn-press w-full rounded-xl py-3.5 font-medium text-base"
  style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
>
  Второстепенно действие
</button>
```

**Правила:**
- Никога `border` / `outline` стил за secondary бутони — само `NAV.surface` фон
- Навигационни стрелки: само `←` и `→` символи (без текст "Назад" / "Напред")
- Изключение: финални action бутони могат да имат текст ("Към началото", "Опитай пак")
- Primary бутон е **винаги в footer зоната**, прикрепен към дъното

### Навигационни ← → бутони (в урок и quiz)
```tsx
// ← (secondary, ляво)
<button style={{ backgroundColor: NAV.surface }}>←</button>
// → (primary, дясно) — винаги NAV.btnSolid, независимо от активния модул
<button style={{ backgroundColor: NAV.btnSolid }}>→</button>
```

---

## Фонова подложка (глобално правило)

**Всеки екран** трябва да има `backgroundColor: NAV.bg` (`#FFFFFF`).
Съдържанието е в карти/секции с `NAV.surface` (`#F0F2F5`) фон.

```tsx
// ✅ Всеки екран
<div style={{ height: "100dvh", backgroundColor: NAV.bg }}>
  ...
</div>
```

Без "голо" съдържание (текст директно на прозрачен фон без подложка).
Lesson екрани използват `MODULE_COLORS[m]` вместо `NAV.bg` за content зоната.

---

## Button Press — btn-press клас

**Всички** навигационни бутони имат `btn-press` клас. Без изключения.

```css
/* globals.css */
.btn-press {
  touch-action: manipulation;
  transition: transform 0.15s ease, filter 0.15s ease;
}
.btn-press:active {
  transform: translateY(2px);
  filter: brightness(0.82);
  transition: none;
}
```

**Защо 150ms navigate delay:** `:active` е видим само докато пръстът е на екрана.

---

## UX принципи за деца с дислексия

### Едно нещо на екран
Всеки екран комуникира едно съобщение и иска едно действие. Ако има повече от 1 primary бутон — нещо е наред.

### Прогресът е видим и конкретен
Детето трябва да знае: какво прави сега, колко е останало, какво е направило.
- В урок: 5 точки в footer зоната (текущата = pill в цвета на модула, останалите = NAV.border)
- В quiz: 5 сегмента в реда с 🏠 иконата (не dots, не отделна лента)
- Никога процентни стойности пред детето

### Инструкциите са кратки и директни
- Максимум 1 изречение на инструкция
- Активен глагол в началото
- Без отрицания, без вложени изречения

### Визуалната йерархия ръководи окото
1. Иконата / емотиконът (най-голям)
2. Заглавието (h1, text-xl font-bold)
3. Subtitle / контекст (text-sm)
4. Primary бутон (долу, full-width)

### Feedback е незабавен и позитивен
- Всяко действие има визуален отговор (btn-press)
- Грешките: "Нека опитаме пак", не "Грешно"
- Наградата (🎉, 🏆) се показва незабавно след завършване

### Touch targets
- Минимум 44×44px (Apple HIG)
- Primary бутон: full-width, минимум 48px височина
- Back / Home икона: 32×32px tap area (w-8 h-8), без видим box
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
- `#4A6FA5` = навигация, структура (NAV елементи)
- Детето разпознава модула по цвят преди да прочете текста

---

## Layout структура

```tsx
<div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
  {/* хедър / progress row — flex-none */}
  {/* content — flex-1 overflow-y-auto */}
  {/* footer с бутони — flex-none, pb-6 */}
</div>
```

- `height: 100dvh` (не `min-h-screen`) — отчита address bar на iOS
- Никога `position: fixed` за footer — само flexbox
- Padding на страница: `px-4` или `px-5`
- Footer padding: `px-4 pb-6 pt-3`
- Gap между бутони: `gap-2` (8px)
- Border radius: `rounded-xl` (12px) за бутони и карти

---

## Описание на екраните

### Home (`/[user]`)
- Хедър `NAV.headerBg` (тъмна лента): "Здравей, {name}! 👋"
- Lesson tiles: `NAV.surface`, цветна точка (предмет), заглавие
- Групирани по: "Тази седмица" / "Миналата седмица" / "По-рано"
- "Сканирай нов урок" бутон: secondary стил (NAV.surface, без border)
- Drawer меню: "Дневник" (не "История") за родителски изглед

### Confirm (`/confirm`) — hub за learn и review
- Хедър: scan-style ← + "{subjectLabel} · Урок {lesson}" + 🏠
- Subtitle: заглавие на урока под хедъра (text-base, NAV.text)
- Lesson card: бяла карта + shadow, title = "Отвори урока", горе (не центрирана)
- Quiz card (само ако има минали сесии): бяла карта + shadow, label "ПРОВЕРКА НА ЗНАНИЯТА" + 🏆 кръг; **БЕЗ** "Спомни си урока" текст
- Без FeedbackButton

### Card (`/lesson/[m]/[c]`)
- Header: `← {Subject} · Урок {N}` (`text-xl font-bold NAV.text`) + 🏠
- Sub-header: `Модул {M} от 4 · {moduleTitle}` (`text-sm NAV.textMuted`)
- Content: `MODULE_COLORS[m]` фон, card title `text-xl font-bold NAV.text`
- 3 секции (📌 / 💡 / ✏️): bg `MODULE_SURFACE[m]` + shadow (`0 2px 8px rgba(0,0,0,0.06)`), label `MODULE_BTN[m]` uppercase, body `NAV.text`
- Footer: 5 точки прогрес (текущата = pill в `MODULE_SURFACE[m]`, останалите = `NAV.border`) + `←` (`NAV.surface`) + `→` (`NAV.btnSolid`)
- **→ бутон е ВИНАГИ NAV.btnSolid** — независимо от активния модул

### Reinforcement Quiz (`/reinforcement/quiz`) — SF-2
- Topbar: `← Субект · Урок N` (bold, scan-style) + 🏠 — идентично с всички екрани
- Progress bar под topbar: хоризонтална лента; изминати=NAV.btnSolid 100%, текущ=35%, предстоящи=15%
- **Без ракета** — само синята лента
- Въпрос: `text-base` (НЕ bold), NAV.text
- Отговори: `NAV.surface` карти, `text-base` (НЕ bold)
- **Phase state machine:**
  - `answering` — детето избира
  - `correct` — зелена анимация, confetti, звездички → auto-next (кратко)
  - `wrong` — shake + розово → верният светва зелен (кратко чакане) → `fact`
  - `fact` — 💡 + `explanation` от AI (fallback: въпрос + верен отговор) + "→ Напред" бутон
- **Без FeedbackButton**, без ← бутон, без текстово feedback поле
- При верен: звездички се показват при p≥0.93 на прогрес лентата

### Separator/Браво (`/lesson/separator`)
- Без back бутон
- 🎉 `text-7xl`, "Браво!" (`text-xl font-bold`), "Завърши секция {N} от 4!" (`text-sm NAV.textMuted`)
- Footer: само `→` (`NAV.btnSolid`)

### Done (`/done`)
- Хедър: scan-style ← (→ home) + "{subjectLabel} · Урок {lesson}" + 🏠
- Subtitle: заглавие на урока под хедъра
- `icon-trophy-glow.svg` 96px (SVG paths, НЕ emoji в `<text>`) + "Браво!" + subtitle
- Footer (learn mode): бяла карта с 🏆 "ПРОВЕРКА НА ЗНАНИЯТА" (идентична с confirm quiz card) + secondary "Към началото"
- Footer (review mode): само "Към началото" primary
- Без FeedbackButton, без LessonCard в центъра

### Reinforcement result (`/reinforcement/result`)
- Emoji + **"X от 10"** (без удивителни)
- Прогрес бар (без % стойности пред детето)
- Описателен текст: "Ти научи X неща днес" — **X = брой ГРЕШНИ отговори** (не верни)
- Footer: "Опитай пак →" (primary) + "Към началото" (secondary, без border)

### Дневник (`/[user]/parent`) — за родителя
- Горен блок: обобщение (брой сесии, минути, среден резултат, последна активност)
- Среден блок: хронологичен списък сесии (дата, предмет, урок, продължителност, резултат)

---

## Accessibility

- Всеки интерактивен елемент с `aria-label` ако текстът не е достатъчен
- Back бутон: `aria-label="Назад"`, Home: `aria-label="Начало"`
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

- `text-black` или `#000000` — само `#4A6FA5`
- `border` / `outline` стил за secondary бутони — само `NAV.surface` фон
- `font-bold` в бутони, въпроси, отговори, body текст
- Повече от 3 font sizes на един екран
- `text-xs`, `text-lg`, `text-2xl` — само `text-sm`, `text-base`, `text-xl`
- Box background около back/home икони (без `backgroundColor: NAV.surface` на icon бутони)
- Прогрес лента на nav екрани (separator, done, confirm)
- Повече от 1 primary бутон на екран
- Hardcoded цветове inline — само константите от `types/index.ts`
- `router.push()` директно в onClick без 150ms delay
- `<text>emoji</text>` в SVG файлове
- `transition-all` — причинява flickering
- Модулни цветове в quiz екрани — само NAV палитра там
