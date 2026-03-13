"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Adaptation, MODULE_COLORS } from "@/types";
import { nextStep, prevStep, nextButtonLabel } from "@/lib/navigation";

export default function LessonLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useParams<{ user: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const loadedRef = useRef(false);

  const segments = pathname.split("/").filter(Boolean);
  // /[user]/lesson/[module]/[card] → 4 segments, both numeric
  const isCardPage =
    segments.length === 4 &&
    !isNaN(parseInt(segments[2])) &&
    !isNaN(parseInt(segments[3]));
  // /[user]/lesson/separator
  const isSeparator = segments.length === 3 && segments[2] === "separator";

  // Всички стойности преди hooks
  const moduleId = isCardPage ? parseInt(segments[2]) : 1;
  const cardId = isCardPage ? parseInt(segments[3]) : 1;
  const params = searchParams.toString();
  const isReview = searchParams.get("mode") === "review";

  // За separator: from/to
  const sepFrom = isSeparator ? parseInt(searchParams.get("from") ?? "1") : 1;
  const sepTo = isSeparator ? parseInt(searchParams.get("to") ?? "2") : 2;

  // Фоновият цвят: за карти — модулен цвят; за separator — цветът на следващия модул
  const bgColor = isSeparator
    ? (MODULE_COLORS[sepTo] ?? "#F8F9FA")
    : (MODULE_COLORS[moduleId] ?? "#F8F9FA");

  const isFirst = moduleId === 1 && cardId === 1;

  // Зареждаме адаптацията веднъж
  useEffect(() => {
    if (loadedRef.current || !isCardPage) return;
    loadedRef.current = true;

    const raw = sessionStorage.getItem("adaptation");
    if (raw) { setAdaptation(JSON.parse(raw)); return; }

    const subject = searchParams.get("subject");
    const lesson = searchParams.get("lesson");
    if (!subject || !lesson) return;

    fetch(`/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.exists) return;
        sessionStorage.setItem("adaptation", JSON.stringify(json.adaptation));
        if (json.quiz) sessionStorage.setItem("quiz", JSON.stringify(json.quiz));
        setAdaptation(json.adaptation);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCardPage]);

  // useSwipeable — преди всякакъв условен return
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => { if (isCardPage) router.push(nextStep(user, moduleId, cardId, params)); },
    onSwipedRight: () => { if (isCardPage && !isFirst) router.push(prevStep(user, moduleId, cardId, params)); },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  // Quiz и други strani рендерират сами себе си
  if (!isCardPage && !isSeparator) return <>{children}</>;

  // --- Separator UI (inline, без смяна на layout) ---
  if (isSeparator) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ backgroundColor: bgColor, height: "100dvh", transition: "background-color 0.3s ease" }}
      >
        <div className="text-5xl mb-6">✓</div>
        <h2 className="text-2xl font-bold mb-2">Модул {sepFrom} готов!</h2>
        <p className="text-lg text-gray-600 mb-12">Започваме Модул {sepTo}</p>

        <div className="flex gap-3 mb-12">
          {[1, 2, 3, 4].map((m) => (
            <div
              key={m}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: m <= sepFrom ? "#22C55E" : m === sepTo ? "#4F8EF7" : "#E5E7EB",
                color: m <= sepFrom || m === sepTo ? "white" : "#9CA3AF",
              }}
            >
              {m <= sepFrom ? "✓" : m}
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full max-w-sm px-5">
          <button
            onClick={() => router.push(`/${user}/lesson/${sepFrom}/5?${params}`)}
            className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-bold text-gray-500"
          >
            ←
          </button>
          <button
            onClick={() => router.push(`/${user}/lesson/${sepTo}/1?${params}`)}
            className="flex-1 h-12 rounded-2xl text-white font-bold text-base"
            style={{ backgroundColor: "#4F8EF7" }}
          >
            Започни Модул {sepTo} →
          </button>
        </div>
      </div>
    );
  }

  // --- Card UI ---
  const moduleData = adaptation?.modules.find((m) => m.id === moduleId);
  const card = moduleData?.cards.find((c) => c.id === cardId);

  return (
    <div
      className="flex flex-col"
      style={{ backgroundColor: "#ffffff", height: "100dvh" }}
    >
      {/* Navbar */}
      <nav className="flex-none flex items-center gap-3 px-4 py-3 bg-white backdrop-blur-sm">
        <button
          onClick={() => router.push(`/${user}`)}
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>

        <div className="flex gap-3 flex-1 justify-center">
          {[1, 2, 3, 4].map((m) => (
            <button
              key={m}
              onClick={() => router.push(`/${user}/lesson/${m}/1?${params}`)}
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: MODULE_COLORS[m],
                border: m === moduleId ? "2.5px solid #6B7280" : "2px solid #D1D5DB",
                color: "#374151",
                transition: "border 0.2s",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-500 font-bold w-10 text-right">{cardId}/5</span>
      </nav>

      {/* Съдържание */}
      <div {...swipeHandlers} className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ backgroundColor: bgColor }}>
        {!card ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Зарежда...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold mb-4">
              <span className="text-gray-400">{moduleData?.title}</span>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-gray-800">{card.title}</span>
            </p>
            <div className="space-y-2">
              <Section icon="📌" label="Какво е" text={card.what} />
              <Section icon="💡" label="Защо е важно" text={card.why} />
              <Section icon="✏️" label="Пример" text={card.example} />
            </div>
          </div>
        )}
      </div>

      {/* Бутони */}
      <div className="flex-none flex gap-3 px-5 py-4 bg-white">
        {!isFirst && (
          <button
            onClick={() => router.push(prevStep(user, moduleId, cardId, params))}
            className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-bold text-gray-500"
          >
            ←
          </button>
        )}
        <button
          onClick={() => router.push(nextStep(user, moduleId, cardId, params))}
          className="flex-1 h-12 rounded-2xl text-white font-bold text-base"
          style={{ backgroundColor: "#4F8EF7" }}
        >
          {nextButtonLabel(moduleId, cardId, isReview)}
        </button>
      </div>
    </div>
  );
}

function Section({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="bg-white/70 rounded-xl p-4">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">{icon} {label}</p>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
