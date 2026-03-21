"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, startTransition } from "react";
import { Quiz, QuizQuestion, NAV } from "@/types";

export default function QuizPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizNumber = parseInt(searchParams.get("number") ?? "1");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const params = searchParams.toString();

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  // answers: question index → selected optionId (read-only once set)
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState(0);
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

      const moduleIds = quizNumber === 1 ? [1, 2] : [3, 4];
      const filtered = quiz.questions.filter((q) => moduleIds.includes(q.module_id));
      const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
      setQuestions(shuffled);
    }
    load();
  }, [quizNumber, user, subject, lesson]);

  function handleAnswer(optionId: string) {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [current]: optionId }));
    const q = questions[current];
    const correct = q.options.find((o) => o.correct);
    if (correct?.id === optionId) {
      setScores((s) => s + 1);
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
      const key = `quiz_${quizNumber}_result`;
      sessionStorage.setItem(key, JSON.stringify({ score: scores, total: 5, errors }));

      if (quizNumber === 1) {
        navigate(`/${user}/lesson/3/1?${params}`);
      } else {
        const q1Raw = sessionStorage.getItem("quiz_1_result");
        const q1 = q1Raw ? JSON.parse(q1Raw) : { score: 0, total: 5 };
        const finalScore = q1.score + scores;
        navigate(`/${user}/done?score=${finalScore}&total=10&${params}`);
      }
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
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>
            Проверка {quizNumber}
          </h1>
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
      <div className="flex-none flex justify-center items-center gap-2 pb-3 px-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-colors duration-200"
            style={{
              width: 8,
              height: 8,
              backgroundColor: i < current
                ? NAV.btnSolid
                : i === current
                  ? NAV.btnSolid
                  : NAV.border,
              opacity: i < current ? 0.4 : 1,
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
            if (option.id === correctId) {
              bg = "#DCFCE7";
              border = "#22C55E";
            } else if (option.id === selected && option.id !== correctId) {
              bg = "#FEE2E2";
              border = "#EF4444";
            }
          } else if (option.id === selected) {
            border = NAV.btnSolid;
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
            {selected === correctId
              ? "✓ Браво! Правилно!"
              : `✗ Верният отговор е: ${q.options.find((o) => o.correct)?.text}`}
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
