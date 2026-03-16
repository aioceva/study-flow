"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { NAV } from "@/types";

export default function ReinforcementResultPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const percent = Math.round((score / total) * 100);
  const perfect = score === total;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">{perfect ? "🏆" : percent >= 80 ? "🌟" : "💪"}</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: NAV.text }}>
          {perfect ? "Овладя урока напълно!" : percent >= 80 ? "Отлично!" : "Добра работа!"}
        </h1>

        <div
          className="w-full rounded-2xl px-6 py-5 mt-6"
          style={{ backgroundColor: percent >= 80 ? "#DCFCE7" : "#FEF9C3" }}
        >
          <p className="text-5xl font-bold mb-1" style={{ color: percent >= 80 ? "#15803D" : "#92400E" }}>
            {score}/{total}
          </p>
          <p className="text-base font-bold" style={{ color: percent >= 80 ? "#15803D" : "#92400E" }}>
            {percent}% верни отговори
          </p>
        </div>
      </div>

      <div className="flex-none px-4 pb-6 pt-3 flex gap-2">
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press rounded-xl flex items-center justify-center font-bold text-base flex-none"
          style={{ width: 46, height: 46, backgroundColor: NAV.surface, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
        >
          ‹
        </button>
        <button
          onClick={() => navigate(
            perfect
              ? `/${user}`
              : `/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}`
          )}
          className="btn-press flex-1 rounded-xl text-white font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.btnSolid, height: 46 }}
        >
          {perfect ? "Към началото" : "Опитай пак →"}
        </button>
      </div>
    </div>
  );
}
