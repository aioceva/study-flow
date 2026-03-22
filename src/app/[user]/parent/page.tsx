import Link from "next/link";
import { readJSON } from "@/lib/github";
import { Sessions, Session, Quiz, NAV } from "@/types";
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

function sessionScore(s: Session): { score: number; total: number } {
  if (s.type === "learn") {
    return {
      score: s.quiz_1.score + s.quiz_2.score,
      total: s.quiz_1.total + s.quiz_2.total,
    };
  }
  return { score: s.score, total: s.total };
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

  // Зареди quiz данни за всеки уникален урок (за грешните въпроси)
  const lessonKeys = [...new Set(sessions.map((s) => `${s.subject}-${s.lesson}`))];
  const quizEntries = await Promise.all(
    lessonKeys.map(async (key) => {
      const [subject, lesson] = key.split("-");
      const r = await readJSON<Quiz>(
        `users/${user}/adaptations/${subject}/lesson-${lesson}/quiz.json`
      );
      return [key, r?.data?.questions ?? []] as const;
    })
  );
  const quizMap: QuizMap = Object.fromEntries(quizEntries);

  // ── Горен блок ──────────────────────────────────────────────────────────

  const weekDays     = getWeekDays(weekOffset);
  const monthLabel   = weekMonthLabel(weekDays);
  const isCurrentWeek = weekOffset >= 0;
  const sessionDays  = new Set(sessions.map((s) => s.date));
  const todayStr     = new Date().toISOString().slice(0, 10);

  const totalSessions  = sessions.length;
  const uniqueLessons  = new Set(sessions.map((s) => `${s.subject}-${s.lesson}`)).size;

  const scores = sessions.map((s) => {
    const { score, total } = sessionScore(s);
    return total > 0 ? score / total : 0;
  });
  const avgPct = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
    : null;

  const lastSession    = sessions.at(-1);
  const lastDateLabel  = lastSession ? fmtDate(lastSession.date) : "—";

  // ── Среден блок ─────────────────────────────────────────────────────────

  const grouped: Record<string, Session[]> = {};
  for (const s of [...sessions].reverse()) {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // ── UI ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="flex-none flex items-center px-4 py-3" style={{ gap: 8 }}>
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

      <div className="flex-1 px-4 pb-8 space-y-5">

        {/* ═══ ГОРЕН БЛОК ═══════════════════════════════════════════════ */}

        {/* Седмичен стрип */}
        <div className="rounded-xl p-4" style={{ backgroundColor: NAV.surface }}>

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
                          : { backgroundColor: NAV.bg, color: NAV.border }
                    }
                  >
                    {active ? "✓" : dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 статистики */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard label="Сесии" value={String(totalSessions)} />
          <StatCard label="Урока" value={String(uniqueLessons)} />
          <StatCard
            label="Среден резултат"
            value={avgPct !== null ? `${avgPct}%` : "—"}
            valueColor={
              avgPct === null ? NAV.textMuted
              : avgPct >= 80 ? "#22C55E"
              : avgPct >= 60 ? "#F59E0B"
              : "#EF4444"
            }
          />
          <StatCard label="Последно учи" value={lastDateLabel} small />
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
              fmtDate={fmtDate}
            />
          )}
        </div>

      </div>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, valueColor, small = false,
}: {
  label: string; value: string; valueColor?: string; small?: boolean;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col justify-between"
      style={{ backgroundColor: NAV.surface, minHeight: 72 }}>
      <p className="text-sm" style={{ color: NAV.textMuted }}>{label}</p>
      <p className={small ? "text-base font-bold" : "text-xl font-bold"}
        style={{ color: valueColor ?? NAV.text }}>
        {value}
      </p>
    </div>
  );
}
