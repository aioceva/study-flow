"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sessions, SUBJECT_LABELS, Subject } from "@/types";

interface LessonTile {
  subject: Subject;
  lesson: number;
  title?: string;
  lastDate: string;
  lastScore?: { score: number; total: number };
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
          const score =
            s.type === "learn"
              ? { score: s.quiz_2.score, total: s.quiz_2.total }
              : { score: s.score, total: s.total };
          if (!existing || s.date > existing.lastDate) {
            map.set(key, {
              subject: s.subject as Subject,
              lesson: s.lesson,
              lastDate: s.date,
              lastScore: score,
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

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      {/* Заглавие */}
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold capitalize">{user}</h1>
        <p className="text-gray-500 text-base">Какво учим днес?</p>
      </div>

      {/* Бутон сканирай */}
      <button
        onClick={() => router.push(`/${user}/scan`)}
        className="w-full py-5 rounded-2xl text-white text-xl font-bold mb-8 flex items-center justify-center gap-3"
        style={{ backgroundColor: "#4F8EF7" }}
      >
        <span className="text-2xl">📷</span>
        Сканирай нов урок
      </button>

      {/* Последни уроци */}
      {loading ? (
        <p className="text-gray-400 text-center">Зарежда...</p>
      ) : tiles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p>Все още няма уроци.</p>
          <p>Сканирай първата страница!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-600">Последни уроци</h2>
          {tiles.map((tile) => (
            <LessonCard key={`${tile.subject}-${tile.lesson}`} tile={tile} user={user} router={router} />
          ))}
        </div>
      )}
    </main>
  );
}

function LessonCard({
  tile,
  user,
  router,
}: {
  tile: LessonTile;
  user: string;
  router: ReturnType<typeof useRouter>;
}) {
  const moduleColor: Record<number, string> = { 0: "#E8F4FD" };
  const bgColor = "#F8F9FA";

  return (
    <div className="rounded-2xl p-4 border border-gray-100" style={{ backgroundColor: bgColor }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            {SUBJECT_LABELS[tile.subject] ?? tile.subject}
          </span>
          <h3 className="font-bold text-lg">Урок {tile.lesson}</h3>
          <p className="text-sm text-gray-400">{tile.lastDate}</p>
        </div>
        {tile.lastScore && (
          <div className="text-right">
            <span className="text-2xl font-bold" style={{ color: tile.lastScore.score / tile.lastScore.total >= 0.8 ? "#22C55E" : "#F59E0B" }}>
              {tile.lastScore.score}/{tile.lastScore.total}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            router.push(
              `/${user}/lesson/1/1?subject=${tile.subject}&lesson=${tile.lesson}&mode=review`
            )
          }
          className="flex-1 py-2 rounded-xl text-sm font-bold border-2 border-blue-200 text-blue-600"
        >
          Отвори урока
        </button>
        <button
          onClick={() =>
            router.push(
              `/${user}/reinforcement?subject=${tile.subject}&lesson=${tile.lesson}`
            )
          }
          className="flex-1 py-2 rounded-xl text-sm font-bold border-2 border-purple-200 text-purple-600"
        >
          📖 Преговор
        </button>
      </div>
    </div>
  );
}
