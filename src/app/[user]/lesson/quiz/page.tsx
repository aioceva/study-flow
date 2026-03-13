"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Quiz, QuizQuestion } from "@/types";

export default function QuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizNumber = parseInt(searchParams.get("number") ?? "1");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";
  const params = searchParams.toString();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [errors, setErrors] = useState<number[]>([]);
  const [scores, setScores] = useState(0);

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

      const moduleIds = quizNumber === 1 ? [1, 2] : [3, 4];
      const filtered = quiz.questions.filter((q) => moduleIds.includes(q.module_id));
      const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
      setQuestions(shuffled);
    }
    load();
  }, [quizNumber, user, subject, lesson]);

  function handleAnswer(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const q = questions[current];
    const correct = q.options.find((o) => o.correct);
    if (correct?.id === optionId) {
      setScores((s) => s + 1);
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
      // Запазваме резултата в sessionStorage
      const key = `quiz_${quizNumber}_result`;
      sessionStorage.setItem(key, JSON.stringify({ score: scores + (selected && questions[current].options.find(o=>o.correct)?.id === selected ? 0 : 0), total: 5, errors }));

      if (quizNumber === 1) {
        router.push(`/${user}/lesson/3/1?${params}`);
      } else {
        // Изчисляваме финалния резултат
        const q1Raw = sessionStorage.getItem("quiz_1_result");
        const q1 = q1Raw ? JSON.parse(q1Raw) : { score: 0, total: 5 };
        const finalScore = q1.score + scores + (answered ? 1 : 0);
        router.push(`/${user}/done?score=${finalScore}&total=10&${params}`);
      }
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Зарежда quiz...</p>
      </div>
    );
  }

  const q = questions[current];
  const correctId = q.options.find((o) => o.correct)?.id;

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6 mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Quiz {quizNumber}
          </p>
          <p className="text-sm text-gray-500">
            {current + 1} / {questions.length}
          </p>
        </div>
        {/* Прогрес лента */}
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((current) / questions.length) * 100}%`,
              backgroundColor: "#4F8EF7",
            }}
          />
        </div>
      </div>

      {/* Въпрос */}
      <h2 className="text-xl font-bold mb-8 leading-relaxed">{q.question}</h2>

      {/* Отговори */}
      <div className="space-y-3 flex-1">
        {q.options.map((option) => {
          let bg = "white";
          let border = "#E5E7EB";
          let textColor = "#1a1a2e";

          if (answered) {
            if (option.id === correctId) {
              bg = "#DCFCE7";
              border = "#22C55E";
            } else if (option.id === selected && option.id !== correctId) {
              bg = "#FEE2E2";
              border = "#EF4444";
            }
          } else if (option.id === selected) {
            border = "#4F8EF7";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={answered}
              className="w-full p-4 rounded-2xl text-left font-bold text-base transition-all border-2"
              style={{ backgroundColor: bg, borderColor: border, color: textColor }}
            >
              <span className="text-gray-400 mr-3 uppercase">{option.id}.</span>
              {option.text}
            </button>
          );
        })}
      </div>

      {/* Обратна връзка + следващ */}
      {answered && (
        <div className="mt-6">
          <div
            className="rounded-2xl p-4 mb-4 font-bold text-center"
            style={{
              backgroundColor: selected === correctId ? "#DCFCE7" : "#FEE2E2",
              color: selected === correctId ? "#15803D" : "#B91C1C",
            }}
          >
            {selected === correctId ? "✓ Браво! Правилно!" : `✗ Верният отговор е: ${q.options.find(o => o.correct)?.text}`}
          </div>
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ backgroundColor: "#4F8EF7" }}
          >
            {current < questions.length - 1 ? "Следващ въпрос →" : "Готово →"}
          </button>
        </div>
      )}
    </div>
  );
}
