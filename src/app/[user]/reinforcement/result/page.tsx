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
  const emoji = perfect ? "🏆" : percent >= 80 ? "🌟" : "💪";

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="flex-none flex items-center justify-end px-4 py-3">
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

      {/* Съдържание */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ gap: 14 }}>

        <div style={{ fontSize: 36 }}>{emoji}</div>

        <h1 className="text-xl font-bold" style={{ color: NAV.text }}>Браво!</h1>

        <p style={{ fontSize: 48, fontWeight: 700, color: NAV.text, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {percent}%
        </p>

        {/* Progress bar */}
        <div className="w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: NAV.surface }}>
          <div
            className="rounded-full"
            style={{ width: `${percent}%`, height: "100%", backgroundColor: NAV.btnSolid }}
          />
        </div>

        {/* Обобщение */}
        {perfect ? (
          <p className="text-base" style={{ color: NAV.textMuted }}>Всичко правилно</p>
        ) : (
          <p className="text-base" style={{ color: NAV.textMuted }}>
            Ти научи {missed} {missed === 1 ? "нещо" : "неща"} днес
          </p>
        )}

      </div>

      {/* Бутони */}
      <div className="flex-none px-4 pb-6 pt-3 space-y-2">
        {!perfect && (
          <button
            onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}`)}
            className="btn-press w-full rounded-xl py-4 text-white font-medium text-base"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            Опитай пак →
          </button>
        )}
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-full rounded-xl py-4 font-medium text-base"
          style={{
            backgroundColor: perfect ? NAV.btnSolid : NAV.surface,
            color: perfect ? "#FFFFFF" : NAV.text,
          }}
        >
          Към началото
        </button>
      </div>

    </div>
  );
}
