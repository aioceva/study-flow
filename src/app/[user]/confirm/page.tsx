"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subjectBg = searchParams.get("subject_bg") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";

  function startLesson() {
    const params = new URLSearchParams({ subject, lesson, title });
    router.push(`/${user}/lesson/1/1?${params}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="text-6xl mb-6">✅</div>

      <p className="text-gray-500 text-base mb-2 uppercase tracking-wide font-bold">
        {subjectBg}
      </p>
      <h1 className="text-3xl font-bold mb-2">Урок {lesson}</h1>
      <p className="text-xl text-gray-600 mb-10">{title}</p>

      {/* Структура на урока */}
      <div className="w-full rounded-2xl p-5 mb-8 text-left space-y-2" style={{ backgroundColor: "#F8F9FA" }}>
        <p className="font-bold text-gray-600 mb-3">Структура на урока:</p>
        {[
          { color: "#E8F4FD", label: "Модул 1" },
          { color: "#E8F8E8", label: "Модул 2" },
          { color: "#FDFBE8", label: "Модул 3" },
          { color: "#F3E8FD", label: "Модул 4" },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: m.color }} />
            <span className="text-base">{m.label} — 5 карти</span>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-200 mt-2">
          <p className="text-sm text-gray-500">2 mini quiz-а + reinforcement режим</p>
        </div>
      </div>

      <button
        onClick={startLesson}
        className="w-full py-5 rounded-2xl text-white text-xl font-bold flex items-center justify-center gap-3"
        style={{ backgroundColor: "#4F8EF7" }}
      >
        Започни →
      </button>
    </main>
  );
}
