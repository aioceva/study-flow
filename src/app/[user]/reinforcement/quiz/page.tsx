"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Quiz, QuizQuestion, NAV, SUBJECT_LABELS, Subject } from "@/types";

type Phase = "answering" | "correct" | "wrong" | "fact";

const CONFETTI_COLORS = ["#6FA3E8", "#6DC297", "#C49020", "#A384CC", "#F5A623"];

export default function ReinforcementQuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson  = searchParams.get("lesson")  ?? "";
  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const [questions, setQuestions]   = useState<QuizQuestion[]>([]);
  const [current,   setCurrent]     = useState(0);
  const [phase,     setPhase]       = useState<Phase>("answering");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score,     setScore]       = useState(0);
  const [errors,    setErrors]      = useState<number[]>([]);

  // Timer: progress 0→1
  const [timerPct, setTimerPct]     = useState(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number>(0);

  // Rocket
  const trackRef  = useRef<HTMLDivElement>(null);
  const [rktPct,  setRktPct]        = useState(0);
  const [showStars, setShowStars]   = useState(false);

  useEffect(() => {
    async function load() {
      let quiz: Quiz | null = null;
      const raw = sessionStorage.getItem("quiz");
      if (raw) {
        quiz = JSON.parse(raw);
      } else {
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

  function clearTimers() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current)   cancelAnimationFrame(rafRef.current);
  }

  function startTimer(durationMs: number, onEnd: () => void) {
    setTimerPct(0);
    setRktPct(0);
    setShowStars(false);
    startRef.current = performance.now();

    function tick(now: number) {
      const p = Math.min((now - startRef.current) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 2.5);
      setTimerPct(p);
      setRktPct(eased);
      if (p >= 0.93) setShowStars(true);
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
    const q = questions[current];
    const isLast = current >= questions.length - 1;
    if (isLast) {
      const finalScore = score;
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
            score: finalScore,
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
      setRktPct(0);
      setShowStars(false);
    }
    void q;
  }

  function handleAnswer(optionId: string) {
    if (phase !== "answering") return;
    setSelectedId(optionId);

    const q = questions[current];
    const isCorrect = q.options.find((o) => o.correct)?.id === optionId;

    if (isCorrect) {
      setScore((s) => s + 1);
      setPhase("correct");
      startTimer(950, advanceQuestion);
    } else {
      setErrors((e) => [...e, q.id]);
      setPhase("wrong");
      // After 700ms show correct answer highlighted, then after 1200ms → fact
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

  const q        = questions[current];
  const correctId = q.options.find((o) => o.correct)?.id;
  const showTimer = phase === "correct" || phase === "wrong";
  const timerMs  = phase === "correct" ? 950 : 1200;

  // ── Факт екран ────────────────────────────────────────────────────────────
  if (phase === "fact") {
    const correctText = q.options.find((o) => o.correct)?.text ?? "";
    return (
      <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#EBF4FF" }}>
        {/* Topbar */}
        <div className="flex-none bg-white" style={{ borderBottom: `0.5px solid ${NAV.border}` }}>
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
          <div className="flex gap-1 px-4 pb-3">
            {questions.map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{
                height: 3,
                backgroundColor: i <= current ? NAV.btnSolid : NAV.border,
                opacity: i === current ? 0.35 : 1,
              }} />
            ))}
          </div>
        </div>

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

  // ── Въпрос екран ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Topbar: заглавие + 🏠 + прогрес */}
      <div className="flex-none bg-white" style={{ borderBottom: `0.5px solid ${NAV.border}` }}>
        <div className="flex items-center px-4 pt-3 pb-2">
          <span className="flex-1 text-sm font-medium" style={{ color: NAV.text }}>
            {subjectLabel} · Урок {lesson}
          </span>
          <button onClick={() => navigate(`/${user}`)} className="btn-press w-8 h-8 flex items-center justify-center" style={{ opacity: 0.4 }} aria-label="Начало">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 rounded-full" style={{
              height: 3,
              backgroundColor: i <= current ? NAV.btnSolid : NAV.border,
              opacity: i === current ? 0.35 : 1,
            }} />
          ))}
        </div>
      </div>

      {/* Съдържание */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ backgroundColor: NAV.bg }}>
        <p className="text-xl font-bold mb-4 leading-snug" style={{ color: NAV.text }}>{q.question}</p>

        <div className="space-y-2">
          {q.options.map((option) => {
            const isCorrectOpt = option.id === correctId;
            const isSelectedWrong = option.id === selectedId && !isCorrectOpt;
            const revealed = phase !== "answering";

            let bg = NAV.surface;
            let iconChar = "";
            let iconColor = "";
            let animStyle: React.CSSProperties = {};

            if (revealed) {
              if (isCorrectOpt) {
                bg = "#E8F9F1";
                iconChar = "✓";
                iconColor = "#3B9E6A";
                animStyle = { animation: "correct-pop 0.3s ease forwards" };
              } else if (isSelectedWrong) {
                bg = "#FDF0F0";
                iconChar = "✕";
                iconColor = "#C07070";
                animStyle = { animation: "shake 0.4s ease" };
              }
            }

            return (
              <div key={option.id} style={{ position: "relative" }}>
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

                {/* Конфети — само при верен отговор */}
                {revealed && isCorrectOpt && phase === "correct" && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none" }}>
                    {CONFETTI_COLORS.map((color, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        width: 8, height: 8,
                        borderRadius: 2,
                        backgroundColor: color,
                        animation: `confetti-${i + 1} 0.6s ease forwards`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-none px-4 pb-5 pt-3 flex items-center justify-center"
        style={{ borderTop: `0.5px solid ${NAV.border}`, minHeight: 56, backgroundColor: NAV.bg }}
      >
        {!showTimer ? (
          <span className="text-sm" style={{ color: NAV.textMuted }}>Докосни отговор</span>
        ) : (
          <div style={{ width: "100%" }}>
            {/* Ракета + звезди */}
            <div style={{ position: "relative", height: 20, marginBottom: 4 }}>
              {!showStars && phase === "correct" && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: `calc(${Math.min(rktPct, 0.93) * 100}% - 11px)`,
                  animation: "rocket-hover 0.5s ease-in-out infinite",
                  pointerEvents: "none",
                }}>
                  <svg width="22" height="18" viewBox="0 0 28 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 9 Q14 1 24 9 Q14 17 4 9Z" fill={NAV.btnSolid} />
                    <circle cx="18" cy="9" r="3" fill="#fff" opacity="0.9" />
                    <path d="M4 7 L0 4 L2 9 L0 14 L4 11Z" fill="#E05555" />
                    <path d="M4 7 Q2 9 4 11" fill="none" stroke="#FF9500" strokeWidth="1.5" opacity="0.8" />
                    <ellipse cx="2" cy="9" rx="3" ry="2" fill="#FF9500" opacity="0.5" />
                  </svg>
                </div>
              )}
              {showStars && phase === "correct" && (
                <div style={{ position: "absolute", right: 0, top: 0, pointerEvents: "none" }}>
                  {[
                    { top: -10, right: 10 }, { top: -14, right: -2 }, { top: -4, right: -12 },
                    { top: -18, right: 4 },  { top: -8,  right: -8 },
                  ].map((pos, i) => (
                    <span key={i} style={{
                      position: "absolute", top: pos.top, right: pos.right,
                      fontSize: 11, opacity: 0,
                      animation: `star-pop 0.55s ease ${i * 0.05}s forwards`,
                    }}>{i % 2 === 0 ? "⭐" : "✨"}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Timer линия */}
            <div style={{ width: "100%", height: 4, borderRadius: 2, backgroundColor: NAV.border }}>
              <div style={{
                height: "100%", borderRadius: 2,
                backgroundColor: NAV.btnSolid,
                width: `${timerPct * 100}%`,
                transition: "width 0.05s linear",
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
