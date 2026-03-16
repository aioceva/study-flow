"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { NAV, SUBJECT_LABELS, Subject, Sessions } from "@/types";
import Image from "next/image";

interface LastResult {
  score: number;
  total: number;
  date: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "днес";
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return `преди ${diffDays} дни`;
  return dateStr;
}

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

  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  useEffect(() => {
    fetch(`/api/session?user=${user}`)
      .then((r) => r.json())
      .then((data: Sessions) => {
        const relevant = (data.sessions ?? [])
          .filter((s) => s.subject === subject && String(s.lesson) === lesson && s.type === "reinforcement")
          .sort((a, b) => b.date.localeCompare(a.date));
        if (relevant.length > 0) {
          const last = relevant[0] as { score: number; total: number; date: string };
          setLastResult({ score: last.score, total: last.total, date: last.date });
        }
      })
      .catch(() => {});
  }, [user, subject, lesson]);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const percent = lastResult ? Math.round((lastResult.score / lastResult.total) * 100) : null;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Home icon */}
      <div className="flex-none px-4 py-2">
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-8 h-8 flex items-center justify-center"
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <Image src="/icons/icon-lesson.svg" width={72} height={72} alt="урок" />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: NAV.textMuted }}>
          {subjectLabel}
        </p>
        <h1 className="text-2xl font-bold leading-snug" style={{ color: NAV.text }}>
          Урок {lesson}{title ? ` · ${title}` : ""}
        </h1>

        {/* Резултат от последен преговор */}
        {lastResult && percent !== null && (
          <div
            className="w-full rounded-2xl px-5 py-4 mt-2 text-left"
            style={{ backgroundColor: percent >= 80 ? "#DCFCE7" : NAV.surface }}
          >
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: NAV.textMuted }}>
              Последен преговор · {formatDate(lastResult.date)}
            </p>
            <div className="h-2 rounded-full mb-2" style={{ backgroundColor: NAV.border }}>
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${percent}%`,
                  backgroundColor: percent >= 80 ? "#22C55E" : NAV.btnSolid,
                }}
              />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: percent >= 80 ? "#15803D" : NAV.text }}>
              {percent}%
            </p>
          </div>
        )}
      </div>

      {/* Бутони */}
      <div className="flex-none px-4 pb-6 pt-3 space-y-2">
        <button
          onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
          className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Провери знанията си →
        </button>
        <button
          onClick={() => navigate(`/${user}/lesson/1/1?${params}`)}
          className="btn-press w-full rounded-xl py-3 font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.surface, color: NAV.text }}
        >
          Прегледай урока
        </button>
      </div>
    </div>
  );
}
