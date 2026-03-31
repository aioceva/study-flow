"use client";

import Link from "next/link";

const NAV = {
  headerBg: "#4A6FA5",
  btnSolid: "#4A6FA5",
  surface: "#F0F2F5",
  bg: "#FFFFFF",
  text: "#4A6FA5",
  textMuted: "#5A6A7E",
  border: "#E2E5EA",
};

const MODULE_COLORS = { 1: "#EBF4FF", 2: "#E8F9F1", 3: "#FEFAE8", 4: "#F3EEFF" };
const MODULE_SURFACE = { 1: "#BDD8F7", 2: "#B4E5CC", 3: "#F7E49E", 4: "#D4C4EE" };
const MODULE_BTN = { 1: "#3B7DD8", 2: "#3B9E6A", 3: "#9A6E08", 4: "#7B5EA7" };

function LessonCardMock() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: MODULE_COLORS[1],
        border: `1px solid ${NAV.border}`,
        boxShadow: "0 4px 24px rgba(74,111,165,0.10)",
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        maxWidth: 340,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: NAV.headerBg }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>←</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            БИОЛОГИЯ · Урок 5
          </span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⌂</span>
      </div>
      {/* Sub-header */}
      <div className="px-4 py-2" style={{ backgroundColor: MODULE_COLORS[1] }}>
        <p style={{ color: NAV.textMuted, fontSize: 13, margin: 0 }}>
          Модул 1 от 4 · Клетъчно дишане
        </p>
      </div>
      {/* Card content */}
      <div className="px-4 pb-2">
        <h2 style={{ color: NAV.text, fontWeight: 700, fontSize: 17, margin: "8px 0 12px" }}>
          Какво е клетъчно дишане?
        </h2>
        {[
          { icon: "📌", label: "КАКВО Е", text: "Клетъчното дишане е процес, при който клетката превръща глюкозата в енергия." },
          { icon: "💡", label: "ЗАЩО Е ВАЖНО", text: "Без тази енергия клетката не може да работи." },
          { icon: "✏️", label: "ПРИМЕР", text: "Когато тичаш, мускулните ти клетки дишат по-бързо." },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-3 py-2 mb-2"
            style={{ backgroundColor: MODULE_SURFACE[1], boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <p style={{ color: MODULE_BTN[1], fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>
              {s.icon} {s.label}
            </p>
            <p style={{ color: NAV.text, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
          </div>
        ))}
      </div>
      {/* Footer progress */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: i === 2 ? 18 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 2 ? MODULE_SURFACE[1] : NAV.border,
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl flex items-center justify-center"
            style={{ width: 40, height: 40, backgroundColor: NAV.surface, color: NAV.text, fontSize: 18 }}
          >←</button>
          <button
            className="rounded-xl flex items-center justify-center"
            style={{ width: 40, height: 40, backgroundColor: NAV.btnSolid, color: "#fff", fontSize: 18 }}
          >→</button>
        </div>
      </div>
    </div>
  );
}

function QuizCardMock() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: NAV.bg,
        border: `1px solid ${NAV.border}`,
        boxShadow: "0 4px 24px rgba(74,111,165,0.10)",
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        maxWidth: 340,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: NAV.headerBg }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>←</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            БИОЛОГИЯ · Урок 5
          </span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⌂</span>
      </div>
      {/* Progress bar */}
      <div className="flex gap-1 px-4 py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor:
                i < 3 ? NAV.btnSolid : i === 3 ? `${NAV.btnSolid}55` : NAV.border,
            }}
          />
        ))}
      </div>
      {/* Question */}
      <div className="px-4 pt-2 pb-3">
        <p style={{ color: NAV.text, fontSize: 15, lineHeight: 1.7, margin: "0 0 14px" }}>
          Какво произвежда клетъчното дишане?
        </p>
        {["Вода и въглероден диоксид", "Енергия (АТФ)", "Кислород", "Глюкоза"].map((opt, idx) => (
          <div
            key={opt}
            className="rounded-xl px-4 py-3 mb-2"
            style={{
              backgroundColor: idx === 1 ? "#E8F9F1" : NAV.surface,
              border: idx === 1 ? `1.5px solid #3B9E6A` : `1px solid ${NAV.border}`,
              color: idx === 1 ? "#3B9E6A" : NAV.text,
              fontSize: 14,
              fontWeight: idx === 1 ? 500 : 400,
              cursor: "default",
            }}
          >
            {["А.", "Б.", "В.", "Г."][idx]} {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCardMock() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: NAV.bg,
        border: `1px solid ${NAV.border}`,
        boxShadow: "0 4px 24px rgba(74,111,165,0.10)",
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        maxWidth: 340,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: NAV.headerBg }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>←</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            БИОЛОГИЯ · Урок 5
          </span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⌂</span>
      </div>
      {/* Result content */}
      <div className="flex flex-col items-center px-5 py-6 gap-2">
        {/* Trophy SVG */}
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="22" y="8" width="20" height="26" rx="10" fill="#E8C04A" />
          <rect x="8" y="8" width="10" height="16" rx="5" fill="#F0D070" />
          <rect x="46" y="8" width="10" height="16" rx="5" fill="#F0D070" />
          <rect x="26" y="34" width="12" height="6" rx="2" fill="#E8C04A" />
          <rect x="20" y="40" width="24" height="6" rx="3" fill="#E8C04A" />
        </svg>
        <h2 style={{ color: NAV.text, fontWeight: 700, fontSize: 20, margin: "4px 0 0" }}>
          Браво!
        </h2>
        <p style={{ color: NAV.textMuted, fontSize: 13, margin: 0 }}>Биология · Урок 5</p>
        {/* Score bar */}
        <div className="w-full mt-3">
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 10, backgroundColor: NAV.surface }}
          >
            <div
              style={{ width: "80%", height: "100%", backgroundColor: NAV.btnSolid, borderRadius: 9999 }}
            />
          </div>
          <p style={{ color: NAV.textMuted, fontSize: 13, marginTop: 6, textAlign: "center" }}>
            8 от 10
          </p>
        </div>
        <p style={{ color: NAV.text, fontSize: 14, textAlign: "center", margin: "4px 0 8px" }}>
          Ти научи 2 нови неща днес.
        </p>
        <button
          className="w-full rounded-xl py-3"
          style={{ backgroundColor: NAV.btnSolid, color: "#fff", fontSize: 15, fontWeight: 500 }}
        >
          Към началото
        </button>
        <button
          className="w-full rounded-xl py-3"
          style={{ backgroundColor: NAV.surface, color: NAV.textMuted, fontSize: 15 }}
        >
          Опитай пак
        </button>
      </div>
    </div>
  );
}

