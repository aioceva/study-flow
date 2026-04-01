import Link from "next/link";
import { readJSON } from "@/lib/github";
import { Sessions, Session, Quiz, Adaptation, NAV, SUBJECT_LABELS, Subject, ReinforcementSession } from "@/types";
import { SessionList, QuizMap } from "./SessionList";

export const dynamic = "force-dynamic";

// ─── helpers ───────────────────────────────────────────────────────────────

const BG_MONTHS = [
  "януари","февруари","март","април","май","юни",
  "юли","август","септември","октомври","ноември","декември",
];

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${BG_MONTHS[m - 1]} ${y}`;
}

function fmtShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${BG_MONTHS[m - 1]}`;
}

function getWeekDays(weekOffset: number): { dateStr: string; label: string; dayNum: number }[] {
  const now = new Date();
  const dow = now.getDay();
  const toMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + toMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      dateStr: d.toISOString().slice(0, 10),
      label: ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"][i],
      dayNum: d.getDate(),
    };
  });
}

function weekMonthLabel(days: { dateStr: string }[]): string {
  const first = new Date(days[0].dateStr);
  const last  = new Date(days[6].dateStr);
  const year  = last.getFullYear();
  if (first.getMonth() === last.getMonth())
    return `${BG_MONTHS[first.getMonth()]} ${year}`;
  return `${BG_MONTHS[first.getMonth()]} – ${BG_MONTHS[last.getMonth()]} ${year}`;
}

// ─── страница ──────────────────────────────────────────────────────────────

