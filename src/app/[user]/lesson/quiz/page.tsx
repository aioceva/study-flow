"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, startTransition } from "react";
import { Quiz, QuizQuestion, NAV, MODULE_COLORS, MODULE_SURFACE, MODULE_BTN, MODULE_PROGRESS } from "@/types";

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

  // Цветова схема: quiz 1 → модул 2, quiz 2 → модул 4
  const moduleId = quizNumber === 1 ? 2 : 4;
  const bgColor      = MODULE_COLORS[moduleId];
  const surfaceColor = MODULE_SURFACE[moduleId];
  const btnColor     = MODULE_BTN[moduleId];
  const progressColor = MODULE_PROGRESS[moduleId];

  const q = questions[current];
  const correctId = q.options.find((o) => o.correct)?.id;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#ffffff" }}>

      {/* Прогрес ред: N сегмента + 🏠 — като при урока */}
      <div className="flex-none bg-white px-4 pt-3 pb-2 flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-300"
              style={{
                height: 5,
                backgroundColor: i <= current ? progressColor : NAV.border,
              }}
            />
          ))}
        </div>
        <button
          onClick={() => navigate(`/${user}`)}
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

      {/* Лейбъл — като module title в урока */}
      <nav className="flex-none px-4 py-2 bg-white">
        <span className="text-sm font-semibold" style={{ color: NAV.textMuted }}>
          Проверка {quizNumber}
        </span>
      </nav>

      {/* Съдържание с цветна подложка — като карта в урока */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ backgroundColor: bgColor }}>

        {/* Въпрос — като заглавие на карта */}
        <p className="text-xl font-bold mb-4 leading-snug" style={{ color: NAV.text }}>
          {q.question}
        </p>

        {/* Отговори — като секции в карта */}
        <div className="space-y-2">
          {q.options.map((option) => {
            let bg = surfaceColor;
            if (answered) {
              if (option.id === correctId) bg = "#DCFCE7";
              else if (option.id === selected) bg = "#FEE2E2";
            }
            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={answered}
                className="btn-press w-full p-4 rounded-xl text-left text-base font-semibold"
                style={{ backgroundColor: bg, color: NAV.text }}
              >
                <span className="mr-3 uppercase" style={{ color: MODULE_BTN[moduleId], opacity: 0.8 }}>{option.id}.</span>
                {option.text}
              </button>
            );
          })}
        </div>

        {/* Обратна връзка */}
        {answered && (
          <div
            className="mt-3 rounded-xl p-4 text-base font-bold text-center"
            style={{
              backgroundColor: selected === correctId ? "#DCFCE7" : "#FEE2E2",
              color: selected === correctId ? "#15803D" : "#B91C1C",
            }}
          >
            {selected === correctId
              ? "✓ Браво! Правилно!"
              : `✗ Верният отговор е: ${q.options.find((o) => o.correct)?.text}`}
          </div>
        )}
      </div>

      {/* Навигация ← → */}
      <div className="flex-none flex gap-3 px-4 pb-6 pt-3 bg-white">
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
          style={{ height: 56, backgroundColor: btnColor, opacity: answered ? 1 : 0.3 }}
        >
          →
        </button>
      </div>
    </div>
  );
}
