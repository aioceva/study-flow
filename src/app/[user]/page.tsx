"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sessions, SUBJECT_LABELS, Subject, NAV, MODULE_BTN } from "@/types";

interface LessonTile {
  subject: Subject;
  lesson: number;
  lastDate: string;
  sessionCount: number;
}

export default function UserHome() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const [tiles, setTiles] = useState<LessonTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/session?user=${user}`)
      .then((r) => r.json())
      .then((data: Sessions) => {
        const map = new Map<string, LessonTile>();
        for (const s of data.sessions ?? []) {
          const key = `${s.subject}-${s.lesson}`;
          const existing = map.get(key);
          if (!existing || s.date > existing.lastDate) {
            map.set(key, {
              subject: s.subject as Subject,
              lesson: s.lesson,
              lastDate: s.date,
              sessionCount: (existing?.sessionCount ?? 0) + 1,
            });
          } else {
            existing.sessionCount += 1;
          }
        }
        setTiles(Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate)));
      })
      .catch(() => setTiles([]))
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = user.charAt(0).toUpperCase() + user.slice(1);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="px-4 pt-6 pb-5" style={{ backgroundColor: NAV.headerBg }}>
        <div className="text-2xl mb-2">👋</div>
        <h1 className="text-white font-bold text-xl mb-1">Здравей, {displayName}!</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Какво учим днес?</p>
      </div>

      {/* Тяло */}
      <div className="flex-1 px-4 pt-4">

        {/* Сканирай бутон */}
        <button
          onClick={() => navigate(`/${user}/scan`)}
          className="btn-press w-full rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm mb-5"
          style={{ backgroundColor: NAV.bg, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
        >
          <span className="text-base">📷</span>
          Сканирай нов урок
        </button>

        {/* Последни уроци */}
        {loading ? (
          <p className="text-sm text-center" style={{ color: NAV.textMuted }}>Зарежда...</p>
        ) : tiles.length === 0 ? (
          <div className="text-center py-12" style={{ color: NAV.textMuted }}>
            <p className="text-4xl mb-3">📚</p>
            <p className="text-sm">Все още няма уроци.</p>
            <p className="text-sm">Сканирай първата страница!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="font-semibold text-xs" style={{ color: NAV.textMuted }}>Последни уроци</h2>
            {tiles.map((tile) => (
              <LessonCard key={`${tile.subject}-${tile.lesson}`} tile={tile} user={user} router={router} />
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
  // Dot color: determinstic from subject
  const subjects = ["math","bio","chem","phys","hist","lit","gen"];
  const dotColor = MODULE_BTN[(subjects.indexOf(tile.subject) % 4) + 1] ?? MODULE_BTN[1];
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
          {subjectLabel}
        </span>
      </div>
      <p className="font-bold text-sm mb-2" style={{ color: NAV.text }}>Урок {tile.lesson}</p>
      <button
        onClick={() => navigate(`/${user}/confirm?subject=${tile.subject}&lesson=${tile.lesson}`)}
        className="btn-press w-full rounded-lg py-2 text-xs font-semibold text-center"
        style={{ backgroundColor: NAV.bg, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
      >
        Отвори урока
      </button>
    </div>
  );
}
