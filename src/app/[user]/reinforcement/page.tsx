"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Sessions, SUBJECT_LABELS, Subject } from "@/types";

interface QuizResult {
  date: string;
  score: number;
  total: number;
  type: "learn" | "reinforcement";
}

export default function ReinforcementPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const params = searchParams.toString();

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/session?user=${user}`)
      .then((r) => r.json())
      .then((data: Sessions) => {
        const relevant = (data.sessions ?? []).filter(
          (s) => s.subject === subject && String(s.lesson) === lesson && s.type === "reinforcement"
        );
        const mapped: QuizResult[] = relevant.map((s) => ({
          date: s.date,
          score: (s as { score: number }).score,
          total: (s as { total: number }).total,
          type: s.type,
        }));
        setResults(mapped.reverse());
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [user, subject, lesson]);

  const best = results.length > 0
    ? results.reduce((a, b) => (a.score / a.total > b.score / b.total ? a : b))
    : null;

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 mt-4">
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press rounded-xl flex items-center justify-center font-bold text-base flex-none"
          style={{ width: 46, height: 46, backgroundColor: NAV.surface, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
        >
          ‹
        </button>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {SUBJECT_LABELS[subject as Subject] ?? subject}
          </p>
          <h1 className="text-xl font-bold">Преговор · Урок {lesson}</h1>
        </div>
      </div>

      {/* Най-добър резултат */}
      {best && (
        <div
          className="rounded-2xl p-5 mb-6 text-center"
          style={{ backgroundColor: best.score / best.total >= 0.8 ? "#DCFCE7" : "#FEF9C3" }}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Най-добър резултат</p>
          <p className="text-4xl font-bold" style={{ color: best.score / best.total >= 0.8 ? "#15803D" : "#92400E" }}>
            {best.score}/{best.total}
          </p>
        </div>
      )}

      {/* История */}
      {loading ? (
        <p className="text-gray-400 text-center mb-6">Зарежда...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-400 text-center mb-6">Все още няма резултати за този урок.</p>
      ) : (
        <div className="space-y-2 mb-6">
          <p className="text-sm font-bold text-gray-500 mb-2">История</p>
          {results.map((r, i) => (
            <div key={i} className="flex justify-between items-center rounded-xl p-3 bg-gray-50">
              <div>
                <p className="text-sm font-bold">{r.date}</p>
                <p className="text-xs text-gray-400">{r.type === "learn" ? "Урок" : "Преговор"}</p>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: r.score / r.total >= 0.8 ? "#22C55E" : "#F59E0B" }}
              >
                {r.score}/{r.total}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Бутон */}
      <button
        onClick={() => navigate(`/${user}/reinforcement/quiz?${params}`)}
        className="btn-press w-full py-5 rounded-2xl text-white text-xl font-bold flex items-center justify-center gap-3"
        style={{ backgroundColor: "#7C3AED" }}
      >
        <span>📖</span>
        Започни Преговор
      </button>
    </main>
  );
}
