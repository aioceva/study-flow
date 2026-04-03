"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Quiz, QuizQuestion, NAV, SUBJECT_LABELS, Subject } from "@/types";

type Phase = "answering" | "correct" | "wrong" | "fact";

const LABEL_PALETTE = [
  { bg: "#E8F4FD", color: "#3B6FA8" }, // светлосиньо
  { bg: "#E8F9F1", color: "#2E7D5A" }, // светлозелено
  { bg: "#F3E8FD", color: "#7B52A8" }, // светлолилаво
];

const CONFETTI_COLORS = [
  "#6FA3E8", "#6DC297", "#C49020", "#A384CC",
  "#F5A623", "#E05555", "#50C8A0", "#FF9500",
];
const CONFETTI_COUNT = 16;

export default function ReinforcementQuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject      = searchParams.get("subject") ?? "";
  const lesson       = searchParams.get("lesson")  ?? "";
  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const [questions,  setQuestions]  = useState<QuizQuestion[]>([]);
  const [current,    setCurrent]    = useState(0);
  const [phase,      setPhase]      = useState<Phase>("answering");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score,      setScore]      = useState(0);
  const [errors,     setErrors]     = useState<number[]>([]);
  const scoreRef = useRef(0); // sync ref — избягва stale closure при async timer callbacks

  // Timer progress 0→1
  const [timerPct, setTimerPct] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number>(0);

  // Confetti origin (fixed position at correct btn center)
  const correctDivRef   = useRef<HTMLDivElement>(null);
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null);

  // Alternating backgrounds (0-indexed: Q1=index0=нечетен=бял)
  const isEvenQ      = current % 2 === 1;
  const screenBg     = isEvenQ ? NAV.surface : "#FFFFFF";
  const defaultCardBg = isEvenQ ? "#FFFFFF"  : NAV.surface;

  useEffect(() => {
    async function load() {
      let quiz: Quiz | null = null;
      const raw = sessionStorage.getItem("quiz");
      if (raw) {
        const parsed = JSON.parse(raw) as Quiz;
        if (parsed.meta.subject === subject && String(parsed.meta.lesson) === lesson) {
          quiz = parsed;
        }
      }
      if (!quiz) {
        const res  = await fetch(`/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`);
        const json = await res.json();
        if (!json.exists || !json.quiz) return;
        quiz = json.quiz;
        sessionStorage.setItem("quiz", JSON.stringify(quiz));
        if (json.adaptation) sessionStorage.setItem("adaptation", JSON.stringify(json.adaptation));
      }
      if (!quiz) return;
      const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
    }
    load();
  }, [user, subject, lesson]);

  // Capture button position when phase becomes "correct"
  useEffect(() => {
    if (phase === "correct" && correctDivRef.current) {
      const rect = correctDivRef.current.getBoundingClientRect();
      setConfettiOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    } else {
      setConfettiOrigin(null);
    }
  }, [phase]);

  function clearTimers() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current)   cancelAnimationFrame(rafRef.current);
  }

  function startTimer(durationMs: number, onEnd: () => void) {
    setTimerPct(0);
    startRef.current = performance.now();

    function tick(now: number) {
      const p = Math.min((now - startRef.current) / durationMs, 1);
      setTimerPct(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onEnd();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function advanceQuestion() {
    clearTimers();
    setConfettiOrigin(null);
    const q = questions[current];
    const isLast = current >= questions.length - 1;
    if (isLast) {
      const finalScore = scoreRef.current; // ref — винаги актуален, без stale closure
      const now = new Date();
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
            duration_min: 1,
            type: "reinforcement",
            total: questions.length,
            errors,
          },
        }),
      }).catch(console.error);
      navigate(`/${user}/reinforcement/result?score=${finalScore}&total=${questions.length}&subject=${subject}&lesson=${lesson}`);
    } else {
      setCurrent((c) => c + 1);
      setPhase("answering");
      setSelectedId(null);
      setTimerPct(0);
    }
    void q;
  }

  function handleAnswer(optionId: string) {
    if (phase !== "answering") return;
    setSelectedId(optionId);

    const q = questions[current];
    const isCorrect = q.options.find((o) => o.correct)?.id === optionId;

    if (isCorrect) {
      scoreRef.current += 1;
      setScore((s) => s + 1);
      setPhase("correct");
      startTimer(1800, advanceQuestion);
    } else {
      setErrors((e) => [...e, q.id]);
      setPhase("wrong");
      timerRef.current = setTimeout(() => {
        startTimer(1200, () => setPhase("fact"));
      }, 700);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
        <p style={{ color: NAV.textMuted }}>Зарежда...</p>
      </div>
    );
  }

  const q         = questions[current];
  const correctId = q.options.find((o) => o.correct)?.id;
  const showTimer = phase === "correct" || phase === "wrong";

  // Shared topbar JSX
  const topbar = (bgColor = "white") => (
    <div className="flex-none" style={{ backgroundColor: bgColor, borderBottom: `0.5px solid ${NAV.border}` }}>
      <div className="flex items-center px-4 pt-3 pb-2">
        <button
          onClick={() => navigate(`/${user}`)}
          className="btn-press flex items-center gap-2 flex-1 min-w-0"
          aria-label="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55, flexShrink: 0 }}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-base font-bold" style={{ color: NAV.text }}>
            {subjectLabel} · Урок {lesson}
          </span>
        </button>
        <button onClick={() => navigate(`/${user}`)} className="btn-press w-8 h-8 flex items-center justify-center" style={{ opacity: 0.4 }} aria-label="Начало">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      <div className="flex gap-1 px-4 pb-3">
        {questions.map((_, i) => (
          <div key={i} className="flex-1 rounded-full" style={{
            height: 3,
            backgroundColor: i < current ? NAV.btnSolid : i === current ? NAV.btnSolid : NAV.border,
            opacity: i === current ? 0.4 : 1,
          }} />
        ))}
      </div>
    </div>
  );

  // ── Факт екран ───────────────────────────────────────────────────────────
  if (phase === "fact") {
    const correctText = q.options.find((o) => o.correct)?.text ?? "";
    return (
      <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#EBF4FF" }}>
        {topbar("white")}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
          <span style={{ fontSize: 52, lineHeight: 1 }}>💡</span>
          {q.explanation ? (
            <p className="text-base" style={{ color: NAV.text }}>{q.explanation}</p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-base" style={{ color: NAV.textMuted }}>{q.question}</p>
              <p className="text-base font-bold" style={{ color: NAV.text }}>✓ {correctText}</p>
            </div>
          )}
        </div>
        <div className="flex-none px-4 pb-6">
          <button
            onClick={advanceQuestion}
            className="btn-press w-full rounded-xl text-white font-medium text-base flex items-center justify-center gap-2"
            style={{ backgroundColor: NAV.btnSolid, height: 56 }}
          >
            → Напред
          </button>
        </div>
      </div>
    );
  }

  // ── Въпрос екран ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: screenBg }}>
      {topbar("white")}

      {/* Confetti fixed overlay — рисуван спрямо бутона, извън scroll контейнера */}
      {confettiOrigin && (
        <div style={{
          position: "fixed",
          left: confettiOrigin.x,
          top: confettiOrigin.y,
          pointerEvents: "none",
          zIndex: 200,
        }}>
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width:  i % 3 === 0 ? 11 : 8,
              height: i % 3 === 0 ? 11 : 8,
              borderRadius: i % 2 === 0 ? "50%" : 3,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `confetti-burst-${(i % 8) + 1} 0.8s ease forwards`,
              opacity: 0,
            }} />
          ))}
        </div>
      )}

      {/* Съдържание */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ backgroundColor: screenBg }}>
        {/* Номер на въпроса — цветен label */}
        {(() => {
          const lc = LABEL_PALETTE[current % LABEL_PALETTE.length];
          return (
            <span style={{
              display: "inline-block",
              backgroundColor: lc.bg,
              color: lc.color,
              fontSize: 12,
              fontWeight: 700,
              lineHeight: "1.5",
              padding: "5px 13px",
              borderRadius: 24,
              letterSpacing: "0.04em",
              marginBottom: 14,
            }}>
              Въпрос {current + 1}
            </span>
          );
        })()}
        <p className="text-xl font-bold mb-4 leading-snug" style={{ color: NAV.text }}>
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((option) => {
            const isCorrectOpt    = option.id === correctId;
            const isSelectedWrong = option.id === selectedId && !isCorrectOpt;
            const revealed        = phase !== "answering";

            let bg        = defaultCardBg;
            let iconChar  = "";
            let iconColor = "";
            let animStyle: React.CSSProperties = {};

            if (revealed) {
              if (isCorrectOpt) {
                bg        = "#E8F9F1";
                iconChar  = "✓";
                iconColor = "#3B9E6A";
                animStyle = { animation: "correct-pop 0.3s ease forwards" };
              } else if (isSelectedWrong) {
                bg        = "#FDF0F0";
                iconChar  = "✕";
                iconColor = "#C07070";
                animStyle = { animation: "shake 0.4s ease" };
              }
            }

            return (
              <div
                key={option.id}
                ref={isCorrectOpt ? correctDivRef : undefined}
                style={{ position: "relative" }}
              >
                <button
                  onClick={() => handleAnswer(option.id)}
                  disabled={phase !== "answering"}
                  className="btn-press w-full p-4 rounded-xl text-left text-base"
                  style={{ backgroundColor: bg, color: NAV.text, ...animStyle }}
                >
                  <span className="mr-3 uppercase" style={{ color: NAV.textMuted }}>{option.id}.</span>
                  {option.text}
                </button>

                {/* ✓ / ✕ иконка */}
                {revealed && iconChar && (
                  <span style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18, fontWeight: 700, color: iconColor,
                    animation: "icon-pop 0.35s ease forwards",
                  }}>
                    {iconChar}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer — постоянна прогрес линия */}
      <div
        className="flex-none px-4 pb-5 pt-3 flex flex-col gap-2"
        style={{ borderTop: `0.5px solid ${NAV.border}`, backgroundColor: "white" }}
      >
        <div style={{ width: "100%", height: 4, borderRadius: 2, backgroundColor: NAV.border }}>
          <div style={{
            height: "100%",
            borderRadius: 2,
            backgroundColor: phase === "correct" ? "#3B9E6A" : NAV.btnSolid,
            width: showTimer
              ? `${timerPct * 100}%`
              : `${(current / questions.length) * 100}%`,
            opacity: showTimer ? 1 : 0.4,
            transition: showTimer ? "width 0.05s linear" : "none",
          }} />
        </div>
        <span className="text-sm text-center" style={{
          color: NAV.textMuted,
          opacity: showTimer ? 0 : 1,
        }}>
          Докосни отговор
        </span>
      </div>
    </div>
  );
}
