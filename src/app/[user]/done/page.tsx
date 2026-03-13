"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SUBJECT_LABELS, Subject, MODULE_COLORS } from "@/types";

const BRAVO_BG = "#FFF4ED";

export default function DonePage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const saved = useRef(false);

  const mode = searchParams.get("mode");
  const isReview = mode === "review";
  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";

  const percent = Math.round((score / total) * 100);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (saved.current || isReview) return;
    saved.current = true;

    const duration = Math.round((Date.now() - startTime.current) / 60000);
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);

    const q1Raw = sessionStorage.getItem("quiz_1_result");
    const q1 = q1Raw ? JSON.parse(q1Raw) : { score: 0, total: 5, errors: [] };
    const q2Score = score - q1.score;

    const session = {
      date,
      subject,
      lesson: parseInt(lesson),
      started_at: time,
      duration_min: Math.max(duration, 1),
      type: "learn",
      completed: true,
      quiz_1: q1,
      quiz_2: { score: q2Score, total: 5, errors: [] },
    };

    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, session }),
    }).catch(console.error);
  }, [user, subject, lesson, score, isReview]);

  // ── Review mode ────────────────────────────────────────────────────────────
  if (isReview) {
    return (
      <div className="flex flex-col" style={{ backgroundColor: BRAVO_BG, height: "100dvh" }}>
        <div className="flex-none h-1.5 bg-white">
          <div className="h-full" style={{ backgroundColor: "#93C5FD", width: "100%" }} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-2">Готово!</h1>
          <p className="text-gray-500 text-base">Прегледа целия урок.</p>
        </div>
        <div className="flex-none px-5 py-4 bg-white">
          <button
            onClick={() => router.push(`/${user}`)}
            className="w-full h-12 rounded-2xl text-white font-bold text-base"
            style={{ backgroundColor: "#4A79A0" }}
          >
            Към началото
          </button>
        </div>
      </div>
    );
  }

  // ── Learn mode — celebration screen ───────────────────────────────────────
  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;

  return (
    <div className="flex flex-col" style={{ backgroundColor: BRAVO_BG, height: "100dvh" }}>
      {/* Прогрес — всичките 4 попълнени */}
      <div className="flex-none flex gap-1 px-4 pt-3 pb-0 bg-white">
        {[
          { color: "#93C5FD" },
          { color: "#86EFAC" },
          { color: "#FDE047" },
          { color: "#D8B4FE" },
        ].map((m, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: m.color }} />
        ))}
      </div>

      {/* Navbar */}
      <div className="flex-none bg-white px-4 py-3">
        <button
          onClick={() => router.push(`/${user}`)}
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      </div>

      {/* Съдържание */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto">
        <div className="text-7xl mb-4">🏆</div>

        <h1 className="text-3xl font-bold mb-1">Браво!</h1>
        <p className="text-lg text-gray-600 mb-1">Завърши целия урок!</p>
        <p className="text-sm text-gray-400 mb-8">{subjectLabel} · Урок {lesson}</p>

        {/* Модули — всичките завършени */}
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4].map((m) => (
            <div
              key={m}
              className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
              style={{ backgroundColor: MODULE_COLORS[m], border: "2px solid #D1D5DB" }}
            >
              ✓
            </div>
          ))}
        </div>

        {/* Резултат */}
        <div
          className="w-full rounded-2xl px-6 py-4 mb-2"
          style={{ backgroundColor: percent >= 80 ? "#D1FAE5" : "#FEF3C7" }}
        >
          <p
            className="text-4xl font-bold mb-0.5"
            style={{ color: percent >= 80 ? "#065F46" : "#78350F" }}
          >
            {score}/{total}
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: percent >= 80 ? "#065F46" : "#78350F" }}
          >
            {percent}% верни отговора в quiz-овете
          </p>
        </div>

        <p className="text-sm text-gray-400 mb-2">
          {percent >= 80
            ? "Готов си за преговора! 🎯"
            : "Добра работа — преговорът ще помогне!"}
        </p>
      </div>

      {/* Бутони */}
      <div className="flex-none flex flex-col gap-3 px-5 py-4 bg-white">
        <button
          onClick={() => router.push(`/${user}/reinforcement?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
          className="w-full h-12 rounded-2xl text-white font-bold text-base"
          style={{ backgroundColor: "#6B4F96" }}
        >
          Вземи теста за преговор →
        </button>
        <button
          onClick={() => router.push(`/${user}`)}
          className="w-full h-12 rounded-2xl font-bold text-base text-gray-500"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          Към началото
        </button>
      </div>
    </div>
  );
}
