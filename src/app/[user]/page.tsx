"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sessions, SUBJECT_LABELS, Subject, NAV } from "@/types";

interface IndexEntry {
  subject: string;
  lesson: number;
  title: string;
  savedAt: string;
}

interface LessonTile {
  subject: Subject;
  lesson: number;
  title: string;
  lastDate: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  math: "#4F8EF7",
  bio:  "#22C55E",
  chem: "#F59E0B",
  phys: "#EF4444",
  hist: "#A78BFA",
  lit:  "#EC4899",
  gen:  "#94A3B8",
};

function getGroup(dateStr: string): "week" | "lastweek" | "older" {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return "week";
  if (diffDays < 14) return "lastweek";
  return "older";
}

const GROUP_LABELS: Record<string, string> = {
  week:     "Тази седмица",
  lastweek: "Миналата седмица",
  older:    "По-рано",
};

export default function UserHome() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const [tiles, setTiles] = useState<LessonTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/adaptation?user=${user}`).then((r) => r.json()),
      fetch(`/api/session?user=${user}`).then((r) => r.json()).catch(() => ({ sessions: [] })),
    ])
      .then(([adaptData, sessData]: [{ lessons: IndexEntry[] }, Sessions]) => {
        const lessons = adaptData.lessons ?? [];

        const lastDateMap = new Map<string, string>();
        for (const s of sessData.sessions ?? []) {
          const key = `${s.subject}-${s.lesson}`;
          const cur = lastDateMap.get(key);
          if (!cur || s.date > cur) lastDateMap.set(key, s.date);
        }

        const result: LessonTile[] = lessons.map((e) => ({
          subject: e.subject as Subject,
          lesson: e.lesson,
          title: e.title,
          lastDate: lastDateMap.get(`${e.subject}-${e.lesson}`) ?? e.savedAt.split("T")[0],
        }));

        setTiles(result.sort((a, b) => b.lastDate.localeCompare(a.lastDate)));
      })
      .catch(() => setTiles([]))
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = user.charAt(0).toUpperCase() + user.slice(1);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  // Групираме по относително време
  const groups: { key: string; label: string; tiles: LessonTile[] }[] = [];
  for (const g of ["week", "lastweek", "older"] as const) {
    const grouped = tiles.filter((t) => getGroup(t.lastDate) === g);
    if (grouped.length > 0) groups.push({ key: g, label: GROUP_LABELS[g], tiles: grouped });
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="px-4 pt-6 pb-5" style={{ backgroundColor: NAV.headerBg }}>
        <h1 className="text-white font-bold text-xl">Здравей, {displayName}! 👋</h1>
      </div>

      {/* Тяло */}
      <div className="flex-1 px-4 pt-4 pb-6">

        {/* Сканирай бутон */}
        <button
          onClick={() => navigate(`/${user}/scan`)}
          className="btn-press w-full rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm mb-5"
          style={{ backgroundColor: NAV.bg, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
        >
          <span className="text-base">📸</span>
          Сканирай нов урок
        </button>

        {/* Списък с уроци */}
        {loading ? (
          <p className="text-sm text-center" style={{ color: NAV.textMuted }}>Зарежда...</p>
        ) : tiles.length === 0 ? (
          <div className="text-center py-12" style={{ color: NAV.textMuted }}>
            <p className="text-4xl mb-3">📚</p>
            <p className="text-sm">Все още няма уроци.</p>
            <p className="text-sm">Сканирай първата страница!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: NAV.textMuted }}>
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.tiles.map((tile) => (
                    <LessonCard key={`${tile.subject}-${tile.lesson}`} tile={tile} user={user} router={router} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LessonCard({
  tile, user, router,
}: {
  tile: LessonTile;
  user: string;
  router: ReturnType<typeof useRouter>;
}) {
  const dotColor = SUBJECT_COLORS[tile.subject] ?? "#94A3B8";
  const subjectLabel = SUBJECT_LABELS[tile.subject] ?? tile.subject;
  function navigate(url: string) { setTimeout(() => router.push(url), 150); }

  return (
    <div
      className="rounded-xl p-3"
      style={{ backgroundColor: NAV.surface, border: `1px solid ${NAV.border}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: dotColor }} />
        <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: NAV.textMuted }}>
          {subjectLabel} · Урок {tile.lesson}
        </span>
      </div>
      {tile.title && (
        <p className="text-sm font-semibold mb-2 leading-snug" style={{ color: NAV.text }}>{tile.title}</p>
      )}
      <button
        onClick={() => navigate(`/${user}/confirm?subject=${tile.subject}&lesson=${tile.lesson}&title=${encodeURIComponent(tile.title)}`)}
        className="btn-press w-full rounded-lg py-2 text-xs font-semibold text-center"
        style={{ backgroundColor: NAV.bg, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
      >
        Отвори урока
      </button>
    </div>
  );
}
