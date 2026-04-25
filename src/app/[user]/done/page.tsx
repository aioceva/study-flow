"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, startTransition } from "react";
import { SUBJECT_LABELS, Subject, NAV, Adaptation } from "@/types";

export default function DonePage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const saved = useRef(false);

  const mode = searchParams.get("mode");
  const isTest = mode === "test";
  const run = searchParams.get("run");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";

  function homeUrl() {
    return isTest ? `/${user}?mode=test` : `/${user}`;
  }

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;
  const startTime = useRef(Date.now());
  const [duration, setDuration] = useState<number>(0);
  const [totalCards, setTotalCards] = useState<number | null>(null);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;

    const dur = Math.max(Math.round((Date.now() - startTime.current) / 60000), 1);
    setDuration(dur);

    // Run mode не записва в sessions — read-only test преглед
    if (run) return;

    const now = new Date();

    // Изчисти partial ключа — урокът е завършен
    sessionStorage.removeItem(`partial_sent_${subject}_${lesson}`);

    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user,
        session: {
          date: now.toISOString().split("T")[0],
          subject,
          lesson: parseInt(lesson),
          started_at: now.toTimeString().slice(0, 5),
          duration_min: dur,
          type: "learn",
          status: "completed",
          completed: true,
        },
      }),
    }).catch(console.error);
  }, [user, subject, lesson, run]);

  useEffect(() => {
    const url = run
      ? `/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}&run=${run}`
      : `/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.exists && data.adaptation) {
          const a: Adaptation = data.adaptation;
          setTotalCards(a.modules.reduce((sum, m) => sum + m.cards.length, 0));
        }
      })
      .catch(() => {});
  }, [user, subject, lesson, run]);

  // ── Shared header ────────────────────────────────────────────────────────────
  const lessonHeader = (
    <div className="flex-none flex items-center justify-between px-4 py-3">
      <button
        onClick={() => navigate(homeUrl())}
        className="btn-press flex items-center gap-2"
        aria-label="Назад"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}>
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        <span className="text-xl font-bold" style={{ color: NAV.text }}>
          {subjectLabel} · Урок {lesson}
        </span>
      </button>
      <button
        onClick={() => navigate(homeUrl())}
        className="btn-press w-10 h-10 flex items-center justify-center"
        style={{ opacity: 0.4 }}
        aria-label="Начало"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
      {lessonHeader}

      {/* Центрирана зона — трофей + текст + статистика */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-3 text-center">
        <div className="flex items-center justify-center rounded-2xl" style={{ width: 80, height: 80, backgroundColor: "#EBF4FF" }}>
          <span style={{ fontSize: 40 }}>🏆</span>
        </div>
        <div>
          <h1 className="font-bold text-2xl mb-1" style={{ color: NAV.text }}>Браво!</h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>Завърши целия урок!</p>
        </div>
        {/* Статистика pill */}
        {(totalCards !== null || duration > 0) && (
          <div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm"
            style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
          >
            <span style={{ fontSize: 6, color: NAV.btnSolid }}>●</span>
            {totalCards !== null && <span>{totalCards} карти</span>}
            {totalCards !== null && duration > 0 && <span>·</span>}
            {duration > 0 && <span>{duration} {duration === 1 ? "минута" : "минути"}</span>}
          </div>
        )}
      </div>

      {/* Разделител */}
      <div style={{ height: 1, backgroundColor: NAV.border, marginLeft: 20, marginRight: 20 }} />

      {/* Долна зона — quiz секция */}
      <div className="flex-none px-5 pt-4 pb-8 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider uppercase" style={{ color: NAV.textMuted }}>
            Проверка на знанията
          </p>
          <p className="text-sm" style={{ color: NAV.textMuted }}>
            10 въпроса · ~3 минути.{"\n"}Тествай колко добре си запомнил урока.
          </p>
        </div>
        <button
          onClick={() => {
            const sp = new URLSearchParams({ subject, lesson, title });
            if (isTest) sp.set("mode", "test");
            if (run) sp.set("run", run);
            navigate(`/${user}/reinforcement/quiz?${sp.toString()}`);
          }}
          className="btn-press w-full rounded-2xl text-white font-medium text-base flex items-center justify-center gap-3"
          style={{ backgroundColor: NAV.btnSolid, height: 56 }}
          type="button"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            🏆
          </div>
          Провери знанията
        </button>
        <button
          onClick={() => navigate(homeUrl())}
          className="btn-press w-full rounded-2xl font-medium text-base text-center"
          style={{ backgroundColor: NAV.surface, color: NAV.text, height: 52 }}
        >
          Към началото
        </button>
      </div>
    </div>
  );
}
