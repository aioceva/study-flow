"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Quiz, QuizQuestion, NAV } from "@/types";

export default function ReinforcementQuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  // answers: question index → selected optionId (read-only once set)
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);

  const answered = current in answers;
  const selected = answers[current] ?? null;

  useEffect(() => {
    async function load() {
      let quiz: Quiz | null = null;
      const raw = sessionStorage.getItem("quiz");
      if (raw) {
        quiz = JSON.parse(raw);
      } else {
        const res = await fetch(`/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`);
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

  function handleAnswer(optionId: string) {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [current]: optionId }));
    const q = questions[current];
    if (q.options.find((o) => o.correct)?.id === optionId) {
      setScore((s) => s + 1);
    } else {
      setErrors((e) => [...e, q.id]);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  function handleNext() {
    if (!answered) return;
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      const finalScore = score;
      const now = new Date();
      const session = {
        date: now.toISOString().split("T")[0],
        subject,
        lesson: parseInt(lesson),
        started_at: now.toTimeString().slice(0, 5),
        duration_min: 1,
        type: "reinforcement",
        score: finalScore,
        total: questions.length,
        errors,
      };
      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, session }),
      }).catch(console.error);

      navigate(`/${user}/reinforcement/result?score=${finalScore}&total=${questions.length}&subject=${subject}&lesson=${lesson}`);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
        <p style={{ color: NAV.textMuted }}>Зарежда...</p>
      </div>
    );
  }

  const q = questions[current];
  const correctId = q.options.find((o) => o.correct)?.id;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Header: scan-стил — ← + заглавие вляво, 🏠 вдясно */}
      <div className="flex-none flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="btn-press w-8 h-8 flex items-center justify-center"
            style={{ opacity: 0.55 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>Преговор</h1>
        </div>
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

      {/* Прогрес точки — горе */}
      <div className="flex-none flex justify-center items-center gap-1.5 pb-3 px-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-colors duration-200"
            style={{
              width: 7,
              height: 7,
              backgroundColor: NAV.btnSolid,
              opacity: i < current ? 0.4 : i === current ? 1 : 0.2,
            }}
          />
        ))}
      </div>

      {/* Въпрос */}
      <h2 className="flex-none px-4 pb-4 text-xl font-bold leading-relaxed" style={{ color: NAV.text }}>
        {q.question}
      </h2>

      {/* Отговори */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {q.options.map((option) => {
          let bg = NAV.bg;
          let border = NAV.border;
          if (answered) {
            if (option.id === correctId) { bg = "#DCFCE7"; border = "#22C55E"; }
            else if (option.id === selected) { bg = "#FEE2E2"; border = "#EF4444"; }
          }
          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={answered}
              className="btn-press w-full p-4 rounded-2xl text-left font-bold text-base border-2"
              style={{ backgroundColor: bg, borderColor: border, color: NAV.text }}
            >
              <span className="mr-3 uppercase" style={{ color: NAV.textMuted }}>{option.id}.</span>
              {option.text}
            </button>
          );
        })}
      </div>

      {/* Обратна връзка (показва се след отговор) */}
      {answered && (
        <div className="flex-none px-4 pt-3">
          <div
            className="rounded-2xl p-4 font-bold text-center"
            style={{
              backgroundColor: selected === correctId ? "#DCFCE7" : "#FEE2E2",
              color: selected === correctId ? "#15803D" : "#B91C1C",
            }}
          >
            {selected === correctId ? "✓ Браво!" : `✗ Верен: ${q.options.find((o) => o.correct)?.text}`}
          </div>
        </div>
      )}

      {/* Навигация ← → */}
      <div className="flex-none flex gap-3 px-4 pb-6 pt-3">
        {current > 0 ? (
          <button
            onClick={handlePrev}
            className="btn-press flex-1 rounded-xl flex items-center justify-center font-bold text-xl"
            style={{ height: 56, backgroundColor: NAV.surface, color: NAV.text }}
          >
            ←
          </button>
        ) : (
          <div className="flex-1" />
        )}
        <button
          onClick={handleNext}
          disabled={!answered}
          className="btn-press flex-1 rounded-xl text-white font-bold text-xl flex items-center justify-center"
          style={{
            height: 56,
            backgroundColor: NAV.btnSolid,
            opacity: answered ? 1 : 0.3,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
