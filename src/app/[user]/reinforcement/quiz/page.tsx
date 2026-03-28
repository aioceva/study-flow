"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Quiz, QuizQuestion, NAV } from "@/types";

type Phase = "answering" | "correct" | "wrong" | "fact";

const CONFETTI_COLORS = ["#6FA3E8", "#6DC297", "#C49020", "#A384CC", "#F5A623"];

export default function ReinforcementQuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson  = searchParams.get("lesson")  ?? "";

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
      if (p >= 0.93 && durationMs < 1200) setShowStars(true);
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
      // After 700ms show correct answer highlighted, then after 2800ms → fact
      timerRef.current = setTimeout(() => {
        startTimer(2800, () => setPhase("fact"));
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
  const timerMs  = phase === "correct" ? 950 : 2800;

  // ── Факт екран ────────────────────────────────────────────────────────────
  if (phase === "fact") {
    const factText = q.explanation ?? q.options.find((o) => o.correct)?.text ?? "";
    return (
      <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#EBF4FF" }}>
        {/* Прогрес бар */}
        <div className="flex-none px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {questions.map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{
                height: 5,
                backgroundColor: i < current ? NAV.btnSolid : i === current ? NAV.btnSolid : NAV.border,
                opacity: i === current ? 0.35 : 1,
              }} />
            ))}
          </div>
          <button onClick={() => navigate(`/${user}`)} className="btn-press w-10 h-10 flex items-center justify-center" style={{ opacity: 0.4 }} aria-label="Начало">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
          <span style={{ fontSize: 52, lineHeight: 1 }}>💡</span>
          <p className="text-base" style={{ color: NAV.text }}>{factText}</p>
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

      {/* Прогрес бар */}
      <div className="flex-none px-4 pt-3 pb-2 flex items-center gap-2" style={{ backgroundColor: NAV.bg }}>
        <div className="flex gap-1 flex-1">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 rounded-full" style={{
              height: 5,
              backgroundColor: NAV.btnSolid,
              opacity: i < current ? 1 : i === current ? 0.35 : 0.15,
            }} />
          ))}
        </div>
        <button onClick={() => navigate(`/${user}`)} className="btn-press w-10 h-10 flex items-center justify-center" style={{ opacity: 0.4 }} aria-label="Начало">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      </div>

      {/* Label */}
      <nav className="flex-none px-4 py-2 bg-white">
        <span className="text-sm font-medium" style={{ color: NAV.textMuted }}>Преговор</span>
      </nav>

      {/* Съдържание */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ backgroundColor: NAV.bg }}>
        <p className="text-xl mb-4 leading-snug" style={{ color: NAV.text }}>{q.question}</p>

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

      {/* Timer row + Ракета */}
      {showTimer && (
        <div className="flex-none px-4 pt-2 pb-1" style={{ backgroundColor: NAV.bg }}>
          <div ref={trackRef} style={{ position: "relative", height: 20 }}>
            {/* Синя линия */}
            <div style={{
              position: "absolute", left: 0, bottom: 0,
              height: 4, borderRadius: 2,
              backgroundColor: NAV.btnSolid,
              width: `${timerPct * 100}%`,
              transition: "width 0.05s linear",
            }} />
            {/* Фон линия */}
            <div style={{
              position: "absolute", left: 0, bottom: 0,
              height: 4, borderRadius: 2, width: "100%",
              backgroundColor: NAV.border,
              zIndex: -1,
            }} />

            {/* Ракета */}
            {!showStars && (
              <div style={{
                position: "absolute",
                left: `calc(${rktPct * 100}% - 36px)`,
                bottom: 6,
                animation: "rocket-hover 0.8s ease-in-out infinite",
              }}>
                <svg width="36" height="20" viewBox="0 0 36 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10 L32 5 L34 10 L32 15 L10 10Z" fill={NAV.btnSolid} />
                  <path d="M32 5 L36 10 L32 15Z" fill="#C0392B" />
                  <circle cx="26" cy="9" r="2.5" fill="#AED6F1" stroke="#fff" strokeWidth="0.5" />
                  <path d="M10 8 L6 4 L8 10 L6 16 L10 12Z" fill="#E74C3C" />
                  <path d="M10 10 L2 8 L0 10 L2 12Z" fill="#FF9500" style={{ animation: "flame-flicker 0.15s ease-in-out infinite", transformOrigin: "10px 10px" }} />
                  <path d="M10 10 L4 9 L3 10 L4 11Z" fill="#FFD700" style={{ animation: "flame-flicker 0.12s ease-in-out infinite 0.05s", transformOrigin: "10px 10px" }} />
                </svg>
              </div>
            )}

            {/* Звездички (само correct при финал) */}
            {showStars && phase === "correct" && (
              <div style={{ position: "absolute", right: 0, bottom: 4 }}>
                {["⭐", "✨", "⭐", "✨", "⭐"].map((s, i) => (
                  <span key={i} style={{
                    position: "absolute",
                    right: i * 14,
                    bottom: i % 2 === 0 ? 0 : 6,
                    fontSize: 12,
                    animation: `star-pop 0.5s ease ${i * 0.06}s forwards`,
                  }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer spacer */}
      <div className="flex-none" style={{ height: 24, backgroundColor: NAV.bg }} />
    </div>
  );
}
