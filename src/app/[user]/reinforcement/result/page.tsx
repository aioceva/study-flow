"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function ReinforcementResultPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const percent = Math.round((score / total) * 100);
  const perfect = score === total;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="text-6xl mb-4">{perfect ? "🏆" : percent >= 80 ? "🌟" : "💪"}</div>
      <h1 className="text-3xl font-bold mb-2">
        {perfect ? "Овладя урока напълно!" : percent >= 80 ? "Отлично!" : "Добра работа!"}
      </h1>

      <div
        className="w-full rounded-2xl p-6 my-8"
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
        {!perfect && (
          <button
            onClick={() => router.push(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}`)}
            className="w-full py-4 rounded-2xl font-bold text-base border-2 border-purple-300 text-purple-700"
          >
            📖 Опитай пак
          </button>
        )}
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
