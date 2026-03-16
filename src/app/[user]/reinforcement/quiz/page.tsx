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
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);

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
      // 10 случайни от 20
      const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
    }
    load();
  }, [user, subject, lesson]);

  function handleAnswer(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const q = questions[current];
    if (q.options.find((o) => o.correct)?.id === optionId) {
      setScore((s) => s + 1);
    } else {
      setErrors((e) => [...e, q.id]);
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const finalScore = score + (answered && questions[current].options.find(o => o.correct)?.id === selected ? 0 : 0);
      // Записваме сесия
      const now = new Date();
      const session = {
        date: now.toISOString().split("T")[0],
        subject,
        lesson: parseInt(lesson),
        started_at: now.toTimeString().slice(0, 5),
        duration_min: 1,
        type: "reinforcement",
        score: finalScore,
        total: 10,
        errors,
      };
      fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, session }),
      }).catch(console.error);

      navigate(`/${user}/reinforcement/result?score=${finalScore}&total=10&subject=${subject}&lesson=${lesson}`);
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
    <div className="flex flex-col px-5 max-w-lg mx-auto" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
      <div className="flex-none mb-4 mt-2">
        <div className="flex justify-between items-center mb-3">
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
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: NAV.textMuted }}>Преговор</p>
          <p className="text-sm" style={{ color: NAV.textMuted }}>{current + 1} / {questions.length}</p>
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: NAV.border }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${(current / questions.length) * 100}%`, backgroundColor: NAV.btnSolid }}
          />
        </div>
      </div>

      <h2 className="flex-none text-xl font-bold mb-6 leading-relaxed" style={{ color: NAV.text }}>{q.question}</h2>

      <div className="space-y-3 flex-1 overflow-y-auto">
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

      {answered && (
        <div className="flex-none mt-4 pb-6">
          <div
            className="rounded-2xl p-4 mb-3 font-bold text-center"
            style={{
              backgroundColor: selected === correctId ? "#DCFCE7" : "#FEE2E2",
              color: selected === correctId ? "#15803D" : "#B91C1C",
            }}
          >
            {selected === correctId ? "✓ Браво!" : `✗ Верен: ${q.options.find(o => o.correct)?.text}`}
          </div>
          <button
            onClick={handleNext}
            className="btn-press w-full py-4 rounded-2xl text-white font-bold"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            {current < questions.length - 1 ? "Следващ →" : "Готово →"}
          </button>
        </div>
      )}
    </div>
  );
}
