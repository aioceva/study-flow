"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { NAV, SUBJECT_LABELS, Subject, Sessions, Adaptation, MODULE_PROGRESS, ReinforcementSession } from "@/types";

export default function ConfirmPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";
  const mode = searchParams.get("mode");
  const params = searchParams.toString();

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;

  const [hasSessions, setHasSessions] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<{ label: string; pct: number } | null>(null);
  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const [adaptationMissing, setAdaptationMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/session?user=${user}`)
      .then((r) => r.json())
      .then((data: Sessions) => {
        const relevant = (data.sessions ?? []).filter(
          (s) => s.subject === subject && String(s.lesson) === lesson
        );
        setHasSessions(relevant.length > 0);

        const months = ["яну", "фев", "март", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"];
        const quizSessions = relevant
          .filter((s): s is ReinforcementSession => s.type === "reinforcement")
          .sort((a, b) => (a.date + a.started_at) > (b.date + b.started_at) ? -1 : 1);
        if (quizSessions.length > 0) {
          const s = quizSessions[0];
          const [, m, d] = s.date.split("-");
          const dateStr = `${parseInt(d)} ${months[parseInt(m) - 1]}`;
          const correct = s.errors.length > 0 ? s.total - s.errors.length : (s.score ?? s.total);
          const pct = Math.round((correct / s.total) * 100);
          setLastResult({ label: `${dateStr} · ${pct}%`, pct });
        }
      })
      .catch(() => setHasSessions(false));
  }, [user, subject, lesson]);

  useEffect(() => {
    fetch(`/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) setAdaptation(data.adaptation);
        else setAdaptationMissing(true);
      })
      .catch(() => setAdaptationMissing(true));
  }, [user, subject, lesson]);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const modules = adaptation?.modules ?? [];
  const totalCards = modules.reduce((sum, m) => sum + m.cards.length, 0);
  const estMin = totalCards > 0 ? Math.round(totalCards * 0.6) : null;

  const cardStyle = {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 10px rgba(74, 111, 165, 0.09)",
    borderRadius: 16,
  };

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.surface }}>

      {/* Хедър */}
      <div className="flex-none flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(`/${user}${mode === "test" ? "?mode=test" : ""}`)}
          className="btn-press flex items-center gap-2"
          aria-label="Назад"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>
            {subjectLabel} · Урок {lesson}
          </h1>
        </button>
        <button
          onClick={() => navigate(`/${user}${mode === "test" ? "?mode=test" : ""}`)}
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

      {/* Test Mode Banner */}
      {mode === "test" && (
        <div className="flex-none mx-4 mb-1 rounded-xl px-3 py-2" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#92400E" }}>🔧 Test Mode · Lesson файлове</p>
          <div className="flex flex-wrap gap-2">
            {["adaptation.json", "quiz.json", "adaptation-context.json", "original.jpg"].map((file) => (
              <a
                key={file}
                href={`/api/lesson-file?user=${user}&subject=${subject}&lesson=${lesson}&file=${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "#FCD34D", color: "#78350F" }}
              >
                {file}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Карти */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-6 space-y-3">

        {/* Карта 1: Урок — недостъпна ако адаптацията липсва */}
        {adaptationMissing ? (
          <div style={{ ...cardStyle, opacity: 0.75 }}>
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold mb-0.5" style={{ color: NAV.text }}>{title}</p>
                <p className="text-sm" style={{ color: NAV.textMuted }}>
                  Адаптираното съдържание не е налично. Сканирай урока отново.
                </p>
              </div>
              <div
                className="flex-none w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: NAV.border }}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={NAV.textMuted}>
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/${user}/lesson/1/1?${params}`)}
            className="btn-press w-full text-left"
            style={cardStyle}
            type="button"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold mb-0.5" style={{ color: NAV.text }}>{title}</p>
                {estMin !== null && (
                  <p className="text-sm" style={{ color: NAV.textMuted }}>
                    {modules.length} модула · {totalCards} карти · ~{estMin} мин
                  </p>
                )}
              </div>
              <div
                className="flex-none w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: NAV.btnSolid }}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            </div>
          </button>
        )}

        {/* Карта 2: Модули — само ако са заредени */}
        {modules.length > 0 && (
          <div style={cardStyle}>
            <div className="px-4 pt-3 pb-2">
              <p className="text-xs font-medium tracking-wider uppercase" style={{ color: NAV.textMuted }}>
                Модули
              </p>
            </div>
            <div style={{ borderTop: `0.5px solid ${NAV.border}` }}>
              {modules.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div
                    className="flex-none rounded-full"
                    style={{ width: 10, height: 10, backgroundColor: MODULE_PROGRESS[m.id] ?? NAV.btnSolid }}
                  />
                  <p className="text-sm" style={{ color: NAV.text }}>{m.title}</p>
                </div>
              ))}
              <div style={{ height: 8 }} />
            </div>
          </div>
        )}

        {/* Карта 3: Проверка на знанията */}
        {hasSessions ? (
          <button
            onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}${mode === "test" ? "&mode=test" : ""}`)}
            className="btn-press w-full text-left"
            style={cardStyle}
            type="button"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium tracking-wider uppercase mb-0.5" style={{ color: NAV.textMuted }}>
                  Проверка на знанията
                </p>
                <p className="text-sm" style={{ color: NAV.textMuted }}>
                  10 въпроса · ~5 мин{lastResult && (
                    <span style={{ color: lastResult.pct >= 70 ? "#3B9E6A" : "#9A6E08" }}>
                      {" · "}{lastResult.label}
                    </span>
                  )}
                </p>
              </div>
              <div
                className="flex-none w-11 h-11 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: "#50B8DC" }}
                aria-hidden="true"
              >
                🏆
              </div>
            </div>
          </button>
        ) : (
          <div style={{ ...cardStyle, opacity: 0.7 }}>
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium tracking-wider uppercase mb-0.5" style={{ color: NAV.textMuted }}>
                  Проверка на знанията
                </p>
                <p className="text-sm" style={{ color: NAV.textMuted }}>10 въпроса · ~3 мин · отключва се след урока</p>
              </div>
              <div
                className="flex-none w-11 h-11 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: NAV.border }}
                aria-hidden="true"
              >
                🏆
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
