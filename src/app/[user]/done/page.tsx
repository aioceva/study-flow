"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, startTransition } from "react";
import { SUBJECT_LABELS, Subject, NAV, MODULE_BTN } from "@/types";
import Image from "next/image";

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
  const startTime = useRef(Date.now());

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;
  const accentColor = MODULE_BTN[3]; // топло злато за subject label

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

  // ── Review mode ────────────────────────────────────────────────────────────
  if (isReview) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
        <div className="h-[38px]" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2.5 text-center">
          <Image src="/icons/icon-trophy-glow.svg" width={96} height={96} alt="trophy" />
          <h1 className="font-bold text-xl" style={{ color: NAV.text }}>Готово!</h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>Прегледа целия урок.</p>
          <p className="text-xs font-semibold" style={{ color: accentColor }}>
            {subjectLabel} · Урок {lesson}
          </p>
        </div>
        <div className="px-4 pb-6">
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

  // ── Learn mode ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
      <div className="h-[38px]" />
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2.5 text-center">
        <Image src="/icons/icon-trophy-glow.svg" width={96} height={96} alt="trophy" />
        <h1 className="font-bold text-xl" style={{ color: NAV.text }}>Браво!</h1>
        <p className="text-sm" style={{ color: NAV.textMuted }}>Завърши целия урок!</p>
        <p className="text-xs font-semibold" style={{ color: accentColor }}>
          {subjectLabel} · Урок {lesson}
        </p>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-3">
        <button
          onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
          className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Провери знанията си →
        </button>
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press w-full rounded-xl py-3 font-semibold text-sm text-center"
          style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
        >
          Към началото
        </button>
      </div>
    </div>
  );
}
