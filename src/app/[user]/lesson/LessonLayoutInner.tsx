"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { Adaptation, MODULE_COLORS } from "@/types";
import { nextStep, prevStep, nextButtonLabel } from "@/lib/navigation";

// По-наситени цветове за прогрес бара (пастелните MODULE_COLORS са твърде светли)
const MODULE_BAR_COLORS: Record<number, string> = {
  1: "#60A5FA",
  2: "#4ADE80",
  3: "#FACC15",
  4: "#C084FC",
};

export default function LessonLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useParams<{ user: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const loadedRef = useRef(false);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const segments = pathname.split("/").filter(Boolean);
  const isCardPage =
    segments.length === 4 &&
    !isNaN(parseInt(segments[2])) &&
    !isNaN(parseInt(segments[3]));
  const isSeparator = segments.length === 3 && segments[2] === "separator";

  const moduleId = isCardPage ? parseInt(segments[2]) : 1;
  const cardId = isCardPage ? parseInt(segments[3]) : 1;
  const params = searchParams.toString();
  const isReview = searchParams.get("mode") === "review";

  const sepFrom = isSeparator ? parseInt(searchParams.get("from") ?? "1") : 1;
  const sepTo = isSeparator ? parseInt(searchParams.get("to") ?? "2") : 2;

  const bgColor = isSeparator
    ? (MODULE_COLORS[sepTo] ?? "#F8F9FA")
    : (MODULE_COLORS[moduleId] ?? "#F8F9FA");

  const isFirst = moduleId === 1 && cardId === 1;

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

  function navigateWithReward(url: string) {
    const btn = nextBtnRef.current;
    if (btn) {
      btn.classList.add("btn-reward");
      setTimeout(() => router.push(url), 300);
    } else {
      router.push(url);
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => { if (isCardPage) router.push(nextStep(user, moduleId, cardId, params)); },
    onSwipedRight: () => { if (isCardPage && !isFirst) router.push(prevStep(user, moduleId, cardId, params)); },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  if (!isCardPage && !isSeparator) return <>{children}</>;

  // --- Separator UI ---
  if (isSeparator) {
    return (
      <div
        className="flex flex-col"
        style={{ backgroundColor: bgColor, height: "100dvh" }}
      >
        {/* Прогрес бар */}
        <div className="flex-none flex gap-1 px-4 pt-3 pb-0 bg-white">
          {[1, 2, 3, 4].map((m) => (
            <div key={m} className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: m <= sepFrom ? "100%" : "0%",
                  backgroundColor: MODULE_BAR_COLORS[m],
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          ))}
        </div>

        {/* Navbar */}
        <nav className="flex-none flex items-center px-4 py-3 bg-white">
          <button
            onClick={() => router.push(`/${user}`)}
            className="w-8 h-8 flex items-center justify-center text-gray-400"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </button>
        </nav>

        {/* Съдържание */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">Браво!</h2>
          <p className="text-lg text-gray-600 mb-2">Завърши тази част.</p>
          <p className="text-base text-gray-400">Продължаваме напред!</p>
        </div>

        {/* Бутони */}
        <div className="flex-none flex gap-3 px-5 py-4 bg-white">
          <button
            onClick={() => router.push(`/${user}/lesson/${sepFrom}/5?${params}`)}
            className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500"
          >
            ←
          </button>
          <button
            onClick={() => router.push(`/${user}/lesson/${sepTo}/1?${params}`)}
            className="flex-1 h-12 rounded-2xl text-white font-bold text-base"
            style={{ backgroundColor: "#22C55E" }}
          >
            Напред →
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
      {/* Прогрес бар */}
      <div className="flex-none flex gap-1 px-4 pt-3 pb-0 bg-white">
        {[1, 2, 3, 4].map((m) => (
          <div key={m} className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: m < moduleId ? "100%" : m === moduleId ? `${(cardId / 5) * 100}%` : "0%",
                backgroundColor: MODULE_BAR_COLORS[m],
                transition: "width 0.4s ease",
              }}
            />
          </div>
        ))}
      </div>

      {/* Navbar — само home бутон */}
      <nav className="flex-none flex items-center px-4 py-3 bg-white">
        <button
          onClick={() => router.push(`/${user}`)}
          className="w-8 h-8 flex items-center justify-center text-gray-400"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
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

      {/* Бутони — back placeholder за еднаква ширина на Next */}
      <div className="flex-none flex gap-3 px-5 py-4 bg-white">
        {isFirst ? (
          <div className="w-12 h-12 flex-none" />
        ) : (
          <button
            onClick={() => router.push(prevStep(user, moduleId, cardId, params))}
            className="w-12 h-12 flex-none rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500"
          >
            ←
          </button>
        )}
        <button
          ref={nextBtnRef}
          onClick={() => navigateWithReward(nextStep(user, moduleId, cardId, params))}
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
