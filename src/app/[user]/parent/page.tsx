import Link from "next/link";
import { readJSON } from "@/lib/github";
import { Sessions, NAV } from "@/types";

export const dynamic = "force-dynamic";

const BG_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const BG_MONTHS = [
  "яну", "фев", "мар", "апр", "май", "юни",
  "юли", "авг", "сеп", "окт", "ное", "дек",
];

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const toMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + toMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekTitle(days: Date[]): string {
  const first = days[0];
  const last = days[6];
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${BG_MONTHS[first.getMonth()]}`;
  }
  return `${first.getDate()} ${BG_MONTHS[first.getMonth()]} – ${last.getDate()} ${BG_MONTHS[last.getMonth()]}`;
}

export default async function ParentPage({
  params,
  searchParams,
}: {
  params: Promise<{ user: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { user } = await params;
  const sp = await searchParams;
  const weekOffset = parseInt(sp.week ?? "0", 10) || 0;

  const days = getWeekDays(weekOffset);
  const title = weekTitle(days);

  const result = await readJSON<Sessions>(`users/${user}/sessions/sessions.json`);
  const sessions = result?.data.sessions ?? [];

  const sessionDays = new Set(sessions.map((s) => s.date));

  const displayName = user.charAt(0).toUpperCase() + user.slice(1);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: NAV.bg }}>
      {/* Хедър */}
      <div className="px-4 pt-6 pb-5 flex items-center gap-3" style={{ backgroundColor: NAV.headerBg }}>
        <Link
          href={`/${user}`}
          className="btn-press flex items-center justify-center w-9 h-9 rounded-full"
          style={{ color: "white" }}
          aria-label="Назад"
        >
          ‹
        </Link>
        <h1 className="text-white font-bold text-xl">{displayName} — История</h1>
      </div>

      {/* Седмичен блок */}
      <div className="flex-1 px-4 pt-6">
        {/* Навигация по седмици */}
        <div className="flex items-center justify-between mb-5">
          <Link
            href={`/${user}/parent?week=${weekOffset - 1}`}
            className="btn-press w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ color: NAV.text, backgroundColor: NAV.surface }}
            aria-label="Предишна седмица"
          >
            ←
          </Link>

          <span className="text-sm font-semibold" style={{ color: NAV.text }}>
            {title}
          </span>

          <Link
            href={`/${user}/parent?week=${weekOffset + 1}`}
            className="btn-press w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{
              color: weekOffset >= 0 ? NAV.border : NAV.text,
              backgroundColor: weekOffset >= 0 ? NAV.surface : NAV.surface,
              pointerEvents: weekOffset >= 0 ? "none" : "auto",
              opacity: weekOffset >= 0 ? 0.4 : 1,
            }}
            aria-label="Следваща седмица"
            aria-disabled={weekOffset >= 0}
          >
            →
          </Link>
        </div>

        {/* Дни на седмицата */}
        <div className="flex justify-between gap-1">
          {days.map((day, i) => {
            const dateStr = toDateStr(day);
            const hasSession = sessionDays.has(dateStr);
            return (
              <div key={dateStr} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                <span className="text-[10px] font-semibold uppercase" style={{ color: NAV.textMuted }}>
                  {BG_DAYS[i]}
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                  style={
                    hasSession
                      ? { backgroundColor: "#3B9E6A", color: "white" }
                      : { backgroundColor: NAV.surface, color: NAV.border }
                  }
                  aria-label={hasSession ? `${BG_DAYS[i]} — имаше сесия` : `${BG_DAYS[i]} — без сесия`}
                >
                  {hasSession ? "✓" : "○"}
                </div>
                <span className="text-[10px]" style={{ color: NAV.textMuted }}>
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
