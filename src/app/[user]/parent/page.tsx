import Link from "next/link";
import { readJSON } from "@/lib/github";
import { Sessions, Session, SUBJECT_LABELS, Subject, NAV } from "@/types";

export const dynamic = "force-dynamic";

// ─── helpers ───────────────────────────────────────────────────────────────

const BG_DAYS   = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const BG_MONTHS = [
  "януари","февруари","март","април","май","юни",
  "юли","август","септември","октомври","ноември","декември",
];
const BG_MONTHS_SHORT = [
  "яну","фев","мар","апр","май","юни",
  "юли","авг","сеп","окт","ное","дек",
];

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${BG_MONTHS[m - 1]} ${y}`;
}

function getThisWeekDays(): { dateStr: string; label: string; dayNum: number }[] {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const toMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + toMonday);
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

function sessionScore(s: Session): { score: number; total: number } {
  if (s.type === "learn") {
    return {
      score: s.quiz_1.score + s.quiz_2.score,
      total: s.quiz_1.total + s.quiz_2.total,
    };
  }
  return { score: s.score, total: s.total };
}

function scoreColor(score: number, total: number): string {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.8) return "#22C55E";
  if (pct >= 0.6) return "#F59E0B";
  return "#EF4444";
}

// ─── компонент ─────────────────────────────────────────────────────────────

export default async function ParentPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;
  const displayName = user.charAt(0).toUpperCase() + user.slice(1);

  const result = await readJSON<Sessions>(`users/${user}/sessions/sessions.json`);
  const sessions: Session[] = result?.data?.sessions ?? [];

  // ── Горен блок: обобщение ───────────────────────────────────────────────

  const weekDays = getThisWeekDays();
  const sessionDays = new Set(sessions.map((s) => s.date));

  const totalSessions = sessions.length;

  const uniqueLessons = new Set(sessions.map((s) => `${s.subject}-${s.lesson}`)).size;

  const scores = sessions.map((s) => {
    const { score, total } = sessionScore(s);
    return total > 0 ? score / total : 0;
  });
  const avgPct = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
    : null;

  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastDateLabel = lastSession
    ? fmtDate(lastSession.date)
    : "—";

  // ── Среден блок: хронология ─────────────────────────────────────────────

  // Групирай по дата, новото отгоре
  const grouped: Record<string, Session[]> = {};
  for (const s of [...sessions].reverse()) {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // ── UI ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър — scan-style */}
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

        {/* ═══ ГОРЕН БЛОК ════════════════════════════════════════════════ */}

        {/* Седмичен стрип */}
        <div className="rounded-xl p-4" style={{ backgroundColor: NAV.surface }}>
          <p className="text-sm" style={{ color: NAV.textMuted, marginBottom: 12 }}>
            Тази седмица
          </p>
          <div className="flex justify-between">
            {weekDays.map(({ dateStr, label, dayNum }) => {
              const active = sessionDays.has(dateStr);
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
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

        {/* ═══ СРЕДЕН БЛОК ════════════════════════════════════════════════ */}

        <div>
          <p className="text-sm" style={{ color: NAV.textMuted, marginBottom: 10 }}>
            Всички сесии
          </p>

          {sessions.length === 0 ? (
            <p className="text-base" style={{ color: NAV.textMuted }}>
              Все още няма записани сесии.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sortedDates.map((date) => (
                <div key={date}>
                  {/* Дата — group header */}
                  <p className="text-sm" style={{ color: NAV.textMuted, marginBottom: 6 }}>
                    {fmtDate(date)}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {grouped[date].map((s, i) => {
                      const { score, total } = sessionScore(s);
                      const subjectLabel = SUBJECT_LABELS[s.subject as Subject] ?? s.subject;
                      const typeLabel = s.type === "learn" ? "Учене" : "Преговор";
                      const typeBg   = s.type === "learn" ? "#EBF4FF" : "#F3EEFF";
                      const typeColor = s.type === "learn" ? "#3B7DD8" : "#7B5EA7";

                      return (
                        <div
                          key={i}
                          className="rounded-xl px-4 py-3 flex items-center justify-between"
                          style={{ backgroundColor: NAV.surface }}
                        >
                          {/* Ляво: час + предмет + урок */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <p className="text-sm" style={{ color: NAV.textMuted }}>
                              {s.started_at ?? ""}
                            </p>
                            <p className="text-base" style={{ color: NAV.text }}>
                              {subjectLabel} · Урок {s.lesson}
                            </p>
                            {/* Тип badge */}
                            <span
                              className="text-sm"
                              style={{
                                display: "inline-block",
                                backgroundColor: typeBg,
                                color: typeColor,
                                borderRadius: 6,
                                padding: "1px 8px",
                                width: "fit-content",
                              }}
                            >
                              {typeLabel}
                            </span>
                          </div>

                          {/* Дясно: резултат */}
                          <div className="text-base" style={{ color: scoreColor(score, total), minWidth: 40, textAlign: "right" }}>
                            {score}/{total}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  valueColor,
  small = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col justify-between"
      style={{ backgroundColor: NAV.surface, minHeight: 72 }}
    >
      <p className="text-sm" style={{ color: NAV.textMuted }}>{label}</p>
      <p
        className={small ? "text-base font-bold" : "text-xl font-bold"}
        style={{ color: valueColor ?? NAV.text }}
      >
        {value}
      </p>
    </div>
  );
}
