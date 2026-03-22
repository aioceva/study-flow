"use client";

import { useState } from "react";
import { Session, SUBJECT_LABELS, Subject, NAV, QuizQuestion } from "@/types";

export type QuizMap = Record<string, QuizQuestion[]>; // "subject-lesson" → въпроси

function sessionScore(s: Session): { score: number; total: number } {
  if (s.type === "learn") {
    return {
      score: s.quiz_1.score + s.quiz_2.score,
      total: s.quiz_1.total + s.quiz_2.total,
    };
  }
  return { score: s.score, total: s.total };
}

function sessionErrors(s: Session): number[] {
  if (s.type === "learn") {
    return [...(s.quiz_1.errors ?? []), ...(s.quiz_2.errors ?? [])];
  }
  return s.errors ?? [];
}

function scoreColor(score: number, total: number): string {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.8) return "#22C55E";
  if (pct >= 0.6) return "#F59E0B";
  return "#EF4444";
}

function toPercent(score: number, total: number): string {
  return total > 0 ? `${Math.round((score / total) * 100)}%` : "—";
}

export function SessionList({
  grouped,
  sortedDates,
  quizMap,
  fmtDate,
}: {
  grouped: Record<string, Session[]>;
  sortedDates: string[];
  quizMap: QuizMap;
  fmtDate: (iso: string) => string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sortedDates.map((date) => (
        <div key={date}>
          <p className="text-sm" style={{ color: NAV.textMuted, marginBottom: 6 }}>
            {fmtDate(date)}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {grouped[date].map((s, i) => {
              const key = `${date}-${i}`;
              const { score, total } = sessionScore(s);
              const errors = sessionErrors(s);
              const subjectLabel = SUBJECT_LABELS[s.subject as Subject] ?? s.subject;
              const typeLabel  = s.type === "learn" ? "Учене" : "Преговор";
              const typeBg    = s.type === "learn" ? "#EBF4FF" : "#F3EEFF";
              const typeColor = s.type === "learn" ? "#3B7DD8" : "#7B5EA7";
              const quizKey   = `${s.subject}-${s.lesson}`;
              const questions = quizMap[quizKey] ?? [];
              const wrongQs   = questions.filter((q) => errors.includes(q.id));
              const isOpen    = expanded === key;

              return (
                <div
                  key={key}
                  className="rounded-xl"
                  style={{ backgroundColor: NAV.surface, overflow: "hidden" }}
                >
                  {/* Основен ред */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <p className="text-sm" style={{ color: NAV.textMuted }}>
                        {s.started_at ?? ""}
                      </p>
                      <p className="text-base" style={{ color: NAV.text }}>
                        {subjectLabel} · Урок {s.lesson}
                      </p>
                      <span
                        className="text-sm"
                        style={{
                          display: "inline-block",
                          backgroundColor: typeBg,
                          color: typeColor,
                          borderRadius: 6,
                          padding: "1px 8px",
                          width: "fit-content",
                        }}
                      >
                        {typeLabel}
                      </span>
                    </div>

                    {/* Процент — кликаем ако има грешки */}
                    {errors.length > 0 ? (
                      <button
                        onClick={() => setExpanded(isOpen ? null : key)}
                        className="btn-press flex flex-col items-end"
                        style={{ gap: 2 }}
                        aria-expanded={isOpen}
                        aria-label="Виж грешките"
                      >
                        <span
                          className="text-base"
                          style={{
                            color: scoreColor(score, total),
                            textDecoration: "underline",
                            textDecorationStyle: "dotted",
                            textUnderlineOffset: 3,
                          }}
                        >
                          {toPercent(score, total)}
                        </span>
                        <span className="text-sm" style={{ color: NAV.textMuted }}>
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </button>
                    ) : (
                      <span className="text-base" style={{ color: scoreColor(score, total) }}>
                        {toPercent(score, total)}
                      </span>
                    )}
                  </div>

                  {/* Разгъната секция — грешни въпроси */}
                  {isOpen && wrongQs.length > 0 && (
                    <div
                      style={{
                        borderTop: `1px solid ${NAV.border}`,
                        padding: "12px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <p className="text-sm" style={{ color: NAV.textMuted }}>
                        Грешни въпроси
                      </p>
                      {wrongQs.map((q) => {
                        const correctOpt = q.options.find((o) => o.correct);
                        return (
                          <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <p className="text-base" style={{ color: NAV.text }}>
                              {q.question}
                            </p>
                            {correctOpt && (
                              <p className="text-sm" style={{ color: "#22C55E" }}>
                                ✓ {correctOpt.text}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
