"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sessions, Subject, NAV } from "@/types";
import Link from "next/link";
import { LessonCard } from "@/components/LessonCard";

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
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* Хамбургер overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setMenuOpen(false)}
        >
          {/* Drawer */}
          <div
            className="w-64 h-full flex flex-col py-8 px-6"
            style={{ backgroundColor: NAV.bg, borderRight: `1px solid ${NAV.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-press self-end mb-6 p-2"
              aria-label="Затвори менюто"
              onClick={() => setMenuOpen(false)}
              style={{ color: NAV.text }}
            >
              ✕
            </button>
            <Link
              href={`/${user}/parent`}
              className="btn-press text-base font-medium py-3 px-4 rounded-xl"
              style={{ color: NAV.text, backgroundColor: NAV.surface }}
              onClick={() => setMenuOpen(false)}
            >
              История
            </Link>
          </div>
          {/* Тъмен фон */}
          <div className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />
        </div>
      )}

      {/* Хедър */}
      <div className="px-4 pt-6 pb-5 flex items-center gap-3" style={{ backgroundColor: NAV.headerBg }}>
        <button
          className="btn-press flex flex-col gap-1 p-1"
          aria-label="Меню"
          onClick={() => setMenuOpen(true)}
        >
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
        </button>
        <h1 className="text-white font-bold text-xl">Здравей, {displayName}! 👋</h1>
      </div>

      {/* Тяло */}
      <div className="flex-1 px-4 pt-4 pb-6">

        {/* Сканирай бутон */}
        <button
          onClick={() => navigate(`/${user}/scan`)}
          className="btn-press w-full rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium text-base mb-5"
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
                <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: NAV.textMuted }}>
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.tiles.map((tile) => (
                    <LessonCard
                      key={`${tile.subject}-${tile.lesson}`}
                      subject={tile.subject}
                      lesson={tile.lesson}
                      title={tile.title}
                      onClick={() => navigate(`/${user}/confirm?subject=${tile.subject}&lesson=${tile.lesson}&title=${encodeURIComponent(tile.title)}`)}
                    />
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

