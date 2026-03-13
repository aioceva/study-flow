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

  // Разпознаваме дали сме на карта: /bobi/lesson/1/3
  const segments = pathname.split("/").filter(Boolean);
  const isCardPage =
    segments.length === 4 &&
    !isNaN(parseInt(segments[2])) &&
    !isNaN(parseInt(segments[3]));

  // Зареждаме адаптацията ВЕДНЪЖ — всички карти рендерират от нея
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

  // Separator и Quiz рендерират сами себе си
  if (!isCardPage) return <>{children}</>;

  const moduleId = parseInt(segments[2]);
  const cardId = parseInt(segments[3]);
  const params = searchParams.toString();
  const isReview = searchParams.get("mode") === "review";
  const bgColor = MODULE_COLORS[moduleId] ?? "#F8F9FA";
  const isFirst = moduleId === 1 && cardId === 1;

  // Картата се взима директно от вече заредените данни — без зареждане
  const moduleData = adaptation?.modules.find((m) => m.id === moduleId);
  const card = moduleData?.cards.find((c) => c.id === cardId);

  function navigate(url: string) {
    router.push(url);
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigate(nextStep(user, moduleId, cardId, params)),
    onSwipedRight: () => { if (!isFirst) navigate(prevStep(user, moduleId, cardId, params)); },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  return (
    <div
      className="flex flex-col"
      style={{ backgroundColor: bgColor, height: "100dvh", transition: "background-color 0.3s ease" }}
    >
      {/* Navbar — никога не се прерисува */}
      <nav className="flex-none flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm">
        <button
          onClick={() => router.push(`/${user}`)}
          className="w-8 h-8 flex items-center justify-center text-gray-500 text-lg"
        >
          🏠
        </button>

        <div className="flex gap-3 flex-1 justify-center">
          {[1, 2, 3, 4].map((m) => (
            <button
              key={m}
              onClick={() => navigate(`/${user}/lesson/${m}/1?${params}`)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2"
              style={{
                backgroundColor: MODULE_COLORS[m],
                borderColor: "#D1D5DB",
                color: "#374151",
              }}
            >
              {m}
              {/* Точка горе вдясно — винаги на място, само сменя цвят */}
              <span
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{
                  backgroundColor: m === moduleId ? "#4F8EF7" : "#D1D5DB",
                  transition: "background-color 0.2s",
                }}
              />
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-500 font-bold w-10 text-right">
          {cardId}/5
        </span>
      </nav>

      {/* Съдържание — рендерира се директно от layout, без смяна на страница */}
      <div {...swipeHandlers} className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
        {!card ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Зарежда...</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Модул {moduleId} · {moduleData?.title}
            </p>
            <h1 className="text-lg font-bold mb-3">{card.title}</h1>
            <div className="space-y-2">
              <Section icon="📌" label="Какво е" text={card.what} />
              <Section icon="💡" label="Защо е важно" text={card.why} />
              <Section icon="✏️" label="Пример" text={card.example} />
            </div>
          </div>
        )}
      </div>

      {/* Бутони — никога не се прерисуват */}
      <div className="flex-none flex gap-3 px-5 py-4 bg-white/50 backdrop-blur-sm">
        {!isFirst && (
          <button
            onClick={() => navigate(prevStep(user, moduleId, cardId, params))}
            className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-bold text-gray-500"
          >
            ←
          </button>
        )}
        <button
          onClick={() => navigate(nextStep(user, moduleId, cardId, params))}
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
    <div className="bg-white/70 rounded-xl p-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
        {icon} {label}
      </p>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
