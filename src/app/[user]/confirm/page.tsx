"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { NAV, SUBJECT_LABELS, Subject, Sessions } from "@/types";
import { LessonCard } from "@/components/LessonCard";
import { FeedbackButton } from "@/components/FeedbackButton";

export default function ConfirmPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const subjectBg = searchParams.get("subject_bg") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";
  const params = searchParams.toString();

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subjectBg ?? subject;

  // null = loading, false = first time, true = returning
  const [hasSessions, setHasSessions] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/session?user=${user}`)
      .then((r) => r.json())
      .then((data: Sessions) => {
        const relevant = (data.sessions ?? []).filter(
          (s) => s.subject === subject && String(s.lesson) === lesson
        );
        setHasSessions(relevant.length > 0);
      })
      .catch(() => setHasSessions(false));
  }, [user, subject, lesson]);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър: scan-стил — лека ← + заглавие вляво, 🏠 вдясно */}
      <div className="flex-none flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/${user}`)}
            className="btn-press w-8 h-8 flex items-center justify-center"
            style={{ opacity: 0.55 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>
            {subjectLabel} · Урок {lesson}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <FeedbackButton user={user} />
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
      </div>

      {/* Съдържание — горе, не центрирано */}
      <div className="flex-1 px-5 pt-2">

        {/* Карта на урока — идентична с home screen */}
        <LessonCard
          subject={subject}
          lesson={lesson}
          title={title}
          subjectLabel={subjectLabel}
          onPlay={() => navigate(`/${user}/lesson/1/1?${params}`)}
        />

        {/* Quiz карта — само за завърнали се потребители */}
        {hasSessions && (
          <button
            onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}&title=${encodeURIComponent(title)}`)}
            className="btn-press w-full rounded-xl text-left mt-3"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 10px rgba(74, 111, 165, 0.09)" }}
            type="button"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium tracking-wider uppercase mb-0.5" style={{ color: NAV.textMuted }}>
                  Проверка на знанията
                </p>
                <p className="text-base" style={{ color: NAV.text }}>
                  Спомни си урока
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
        )}

      </div>
    </div>
  );
}