const whyItems = [
  { icon: "🔤", title: "Ясен шрифт", desc: "Специален шрифт за деца с дислексия. Буквите са лесни за разпознаване и намаляват объркването." },
  { icon: "📏", title: "Кратки изречения", desc: "Една идея в изречение. Без дълги и сложни конструкции." },
  { icon: "🃏", title: "Карти вместо параграфи", desc: "Урокът е разделен на малки стъпки, което улеснява обработката на информация." },
  { icon: "🌈", title: "Спокойна визия", desc: "Чист екран, меки цветове и достатъчно разстояние. Намалява се визуалното натоварване." },
  { icon: "🔁", title: "Затвърждаване", desc: "Кратък тест помага на детето да запомни наученото. Може да се повтаря, докато понятията се усвоят." },
  { icon: "⏱️", title: "Без напрежение", desc: "Няма таймер. Детето учи в собствено темпо." },
  { icon: "📊", title: "Дневник за родителя", desc: "Виждаш дали детето учи и къде има нужда от помощ." },
];

const howItems = [
  { icon: "📸", step: "1", title: "Качваш урок", desc: "Снимка от учебника или текст" },
  { icon: "✨", step: "2", title: "Ние го адаптираме", desc: "Урокът става на кратки карти с прост език" },
  { icon: "🧠", step: "3", title: "Детето учи", desc: "Самостоятелно, в собствено темпо" },
  { icon: "📊", step: "4", title: "Ти следиш", desc: "Виждаш как се справя в родителския дневник" },
];

