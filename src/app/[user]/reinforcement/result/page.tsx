"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { NAV } from "@/types";

const LEVELS = [
  {
    stars: [1, 0.5, 0.5],
    title: "Добро начало!",
    sub: "Има още много интересни неща в урока.",
    hint: "Прегледай отново урока и пробвай пак.",
  },
  {
    stars: [1, 1, 0.5],
    title: "Чудесен резултат!",
    sub: "Половината урок е вече твой!",
    hint: "Повтори теста и ще подобриш резултата си.",
  },
  {
    stars: [1, 1, 1],
    title: "Браво!",
    sub: "Много добре се справи!",
    hint: "Пробвай пак - въпросите са различни всеки път!",
  },
];

function StarIcon({ opacity }: { opacity: number }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
      <polygon
        points="18,3 22.5,13.5 34,14.5 25.5,22.5 28,34 18,28 8,34 10.5,22.5 2,14.5 13.5,13.5"
        fill="#F0B429"
        stroke="#F0B429"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ReinforcementResultPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "10");
  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const mode = searchParams.get("mode");

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const percent = Math.round((score / total) * 100);
  const levelIdx = percent <= 33 ? 0 : percent <= 66 ? 1 : 2;
  const { stars, title, sub, hint } = LEVELS[levelIdx];

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="flex-none flex items-center justify-end px-4 py-3">
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

      {/* Съдържание */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ gap: 14 }}>

        {/* Звезди */}
        <div style={{ display: "flex", gap: 8 }}>
          {stars.map((opacity, i) => <StarIcon key={i} opacity={opacity} />)}
        </div>

        <h1 className="text-xl font-bold" style={{ color: NAV.text }}>{title}</h1>

        <p style={{ fontSize: 14, color: NAV.textMuted, lineHeight: 1.6, maxWidth: 240, whiteSpace: "pre-line" }}>
          {sub}
        </p>

        {/* Progress bar */}
        <div className="w-full" style={{ marginBottom: 4 }}>
          <div className="rounded-full overflow-hidden" style={{ height: 8, backgroundColor: NAV.surface }}>
            <div
              className="rounded-full"
              style={{ width: `${percent}%`, height: "100%", backgroundColor: NAV.btnSolid }}
            />
          </div>
          <p style={{ fontSize: 13, color: "#888780", textAlign: "right", marginTop: 4 }}>{percent}%</p>
        </div>

      </div>

      {/* Бутони */}
      <div className="flex-none px-4 pb-6 pt-3 space-y-2">
        <p className="text-center text-sm pb-1" style={{ color: "#888780" }}>{hint}</p>
        <button
          onClick={() => navigate(`/${user}/reinforcement/quiz?subject=${subject}&lesson=${lesson}${mode === "test" ? "&mode=test" : ""}`)}
          className="btn-press w-full rounded-xl py-4 text-white font-medium text-base"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Опитай пак →
        </button>
        <button
          onClick={() => navigate(`/${user}${mode === "test" ? "?mode=test" : ""}`)}
          className="btn-press w-full rounded-xl py-4 font-medium text-base"
          style={{ backgroundColor: NAV.surface, color: NAV.text }}
        >
          Към началото
        </button>
      </div>

    </div>
  );
}
