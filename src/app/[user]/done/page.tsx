"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, startTransition } from "react";
import { SUBJECT_LABELS, Subject, NAV } from "@/types";
import Image from "next/image";
import { LessonCard } from "@/components/LessonCard";

export default function DonePage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const saved = useRef(false);

  const mode = searchParams.get("mode");
  const isReview = mode === "review";
  const score = parseInt(searchParams.get("score") ?? "0");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;
  const startTime = useRef(Date.now());

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

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

    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user,
        session: {
          date, subject, lesson: parseInt(lesson),
          started_at: time, duration_min: Math.max(duration, 1),
          type: "learn", completed: true,
          quiz_1: q1, quiz_2: { score: q2Score, total: 5, errors: [] },
        },
      }),
    }).catch(console.error);
  }, [user, subject, lesson, score, isReview]);

  // ── Shared home icon ────────────────────────────────────────────────────────
  const homeIconBtn = (
    <button
      onClick={() => navigate(`/${user}`)}
      className="btn-press w-10 h-10 flex items-center justify-center rounded-xl"
      style={{ backgroundColor: NAV.surface }}
      aria-label="Начало"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    </button>
  );

  // ── Review mode ─────────────────────────────────────────────────────────────
  if (isReview) {
    return (
      <div className="flex flex-col" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
        <div className="flex-none flex justify-end px-4 py-2">
          {homeIconBtn}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4 text-center">
          <Image src="/icons/icon-trophy-glow.svg" width={80} height={80} alt="trophy" />
          <div>
            <h1 className="font-bold text-xl mb-1" style={{ color: NAV.text }}>Готово!</h1>
            <p className="text-sm" style={{ color: NAV.textMuted }}>Прегледа целия урок.</p>
          </div>
          <div className="w-full">
            <LessonCard
              subject={subject}
              lesson={lesson}
              title={title}
              subjectLabel={subjectLabel}
              showPlayButton={false}
            />
          </div>
        </div>
        <div className="flex-none px-5 pb-8">
          <button
            onClick={() => navigate(`/${user}`)}
            className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm text-center"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            Към началото
          </button>
        </div>
      </div>
    );
  }

  // ── Learn mode ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
      <div className="flex-none flex justify-end px-4 py-2">
        {homeIconBtn}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4 text-center">
        <Image src="/icons/icon-trophy-glow.svg" width={80} height={80} alt="trophy" />
        <div>
          <h1 className="font-bold text-xl mb-1" style={{ color: NAV.text }}>Браво!</h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>Завърши целия урок!</p>
        </div>
        <div className="w-full">
          <LessonCard
            subject={subject}
            lesson={lesson}
            title={title}
            subjectLabel={subjectLabel}
            showPlayButton={false}
          />
        </div>
      </div>
      <div className="flex-none px-5 pb-8 space-y-2">
        <button
          onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
          className="btn-press w-full rounded-xl text-white font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.btnSolid, height: 52 }}
        >
          Провери знанията си →
        </button>
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-full rounded-xl font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.surface, color: NAV.text, height: 52 }}
        >
          За днес толкова
        </button>
      </div>
    </div>
  );
}
