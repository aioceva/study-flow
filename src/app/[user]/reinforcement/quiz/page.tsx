"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Quiz, QuizQuestion } from "@/types";

export default function ReinforcementQuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";

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

      router.push(`/${user}/reinforcement/result?score=${finalScore}&total=10&subject=${subject}&lesson=${lesson}`);
    }
  }

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Зарежда...</p>
    </div>;
  }

  const q = questions[current];
  const correctId = q.options.find((o) => o.correct)?.id;

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-lg mx-auto">
      <div className="mb-6 mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Преговор</p>
          <p className="text-sm text-gray-500">{current + 1} / {questions.length}</p>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${(current / questions.length) * 100}%`, backgroundColor: "#7C3AED" }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-8 leading-relaxed">{q.question}</h2>

      <div className="space-y-3 flex-1">
        {q.options.map((option) => {
          let bg = "white";
          let border = "#E5E7EB";
          if (answered) {
            if (option.id === correctId) { bg = "#DCFCE7"; border = "#22C55E"; }
            else if (option.id === selected) { bg = "#FEE2E2"; border = "#EF4444"; }
          }
          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={answered}
              className="w-full p-4 rounded-2xl text-left font-bold text-base border-2"
              style={{ backgroundColor: bg, borderColor: border }}
            >
              <span className="text-gray-400 mr-3 uppercase">{option.id}.</span>
              {option.text}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6">
          <div
            className="rounded-2xl p-4 mb-4 font-bold text-center"
            style={{
              backgroundColor: selected === correctId ? "#DCFCE7" : "#FEE2E2",
              color: selected === correctId ? "#15803D" : "#B91C1C",
            }}
          >
            {selected === correctId ? "✓ Браво!" : `✗ Верен: ${q.options.find(o => o.correct)?.text}`}
          </div>
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl text-white font-bold"
            style={{ backgroundColor: "#7C3AED" }}
          >
            {current < questions.length - 1 ? "Следващ →" : "Готово →"}
          </button>
        </div>
      )}
    </div>
  );
}
