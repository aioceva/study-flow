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

  const missed = total - score;
  const percent = Math.round((score / total) * 100);
  const perfect = score === total;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
      {/* Хедър: ← вляво, 🏠 вдясно */}
      <div className="flex-none flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(`/${user}/reinforcement`)}
          className="btn-press w-8 h-8 flex items-center justify-center"
          style={{ opacity: 0.55 }}
          aria-label="Назад"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-8 h-8 flex items-center justify-center"
          style={{ opacity: 0.4 }}
          aria-label="Начало"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">

        <div className="text-6xl">{perfect ? "🏆" : percent >= 80 ? "🌟" : "💪"}</div>

        <div>
          <h1 className="text-3xl font-bold" style={{ color: NAV.text }}>
            {score} от {total} познати!
          </h1>
          {missed > 0 && (
            <p className="text-base mt-2" style={{ color: NAV.textMuted }}>
              Супер, научи кои {missed} {missed === 1 ? "нещо не знаеш" : "неща не знаеш"}!
            </p>
          )}
        </div>

        <div
          className="w-full rounded-2xl px-6 py-4"
          style={{ backgroundColor: percent >= 80 ? "#DCFCE7" : "#FEF9C3" }}
        >
          <div className="h-2 rounded-full mb-2" style={{ backgroundColor: percent >= 80 ? "#BBF7D0" : "#FDE68A" }}>
            <div
              className="h-2 rounded-full"
              style={{
                width: `${percent}%`,
                backgroundColor: percent >= 80 ? "#22C55E" : "#F59E0B",
              }}
            />
          </div>
          <p className="text-2xl font-bold" style={{ color: percent >= 80 ? "#15803D" : "#92400E" }}>
            {percent}%
          </p>
        </div>

        {!perfect && (
          <p className="text-base font-semibold" style={{ color: NAV.textMuted }}>
            Искаш ли да пробваш пак?
          </p>
        )}
      </div>

      <div className="flex-none px-4 pb-6 pt-3 space-y-2">
        {!perfect && (
          <button
            onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}`)}
            className="btn-press w-full rounded-xl py-4 text-white font-bold text-base"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            Опитай пак →
          </button>
        )}
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-full rounded-xl py-4 font-bold text-base"
          style={{
            backgroundColor: perfect ? NAV.btnSolid : NAV.surface,
            color: perfect ? "#FFFFFF" : NAV.text,
          }}
        >
          {perfect ? "Към началото" : "Приключих с урока"}
        </button>
      </div>
    </div>
  );
}
