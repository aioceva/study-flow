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

const P = { fontSize: 15, lineHeight: 1.65, color: NAV.textMuted, margin: 0 } as const;

function LessonCardMock() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: MODULE_COLORS[1],
        border: `1px solid ${NAV.border}`,
        boxShadow: "0 4px 24px rgba(74,111,165,0.10)",
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAV.headerBg }}>
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>←</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>БИОЛОГИЯ · Урок 5</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⌂</span>
      </div>
      <div className="px-4 py-2" style={{ backgroundColor: MODULE_COLORS[1] }}>
        <p style={{ color: NAV.textMuted, fontSize: 12, margin: 0 }}>Модул 1 от 4 · Клетъчно дишане</p>
      </div>
      <div className="px-4 pb-2">
        <h2 style={{ color: NAV.text, fontWeight: 700, fontSize: 15, margin: "6px 0 10px" }}>
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
            <p style={{ color: MODULE_BTN[1], fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>
              {s.icon} {s.label}
            </p>
            <p style={{ color: NAV.text, fontSize: 13, lineHeight: 1.55, margin: 0 }}>{s.text}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: i === 2 ? 16 : 7, height: 7, borderRadius: 4, backgroundColor: i === 2 ? MODULE_SURFACE[1] : NAV.border }} />
          ))}
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, backgroundColor: NAV.surface, color: NAV.text, fontSize: 16 }}>←</button>
          <button className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, backgroundColor: NAV.btnSolid, color: "#fff", fontSize: 16 }}>→</button>
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
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAV.headerBg }}>
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>←</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>БИОЛОГИЯ · Урок 5</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⌂</span>
      </div>
      <div className="flex gap-1 px-4 py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < 3 ? NAV.btnSolid : i === 3 ? `${NAV.btnSolid}55` : NAV.border }} />
        ))}
      </div>
      <div className="px-4 pt-2 pb-3">
        <p style={{ color: NAV.text, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
          Какво произвежда клетъчното дишане?
        </p>
        {["Вода и въглероден диоксид", "Енергия (АТФ)", "Кислород", "Глюкоза"].map((opt, idx) => (
          <div
            key={opt}
            className="rounded-xl px-3 py-2 mb-2"
            style={{
              backgroundColor: idx === 1 ? "#E8F9F1" : NAV.surface,
              border: idx === 1 ? `1.5px solid #3B9E6A` : `1px solid ${NAV.border}`,
              color: idx === 1 ? "#3B9E6A" : NAV.text,
              fontSize: 13,
              fontWeight: idx === 1 ? 500 : 400,
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
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAV.headerBg }}>
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>←</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>БИОЛОГИЯ · Урок 5</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>⌂</span>
      </div>
      <div className="flex flex-col items-center px-5 py-5 gap-2">
        <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
          <rect x="22" y="8" width="20" height="26" rx="10" fill="#E8C04A" />
          <rect x="8" y="8" width="10" height="16" rx="5" fill="#F0D070" />
          <rect x="46" y="8" width="10" height="16" rx="5" fill="#F0D070" />
          <rect x="26" y="34" width="12" height="6" rx="2" fill="#E8C04A" />
          <rect x="20" y="40" width="24" height="6" rx="3" fill="#E8C04A" />
        </svg>
        <h2 style={{ color: NAV.text, fontWeight: 700, fontSize: 18, margin: "2px 0 0" }}>Браво!</h2>
        <p style={{ color: NAV.textMuted, fontSize: 12, margin: 0 }}>Биология · Урок 5</p>
        <div className="w-full mt-2">
          <div className="rounded-full overflow-hidden" style={{ height: 8, backgroundColor: NAV.surface }}>
            <div style={{ width: "80%", height: "100%", backgroundColor: NAV.btnSolid, borderRadius: 9999 }} />
          </div>
          <p style={{ color: NAV.textMuted, fontSize: 12, marginTop: 5, textAlign: "center" }}>8 от 10</p>
        </div>
        <p style={{ color: NAV.text, fontSize: 13, textAlign: "center", margin: "2px 0 4px" }}>
          Ти научи 2 нови неща днес.
        </p>
        <button className="w-full rounded-xl py-2" style={{ backgroundColor: NAV.btnSolid, color: "#fff", fontSize: 13, fontWeight: 500 }}>
          Към началото
        </button>
        <button className="w-full rounded-xl py-2" style={{ backgroundColor: NAV.surface, color: NAV.textMuted, fontSize: 13 }}>
          Опитай пак
        </button>
      </div>
    </div>
  );
}

const whyItems = [
  { icon: "🔤", title: "Ясен шрифт", desc: "Използваме шрифт, който улеснява разпознаването на буквите." },
  { icon: "📏", title: "Кратки изречения", desc: "Една идея в изречение. Без дълги и сложни конструкции." },
  { icon: "🃏", title: "Карти вместо параграфи", desc: "Урокът е разделен на малки стъпки, което улеснява обработката." },
  { icon: "🌈", title: "Спокойна визия", desc: "Чист екран, меки цветове и достатъчно разстояние. По-малко визуален шум." },
  { icon: "🔁", title: "Затвърждаване", desc: "Кратък тест помага детето да се върне към наученото и да го упражни." },
  { icon: "⏱️", title: "Без напрежение", desc: "Няма таймер. Детето учи в собствено темпо." },
  { icon: "📊", title: "Дневник за родителя", desc: "Виждаш дали детето учи и къде има нужда от помощ." },
];

const howItems = [
  { icon: "📸", step: "1", title: "Качваш урок", desc: "Снимка от учебника или текст" },
  { icon: "✨", step: "2", title: "Ние го адаптираме", desc: "Урокът става на кратки карти с прост език" },
  { icon: "🧠", step: "3", title: "Детето учи", desc: "Самостоятелно, в собствено темпо" },
  { icon: "📊", step: "4", title: "Ти виждаш прогреса", desc: "Виждаш как се справя в родителския дневник" },
];

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 500 as const,
  color: MODULE_BTN[3],
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 10px",
};

export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: NAV.bg,
        color: NAV.text,
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        lineHeight: 1.65,
        letterSpacing: "0.02em",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `0.5px solid ${NAV.border}`,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 16, color: NAV.text }}>Study Flow</span>
        <div className="flex items-center gap-2">
          <Link
            href="/bobi"
            className="rounded-xl px-3 py-1.5 font-medium text-sm"
            style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
          >
            Към приложението
          </Link>
          <Link
            href="/join"
            className="rounded-xl px-4 py-1.5 text-white font-medium text-sm"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            Присъедини се
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-5 pt-12 pb-10 flex flex-col items-center text-center" style={{ maxWidth: 560, margin: "0 auto" }}>
        <span
          className="inline-block rounded-full px-4 py-1 mb-5 text-sm font-medium"
          style={{ backgroundColor: MODULE_COLORS[1], color: MODULE_BTN[1] }}
        >
          Пилот · Април–Май 2026
        </span>
        <h1
          className="text-xl font-bold"
          style={{ color: NAV.text, lineHeight: 1.3, margin: "0 0 16px" }}
        >
          Помага на деца с дислексия да учат по-лесно уроците от учебника
        </h1>
        <p style={{ ...P, textAlign: "center", marginBottom: 24 }}>
          Study Flow помага на деца с дислексия да учат по-лесно и самостоятелно. Помага на родителите да виждат кога и къде детето има нужда от помощ, без да поемат цялото учене.
          <br /><br />
          Качваш снимка на урок. Приложението го превръща в кратки, разбираеми карти. Детето учи. Родителите спестяват време.
        </p>
        <Link
          href="/join"
          className="inline-block rounded-xl px-7 py-3 text-white font-medium text-sm"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Присъедини се към пилота →
        </Link>
      </section>

      {/* ── ПРОБЛЕМЪТ ── */}
      <section className="px-5 py-10" style={{ backgroundColor: NAV.surface }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <p style={LABEL_STYLE}>Проблемът</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: NAV.text, marginBottom: 16, lineHeight: 1.35 }}>
            Учебниците не са пригодени за деца с дислексия
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ ...P, textAlign: "center" }}>
              Текстовете са дълги, сложни и трудни за следване.
            </p>
            <p className="text-sm" style={{ ...P, textAlign: "center" }}>
              Детето полага усилия, но често не вижда по-добри резултати. Мотивацията намалява. Налага се да напомняш да учи, да проверяваш и да обясняваш отново и отново. Това отнема време и изтощава.
            </p>
          </div>
        </div>
      </section>

      {/* ── КАК ИЗГЛЕЖДА ── */}
      <section className="py-10">
        <div className="px-5" style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ ...LABEL_STYLE, textAlign: "center" }}>Как изглежда Study Flow</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: NAV.text, marginBottom: 6, textAlign: "center" }}>
            Ето как изглежда един урок
          </h2>
          <p className="text-sm" style={{ ...P, textAlign: "center", margin: "0 auto 24px" }}>
            Детето минава през кратки стъпки и учи самостоятелно.
          </p>
        </div>

        {/* Carousel wrapper — clips mobile overflow */}
        <div style={{ overflow: "hidden" }}>
          <div
            className="flex gap-5 pb-3"
            style={{
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              justifyContent: "center",
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            {[
              { label: "Урок", mock: <LessonCardMock /> },
              { label: "Тест", mock: <QuizCardMock /> },
              { label: "Резултат", mock: <ResultCardMock /> },
            ].map(({ label, mock }) => (
              <div
                key={label}
                className="flex-shrink-0 flex flex-col gap-2"
                style={{ scrollSnapAlign: "center", width: "min(280px, calc(100vw - 56px))" }}
              >
                <p style={{ fontSize: 11, color: NAV.textMuted, fontWeight: 500, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                  {label}
                </p>
                {mock}
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators — visible only on mobile (all 3 shown on desktop) */}
        <div className="flex sm:hidden justify-center gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: NAV.border,
              }}
            />
          ))}
        </div>
      </section>

      {/* ── КАК РАБОТИ ── */}
      <section className="px-5 py-10" style={{ backgroundColor: NAV.surface }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ ...LABEL_STYLE, textAlign: "center" }}>Как работи</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: NAV.text, marginBottom: 20, textAlign: "center" }}>
            Четири стъпки. Нищо повече
          </h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {howItems.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl p-4 flex flex-col gap-1.5"
                style={{ backgroundColor: NAV.bg, border: `1px solid ${NAV.border}` }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <p style={{ fontWeight: 700, color: NAV.text, margin: 0, fontSize: 15 }}>{item.title}</p>
                <p style={{ ...P }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── КАК Е СЪЗДАДЕНО ── */}
      <section className="px-5 py-10">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ ...LABEL_STYLE, textAlign: "center" }}>Как е създаден</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: NAV.text, marginBottom: 20, lineHeight: 1.35, textAlign: "center" }}>
            Създаден с мисъл за деца с дислексия
          </h2>
          <div className="flex flex-col gap-4">
            {whyItems.map((item) => (
              <div key={item.title} className="flex gap-3 items-start">
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, color: NAV.text, margin: "0 0 2px", fontSize: 15 }}>{item.title}</p>
                  <p style={{ ...P }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПИЛОТ CTA ── */}
      <section
        className="px-5 py-12 flex flex-col items-center text-center"
        style={{ backgroundColor: MODULE_COLORS[1] }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ ...LABEL_STYLE, color: MODULE_BTN[1], textAlign: "center" }}>
            Пилот — Април–Май 2026
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAV.text, marginBottom: 20, lineHeight: 1.3 }}>
            Търсим 15–20 семейства
          </h2>

          <div className="flex flex-col gap-5 text-left" style={{ marginBottom: 28 }}>
            <div>
              <p style={{ fontWeight: 700, color: NAV.text, fontSize: 15, margin: "0 0 6px" }}>Какво получаваш:</p>
              {["Достъп за целия период", "10 адаптирани урока", "Личен профил за детето"].map((item) => (
                <p key={item} style={{ ...P, margin: "0 0 3px" }}>· {item}</p>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: NAV.text, fontSize: 15, margin: "0 0 6px" }}>Какво е нужно от теб:</p>
              {["Да използвате приложението", "Да споделите обратна връзка"].map((item) => (
                <p key={item} style={{ ...P, margin: "0 0 3px" }}>· {item}</p>
              ))}
            </div>
          </div>

          <Link
            href="/join"
            className="inline-block rounded-xl px-7 py-3 text-white font-medium"
            style={{ backgroundColor: NAV.btnSolid, fontSize: 15 }}
          >
            Присъедини се към пилота →
          </Link>
        </div>
      </section>

      {/* ── ЗА НАС ── */}
      <section className="px-5 py-10">
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...LABEL_STYLE, textAlign: "center" }}>За нас</p>
          <p style={{ ...P, marginBottom: 10 }}>
            Study Flow започна от реална нужда. Като родител на дете с дислексия, която открихме чак в 7 клас, се сблъсках с много трудности.
            Учехме с часове, но резултатите не се подобряваха. Мотивацията намаляваше. Търсех начин детето ми да започне да учи по-често само, да изгради навик и да поддържа стабилно ниво на знания. Така в началото на 2026 се появи Study Flow.
          </p>
          <p style={{ ...P, marginBottom: 10 }}>
            В момента развиваме приложението и го тестваме с малък брой семейства.
          </p>
          <p style={{ ...P, marginBottom: 14 }}>
            Ако темата ви е близка и искате да се включите като родител, специалист по работа с деца с дислексия, UX специалист или просто човек с интерес към ученето, ще се радвам да се свържем и да работим заедно.
          </p>
          <p style={{ ...P, margin: 0 }}>
            <a href="mailto:annio@abv.bg" style={{ color: NAV.text, fontWeight: 500 }}>annio@abv.bg</a>
            {" · "}Анна Йоцева
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-5 py-6 flex items-center justify-between flex-wrap gap-3"
        style={{ borderTop: `1px solid ${NAV.border}` }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: NAV.text }}>Study Flow</span>
        <p style={{ ...P, margin: 0, fontSize: 14 }}>© 2026 Study Flow · Пилот</p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            style={{ fontSize: 14, color: NAV.textMuted, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Условия за участие
          </Link>
          <Link
            href="/join"
            style={{ fontSize: 14, color: NAV.text, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Присъедини се →
          </Link>
        </div>
      </footer>
    </div>
  );
}
