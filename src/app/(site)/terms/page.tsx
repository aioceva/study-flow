import Link from "next/link";

const NAV = {
  btnSolid: "#4A6FA5",
  surface: "#F0F2F5",
  bg: "#FFFFFF",
  text: "#4A6FA5",
  textMuted: "#5A6A7E",
  border: "#E2E5EA",
};

const MODULE_BTN3 = "#9A6E08";

const sections = [
  {
    title: "1. Общи условия",
    body: [
      "Study Flow е пилотно приложение за адаптирано учебно съдържание за деца с дислексия. Достъпът до приложението е безплатен за периода на пилота (Април–Май 2026).",
      "Използването на приложението означава, че приемате настоящите условия.",
    ],
  },
  {
    title: "2. Лични данни",
    body: [
      "При записване събираме: първото име на детето, клас и предпочитан фон за четене. Тези данни се използват единствено за персонализиране на приложението.",
      "Не събираме имейл адрес, телефон или друга лична информация. Данните се съхраняват в GitHub и не се споделят с трети страни.",
      "След приключване на пилота данните ще бъдат изтрити.",
    ],
  },
  {
    title: "3. Използване от деца",
    body: [
      "Приложението е предназначено за деца на възраст 11–18 години. Достъпът се осъществява чрез личен URL, предоставен на родителя.",
      "Родителят е отговорен за споделянето и съхранението на личния URL.",
    ],
  },
  {
    title: "4. Съдържание",
    body: [
      "Учебното съдържание се генерира с изкуствен интелект на база материал, качен от потребителя. Study Flow не носи отговорност за точността на адаптираното съдържание.",
      "Приложението не замества учител или специалист по дислексия.",
    ],
  },
  {
    title: "5. Контакт",
    body: [
      "При въпроси или проблеми, свързани с приложението или личните данни, можете да се свържете с нас чрез обратна връзка в приложението.",
    ],
  },
];

export default function TermsPage() {
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
      {/* NAV */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `0.5px solid ${NAV.border}`,
        }}
      >
        <Link href="/" style={{ fontWeight: 700, fontSize: 17, color: NAV.text, textDecoration: "none" }}>
          Study Flow
        </Link>
        <Link
          href="/join"
          className="rounded-xl px-5 py-2 text-white font-medium text-sm"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Присъедини се
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 80px" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: MODULE_BTN3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Правни условия
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: NAV.text, marginBottom: 8, lineHeight: 1.25 }}>
          Условия за използване
        </h1>
        <p style={{ fontSize: 14, color: NAV.textMuted, marginBottom: 48 }}>
          Последна актуализация: Април 2026
        </p>

        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: NAV.text, marginBottom: 12 }}>
                {s.title}
              </h2>
              <div className="flex flex-col gap-3">
                {s.body.map((p, i) => (
                  <p key={i} style={{ fontSize: 15, color: NAV.textMuted, lineHeight: 1.85, margin: 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
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
