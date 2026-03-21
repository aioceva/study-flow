"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { NAV, SUBJECT_LABELS, Subject } from "@/types";

const SUBJECT_COLORS: Record<string, string> = {
  math: "#4F8EF7",
  bio:  "#22C55E",
  chem: "#F59E0B",
  phys: "#EF4444",
  hist: "#A78BFA",
  lit:  "#EC4899",
  gen:  "#94A3B8",
};

export default function ConfirmPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const subjectBg = searchParams.get("subject_bg") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";
  const params = searchParams.toString();

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subjectBg ?? subject;
  const dotColor = SUBJECT_COLORS[subject] ?? "#94A3B8";

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър: ← вляво, 🏠 вдясно */}
      <div className="flex-none flex items-center justify-between px-4 py-2">
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: NAV.surface, border: `2px solid ${NAV.btnBorder}`, color: NAV.text }}
          aria-label="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
        </button>
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-10 h-10 flex items-center justify-center"
          style={{ opacity: 0.5 }}
          aria-label="Начало"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      </div>

      {/* Съдържание */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">

        {/* Карта на урока — стил от Home */}
        <div
          className="w-full rounded-2xl"
          style={{
            backgroundColor: NAV.bg,
            border: `1px solid ${NAV.border}`,
            boxShadow: "0 2px 8px rgba(44,62,93,0.07)",
          }}
        >
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full flex-none" style={{ backgroundColor: dotColor }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: NAV.textMuted }}>
                  {subjectLabel} · Урок {lesson}
                </span>
              </div>
              {title && (
                <p className="text-base font-bold leading-snug" style={{ color: NAV.text }}>{title}</p>
              )}
            </div>

            {/* Play бутон */}
            <button
              onClick={() => navigate(`/${user}/lesson/1/1?${params}`)}
              className="btn-press flex-none w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: NAV.btnSolid }}
              aria-label="Започни урока"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Бутони под картата */}
      <div className="flex-none px-5 pb-8 space-y-3">
        <button
          onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
          className="btn-press w-full rounded-2xl py-4 text-white font-bold text-base text-center"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          🏆 Quiz
        </button>
        <button
          onClick={() => navigate(`/${user}/lesson/1/1?${params}&mode=review`)}
          className="btn-press w-full rounded-2xl py-4 font-bold text-base text-center border-2"
          style={{ color: NAV.text, borderColor: NAV.btnBorder, backgroundColor: NAV.bg }}
        >
          🔄 Преговор
        </button>
      </div>
    </div>
  );
}
