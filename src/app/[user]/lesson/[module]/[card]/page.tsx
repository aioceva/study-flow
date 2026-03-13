"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Adaptation, Card, MODULE_COLORS } from "@/types";
import { nextStep, prevStep } from "@/lib/navigation";

export default function CardPage() {
  const { user, module: moduleParam, card: cardParam } = useParams<{
    user: string; module: string; card: string;
  }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const moduleId = parseInt(moduleParam);
  const cardId = parseInt(cardParam);
  const params = searchParams.toString();

  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [animating, setAnimating] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("adaptation");
    if (!raw) { router.replace(`/${user}`); return; }
    const data: Adaptation = JSON.parse(raw);
    setAdaptation(data);
    const mod = data.modules.find((m) => m.id === moduleId);
    const c = mod?.cards.find((c) => c.id === cardId);
    if (c) setCard(c);
  }, [moduleId, cardId, router, user]);

  function goNext() {
    setAnimating("left");
    setTimeout(() => router.push(nextStep(user, moduleId, cardId, params)), 200);
  }

  function goPrev() {
    if (moduleId === 1 && cardId === 1) return;
    setAnimating("right");
    setTimeout(() => router.push(prevStep(user, moduleId, cardId, params)), 200);
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  if (!adaptation || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Зарежда...</p>
      </div>
    );
  }

  const moduleData = adaptation.modules.find((m) => m.id === moduleId);
  const bgColor = MODULE_COLORS[moduleId] ?? "#F8F9FA";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      {/* Навигационна лента */}
      <nav className="flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => router.push(`/${user}`)}
          className="text-xl text-gray-500 font-bold w-8 h-8 flex items-center justify-center"
        >
          🏠
        </button>
        <div className="flex gap-2 flex-1 justify-center">
          {[1, 2, 3, 4].map((m) => (
            <button
              key={m}
              onClick={() => router.push(`/${user}/lesson/${m}/1?${params}`)}
              className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all"
              style={{
                backgroundColor: m === moduleId ? bgColor : "transparent",
                border: `2px solid ${m < moduleId ? "#22C55E" : m === moduleId ? "#4F8EF7" : "#D1D5DB"}`,
                color: m < moduleId ? "#22C55E" : m === moduleId ? "#4F8EF7" : "#9CA3AF",
              }}
            >
              {m < moduleId ? "✓" : m}
            </button>
          ))}
        </div>
        {/* Прогрес */}
        <span className="text-sm text-gray-500 font-bold w-10 text-right">
          {cardId}/5
        </span>
      </nav>

      {/* Карта */}
      <div
        {...swipeHandlers}
        className="flex-1 flex flex-col p-5 max-w-lg mx-auto w-full"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating === "left" ? "translateX(-20px)" : animating === "right" ? "translateX(20px)" : "none",
          transition: "opacity 0.2s, transform 0.2s",
        }}
      >
        {/* Модул заглавие */}
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
          Модул {moduleId} · {moduleData?.title}
        </p>

        {/* Карта заглавие */}
        <h1 className="text-2xl font-bold mb-6">{card.title}</h1>

        {/* Съдържание */}
        <div className="space-y-4 flex-1">
          <Section icon="📌" label="Какво е" text={card.what} />
          <Section icon="💡" label="Защо е важно" text={card.why} />
          <Section icon="✏️" label="Пример" text={card.example} />
        </div>

        {/* Swipe hint + бутони */}
        <div className="mt-8 flex gap-3">
          {!(moduleId === 1 && cardId === 1) && (
            <button
              onClick={goPrev}
              className="flex-none w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-bold text-gray-500"
            >
              ←
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 h-12 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
            style={{ backgroundColor: "#4F8EF7" }}
          >
            {cardId === 5 && moduleId === 2 ? "Quiz →" :
             cardId === 5 && moduleId === 4 ? "Quiz →" :
             cardId === 5 ? "Следващ модул →" : "Следваща карта →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="bg-white/70 rounded-2xl p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
        {icon} {label}
      </p>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