export default async function ParentPage({
  params,
  searchParams,
}: {
  params: Promise<{ user: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { user } = await params;
  const sp = await searchParams;
  const weekOffset = Math.min(0, parseInt(sp.week ?? "0", 10) || 0);
  const displayName = user.charAt(0).toUpperCase() + user.slice(1);

  // Зареди сесии
  const result = await readJSON<Sessions>(`users/${user}/sessions/sessions.json`);
  const sessions: Session[] = result?.data?.sessions ?? [];

  // Зареди quiz данни и adaptation заглавия за всеки уникален урок
  const lessonKeys = [...new Set(sessions.map((s) => `${s.subject}-${s.lesson}`))];
  const lessonData = await Promise.all(
    lessonKeys.map(async (key) => {
      const [subject, lesson] = key.split("-");
      const [quizR, adaptR] = await Promise.all([
        readJSON<Quiz>(`users/${user}/adaptations/${subject}/lesson-${lesson}/quiz.json`),
        readJSON<Adaptation>(`users/${user}/adaptations/${subject}/lesson-${lesson}/adaptation.json`),
      ]);
      return {
        key,
        questions: quizR?.data?.questions ?? [],
        title: adaptR?.data?.meta?.title ?? null,
      };
    })
  );
  const quizMap: QuizMap = Object.fromEntries(lessonData.map((d) => [d.key, d.questions]));
  const titleMap: Record<string, string> = Object.fromEntries(
    lessonData.filter((d) => d.title).map((d) => [d.key, d.title as string])
  );

  // ── Горен блок ──────────────────────────────────────────────────────────

  const weekDays      = getWeekDays(weekOffset);
  const monthLabel    = weekMonthLabel(weekDays);
  const isCurrentWeek = weekOffset >= 0;
  const sessionDays   = new Set(sessions.map((s) => s.date));
  const todayStr      = new Date().toISOString().slice(0, 10);

  // Последно учи — дата + час
  const lastSession = sessions.at(-1);
  const lastLabel   = lastSession
    ? `${fmtShortDate(lastSession.date)} · ${lastSession.started_at}`
    : "—";

  // Учи редовно — уникални дни с учене тази седмица
  const thisWeekDates  = new Set(getWeekDays(0).map((d) => d.dateStr));
  const activeDaysThisWeek = new Set(
    sessions.filter((s) => thisWeekDates.has(s.date)).map((s) => s.date)
  ).size;
  const regularLabel = activeDaysThisWeek === 1
    ? "1 ден тази седмица"
    : `${activeDaysThisWeek} дни тази седмица`;

  // Най-труден предмет — последен тест по предмет → намери най-слабия резултат
  const reinfSessions = sessions.filter(
    (s): s is ReinforcementSession => s.type === "reinforcement"
  );
  let hardestLabel: string | null = null;
  let hardestTitle: string | null = null;
  let hardestPct: number | null = null;
  if (reinfSessions.length > 0) {
    // Намери последната reinforcement сесия за всеки предмет
    const latestBySubject: Record<string, ReinforcementSession> = {};
    for (const s of reinfSessions) {
      const existing = latestBySubject[s.subject];
      if (!existing || (s.date + s.started_at) > (existing.date + existing.started_at)) {
        latestBySubject[s.subject] = s;
      }
    }
    // Намери предмета с най-нисък % от последния тест
    let worstPct = Infinity;
    for (const [subj, s] of Object.entries(latestBySubject)) {
      const pct = s.score / s.total;
      if (pct < worstPct) {
        worstPct     = pct;
        hardestLabel = SUBJECT_LABELS[subj as Subject] ?? subj;
        hardestTitle = titleMap[`${subj}-${s.lesson}`] ?? null;
        hardestPct   = Math.round(pct * 100);
      }
    }
  }

  // ── Среден блок ─────────────────────────────────────────────────────────

  const grouped: Record<string, Session[]> = {};
  for (const s of [...sessions].reverse()) {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // ── UI ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", backgroundColor: NAV.surface }}>

      {/* Хедър */}
      <div className="flex-none flex items-center justify-between px-4 py-3">
        <div className="flex items-center" style={{ gap: 8 }}>
          <Link
            href={`/${user}`}
            className="btn-press w-8 h-8 flex items-center justify-center"
            style={{ opacity: 0.55 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>
            Дневник · {displayName}
          </h1>
        </div>
        <Link
          href={`/${user}`}
          aria-label="Начало"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-5">

        {/* ═══ ГОРЕН БЛОК ═══════════════════════════════════════════════ */}

        {/* Седмичен стрип */}
        <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 10px rgba(74, 111, 165, 0.09)" }}>

          {/* Навигация: ← месец → */}
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <Link
              href={`/${user}/parent?week=${weekOffset - 1}`}
              className="btn-press w-8 h-8 flex items-center justify-center"
              style={{ opacity: 0.55 }}
              aria-label="Предишна седмица"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>

            <span className="text-sm" style={{ color: NAV.text }}>{monthLabel}</span>

            {isCurrentWeek ? (
              <div className="w-8 h-8" style={{ opacity: 0 }} aria-hidden />
            ) : (
              <Link
                href={`/${user}/parent?week=${weekOffset + 1}`}
                className="btn-press w-8 h-8 flex items-center justify-center"
                style={{ opacity: 0.55 }}
                aria-label="Следваща седмица"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Дни */}
          <div className="flex justify-between">
            {weekDays.map(({ dateStr, label, dayNum }) => {
              const active  = sessionDays.has(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={dateStr} className="flex flex-col items-center" style={{ gap: 4, flex: 1 }}>
                  <span className="text-sm" style={{ color: NAV.textMuted }}>{label}</span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                    style={
                      active
                        ? { backgroundColor: "#3B9E6A", color: "white" }
                        : isToday
                          ? { backgroundColor: NAV.border, color: NAV.text }
                          : { backgroundColor: NAV.surface, color: NAV.border }
                    }
                  >
                    {active ? "✓" : dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 статистики */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Последно учи" value={lastLabel} small />
          <StatCard label="Учи редовно" value={regularLabel} small />
          <div style={{ gridColumn: "1 / -1" }}>
            <StatCard
              label="Най-труден предмет"
              value={hardestLabel ?? "—"}
              mid={hardestTitle ?? undefined}
              sub={hardestPct !== null ? `${hardestPct}%` : undefined}
              subColor={
                hardestPct === null ? undefined
                : hardestPct >= 70 ? "#3B9E6A"
                : "#9A6E08"
              }
            />
          </div>
        </div>

        {/* ═══ СРЕДЕН БЛОК ══════════════════════════════════════════════ */}

        <div>
          <p className="text-sm" style={{ color: NAV.textMuted, marginBottom: 10 }}>
            Всички сесии
          </p>
          {sessions.length === 0 ? (
            <p className="text-base" style={{ color: NAV.textMuted }}>
              Все още няма записани сесии.
            </p>
          ) : (
            <SessionList
              grouped={grouped}
              sortedDates={sortedDates}
              quizMap={quizMap}
            />
          )}
        </div>

      </div>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, mid, sub, subColor, small = false,
}: {
  label: string; value: string; mid?: string; sub?: string; subColor?: string; small?: boolean;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col justify-between"
      style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 10px rgba(74, 111, 165, 0.09)", minHeight: 72 }}>
      <p className="text-sm" style={{ color: NAV.textMuted }}>{label}</p>
      <div>
        <p className={small ? "text-base font-bold" : "text-xl font-bold"}
          style={{ color: NAV.text }}>
          {value}
        </p>
        {mid && (
          <p className="text-sm" style={{ color: NAV.textMuted }}>{mid}</p>
        )}
        {sub && (
          <p className="text-sm font-medium" style={{ color: subColor ?? NAV.textMuted }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
