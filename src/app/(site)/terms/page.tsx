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

const P: React.CSSProperties = {
  fontSize: 15,
  color: NAV.textMuted,
  lineHeight: 1.65,
  margin: 0,
};

const sections = [
  {
    title: "Какво представлява пилотът",
    body: "Study Flow е експериментално приложение, което помага на деца с дислексия да учат по-самостоятелно чрез адаптирано учебно съдържание. Пилотът тества продукта в реална среда с ограничен брой семейства.",
    bullets: null as string[] | null,
  },
  {
    title: "Достъп и използване",
    body: null as string | null,
    bullets: [
      "Участието в пилота е безплатно за периода април–май 2026.",
      "След регистрация ще получите личен линк за достъп, предназначен само за вашето дете.",
      "Молим да не споделяте линка с други хора.",
    ],
  },
  {
    title: "Данни и поверителност",
    body: "Събираме минимална информация:",
    bullets: [
      "Име на детето — за да създадем личен акаунт.",
      "Клас на детето — за да организираме уроците в папки по класове.",
      "Имейл на родителя — за да изпратим линка към приложението.",
    ],
    extra: "Тези данни се използват само за достъп до приложението, комуникация по време на пилота и подобрение на продукта. Данните няма да бъдат споделяни с трети страни. Можете да се откажете по всяко време и да поискате данните ви да бъдат изтрити — напишете ни на annio@abv.bg.",
  },
  {
    title: "Учебно съдържание",
    body: null,
    bullets: [
      "Приложението използва AI за генериране на адаптирано учебно съдържание.",
      "Възможно е да има неточности или грешки.",
      "Родителят носи отговорност да преглежда съдържанието и да подпомага детето при нужда.",
    ],
  },
  {
    title: "Очаквания към участниците",
    body: "Като участник в пилота, се очаква:",
    bullets: [
      "Да използвате приложението в реални учебни ситуации.",
      "Да дадете обратна връзка в края на периода.",
    ],
  },
  {
    title: "Ограничения",
    body: "Study Flow е в ранен етап на развитие. Възможни са:",
    bullets: [
      "Технически проблеми.",
      "Временна недостъпност.",
      "Промени във функционалността.",
    ],
  },
  {
    title: "Прекратяване",
    body: "Можете да прекратите участието си по всяко време, като спрете да използвате приложението.",
    bullets: null,
  },
  {
    title: "Контакт",
    body: "При въпроси можете да се свържете с нас на: annio@abv.bg",
    bullets: null,
  },
];

type Props = { searchParams: Promise<{ from?: string }> };

export default async function TermsPage({ searchParams }: Props) {
  const { from } = await searchParams;
  const backHref = from === "join" ? "/join" : "/";
  const backLabel = from === "join" ? "← Обратно към записването" : "← Към началото";

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
      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Back link */}
        <Link
          href={backHref}
          style={{ fontSize: 14, color: NAV.textMuted, textDecoration: "none", display: "inline-block", marginBottom: 36 }}
        >
          {backLabel}
        </Link>
        <p style={{ fontSize: 11, fontWeight: 500, color: MODULE_BTN3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Пилот · Април–Май 2026
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: NAV.text, marginBottom: 6, lineHeight: 1.25 }}>
          Условия за участие в пилота
        </h1>
        <p style={{ ...P, marginBottom: 48 }}>Study Flow — Пилот (Април–Май 2026)</p>

        <div className="flex flex-col gap-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: NAV.text, marginBottom: 10 }}>
                {s.title}
              </h2>
              {s.body && (
                <p style={{ ...P, marginBottom: s.bullets ? 8 : 0 }}>{s.body}</p>
              )}
              {s.bullets && (
                <ul style={{ paddingLeft: 18, margin: "0", display: "flex", flexDirection: "column", gap: 6, listStylePosition: "outside" }}>
                  {s.bullets.map((b) => (
                    <li key={b} style={{ ...P, paddingLeft: 4 }}>{b}</li>
                  ))}
                </ul>
              )}
              {"extra" in s && s.extra && (
                <p style={{ ...P, marginTop: 10 }}>{s.extra}</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
