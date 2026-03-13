"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SUBJECT_LABELS, Subject } from "@/types";

export default function DonePage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const saved = useRef(false);

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";

  const percent = Math.round((score / total) * 100);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (saved.current) return;
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
  }, [user, subject, lesson, score]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="text-6xl mb-4">{percent >= 80 ? "🏆" : "👍"}</div>

      <h1 className="text-3xl font-bold mb-2">
        {percent >= 80 ? "Браво!" : "Добра работа!"}
      </h1>
      <p className="text-gray-500 mb-8">
        {SUBJECT_LABELS[subject as Subject] ?? subject} · Урок {lesson}
      </p>

      {/* Резултат */}
      <div
        className="w-full rounded-2xl p-6 mb-8"
        style={{ backgroundColor: percent >= 80 ? "#DCFCE7" : "#FEF9C3" }}
      >
        <p className="text-5xl font-bold mb-1" style={{ color: percent >= 80 ? "#15803D" : "#92400E" }}>
          {score}/{total}
        </p>
        <p className="text-base font-bold" style={{ color: percent >= 80 ? "#15803D" : "#92400E" }}>
          {percent}% верни отговори
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={() => router.push(`/${user}/reinforcement?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
          className="w-full py-4 rounded-2xl font-bold text-base border-2 border-purple-200 text-purple-600"
        >
          🔁 Reinforcement
        </button>
        <button
          onClick={() => router.push(`/${user}`)}
          className="w-full py-4 rounded-2xl text-white font-bold text-base"
          style={{ backgroundColor: "#4F8EF7" }}
        >
          Към началото
        </button>
      </div>
    </main>
  );
}