export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: NAV.bg,
        color: NAV.text,
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        lineHeight: 1.75,
        letterSpacing: "0.02em",
        minHeight: "100vh",
      }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `0.5px solid ${NAV.border}`,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 17, color: NAV.text }}>Study Flow</span>
        <Link
          href="/join"
          className="rounded-xl px-5 py-2 text-white font-medium text-sm"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Присъедини се
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="px-5 pt-16 pb-12 flex flex-col items-center text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
        <span
          className="inline-block rounded-full px-4 py-1 mb-6 text-sm font-medium"
          style={{ backgroundColor: MODULE_COLORS[1], color: MODULE_BTN[1] }}
        >
          Пилот · Април–Май 2026
        </span>
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 40px)",
            fontWeight: 700,
            color: NAV.text,
            lineHeight: 1.25,
            margin: "0 0 16px",
            maxWidth: 520,
          }}
        >
          Детето учи.
          <br />
          Ти спестяваш часове.
        </h1>
        <p style={{ fontSize: 16, color: NAV.textMuted, maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.8 }}>
          Study Flow помага на деца с дислексия да учат по-лесно и самостоятелно.
          Качваш урок. Приложението го превръща в кратки, разбираеми карти.
        </p>
        <Link
          href="/join"
          className="inline-block rounded-xl px-8 py-4 text-white font-medium text-base"
          style={{ backgroundColor: NAV.btnSolid, fontSize: 15 }}
        >
          Присъедини се към пилота →
        </Link>

        {/* Hero screenshot */}
        <div className="mt-12 w-full" style={{ maxWidth: 380 }}>
          <LessonCardMock />
        </div>
      </section>

      {/* ── ПРОБЛЕМЪТ ── */}
      <section
        className="px-5 py-14"
        style={{ backgroundColor: NAV.surface }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN[3], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Проблемът
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAV.text, marginBottom: 24, lineHeight: 1.35 }}>
            Учебниците не са пригодени за деца с дислексия.
          </h2>
          <div className="flex flex-col gap-4">
            {[
              "Текстовете са дълги, сложни и трудни за следване.",
              "Детето полага усилия, но не вижда по-добри резултати. Мотивацията намалява.",
              "Налага се да напомняш да учи, да проверяваш и да обясняваш отново и отново.",
              "Това отнема време. И изтощава и двама ви.",
            ].map((t) => (
              <p key={t} style={{ color: NAV.textMuted, fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── КАК ИЗГЛЕЖДА ── */}
      <section className="px-5 py-16">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN[3], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, textAlign: "center" }}>
            Как изглежда Study Flow
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAV.text, marginBottom: 6, textAlign: "center" }}>
            Ето как изглежда един урок.
          </h2>
          <p style={{ fontSize: 15, color: NAV.textMuted, textAlign: "center", marginBottom: 40, lineHeight: 1.8 }}>
            Детето минава през кратки стъпки и учи самостоятелно.
          </p>
          <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[
              { label: "Урок", mock: <LessonCardMock /> },
              { label: "Тест", mock: <QuizCardMock /> },
              { label: "Резултат", mock: <ResultCardMock /> },
            ].map(({ label, mock }) => (
              <div key={label} className="flex flex-col gap-3">
                <p style={{ fontSize: 13, color: NAV.textMuted, fontWeight: 500, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}
                </p>
                {mock}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── КАК РАБОТИ ── */}
      <section className="px-5 py-14" style={{ backgroundColor: NAV.surface }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN[3], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, textAlign: "center" }}>
            Как работи
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAV.text, marginBottom: 32, textAlign: "center" }}>
            Четири стъпки. Нищо повече.
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            {howItems.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl p-5 flex flex-col gap-2"
                style={{
                  backgroundColor: NAV.bg,
                  border: `1px solid ${NAV.border}`,
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <p style={{ fontWeight: 700, fontSize: 14, color: NAV.text, margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: NAV.textMuted, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ЗАЩО РАБОТИ ── */}
      <section className="px-5 py-16">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN[3], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Защо работи
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAV.text, marginBottom: 32, lineHeight: 1.35 }}>
            Създаден специално за деца с дислексия.
          </h2>
          <div className="flex flex-col gap-5">
            {whyItems.map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: NAV.text, margin: "0 0 3px" }}>{item.title}</p>
                  <p style={{ fontSize: 14, color: NAV.textMuted, margin: 0, lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПИЛОТ CTA ── */}
      <section
        className="px-5 py-16 flex flex-col items-center text-center"
        style={{ backgroundColor: MODULE_COLORS[1] }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN[1], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Пилот · Април–Май 2026
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: NAV.text, marginBottom: 16, lineHeight: 1.3 }}>
            Търсим 15–20 семейства.
          </h2>
          <p style={{ fontSize: 15, color: NAV.textMuted, marginBottom: 24, lineHeight: 1.8 }}>
            Безплатен достъп за целия период. До 10 адаптирани урока. Личен профил за детето.
            Искаме само да използвате приложението и да споделите обратна връзка.
          </p>
          <Link
            href="/join"
            className="inline-block rounded-xl px-8 py-4 text-white font-medium"
            style={{ backgroundColor: NAV.btnSolid, fontSize: 15 }}
          >
            Присъедини се към пилота →
          </Link>
        </div>
      </section>

      {/* ── ЗА НАС ── */}
      <section className="px-5 py-16">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN[3], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            За нас
          </p>
          <p style={{ fontSize: 15, color: NAV.textMuted, lineHeight: 1.85, marginBottom: 16 }}>
            Study Flow започна от реална нужда. Като родител на дете с дислексия, която открихме чак в 7 клас, се сблъсках с много трудности.
            Учехме с часове, но резултатите не се подобряваха. Мотивацията намаляваше.
          </p>
          <p style={{ fontSize: 15, color: NAV.textMuted, lineHeight: 1.85, marginBottom: 16 }}>
            Търсех начин детето ми да започне да учи по-често само. Да изгради навик за учене и да поддържа стабилно ниво на знания.
            Ниво, което е достатъчно добро и му дава увереност.
          </p>
          <p style={{ fontSize: 15, color: NAV.text, fontWeight: 500, lineHeight: 1.85 }}>
            Така в началото на 2026 се появи Study Flow.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-5 py-8 flex items-center justify-between flex-wrap gap-4"
        style={{ borderTop: `1px solid ${NAV.border}` }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: NAV.text }}>Study Flow</span>
        <p style={{ fontSize: 13, color: NAV.textMuted, margin: 0 }}>
          © 2026 Study Flow · Пилот
        </p>
        <Link
          href="/join"
          style={{ fontSize: 13, color: NAV.text, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Присъедини се →
        </Link>
      </footer>
    </div>
  );
}
