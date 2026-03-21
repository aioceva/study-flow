"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, startTransition } from "react";
import { useSwipeable } from "react-swipeable";
import { Adaptation, MODULE_COLORS, MODULE_SURFACE, MODULE_PROGRESS, MODULE_BTN, NAV, SUBJECT_LABELS, Subject } from "@/types";
import { nextStep, prevStep, nextButtonLabel } from "@/lib/navigation";

export default function LessonLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useParams<{ user: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [adaptation, setAdaptation] = useState<Adaptation | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("adaptation");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Adaptation;
    const sp = new URLSearchParams(window.location.search);
    const subj = sp.get("subject");
    const les = sp.get("lesson");
    if (parsed.meta?.subject !== subj || String(parsed.meta?.lesson) !== les) return null;
    return parsed;
  });
  const loadedRef = useRef(false);

  const segments = pathname.split("/").filter(Boolean);
  const isCardPage =
    segments.length === 4 &&
    !isNaN(parseInt(segments[2])) &&
    !isNaN(parseInt(segments[3]));
  const isSeparator = segments.length === 3 && segments[2] === "separator";

  const moduleId = isCardPage ? parseInt(segments[2]) : 1;
  const cardId   = isCardPage ? parseInt(segments[3]) : 1;
  const params   = searchParams.toString();
  const isReview = searchParams.get("mode") === "review";

  const sepFrom     = isSeparator ? parseInt(searchParams.get("from") ?? "1") : 1;
  const sepTo       = isSeparator ? parseInt(searchParams.get("to")   ?? "2") : 2;
  const subject     = searchParams.get("subject") ?? "";
  const lesson      = searchParams.get("lesson") ?? "";

  const bgColor = MODULE_COLORS[moduleId] ?? "#F8F9FA";
  const isFirst = moduleId === 1 && cardId === 1;

  useEffect(() => {
    if (loadedRef.current || !isCardPage) return;
    loadedRef.current = true;

    const subj = searchParams.get("subject");
    const les  = searchParams.get("lesson");

    const raw = sessionStorage.getItem("adaptation");
    if (raw) {
      const cached = JSON.parse(raw) as Adaptation;
      if (cached.meta?.subject === subj && String(cached.meta?.lesson) === les) {
        setAdaptation(cached);
        return;
      }
      sessionStorage.removeItem("adaptation");
      sessionStorage.removeItem("quiz");
    }

    if (!subj || !les) return;

    fetch(`/api/adaptation?user=${user}&subject=${subj}&lesson=${les}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.exists) return;
        sessionStorage.setItem("adaptation", JSON.stringify(json.adaptation));
        if (json.quiz) sessionStorage.setItem("quiz", JSON.stringify(json.quiz));
        setAdaptation(json.adaptation);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCardPage]);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft:  () => { if (isCardPage) navigate(nextStep(user, moduleId, cardId, params)); },
    onSwipedRight: () => { if (isCardPage && !isFirst) navigate(prevStep(user, moduleId, cardId, params)); },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  if (!isCardPage && !isSeparator) return <>{children}</>;

  // ── Home icon (shared) ─────────────────────────────────────────────────────
  const homeIcon = (
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
  );

  // ── Progress bar: 4 модула × 5 карти + home icon ──────────────────────────
  const progressDots = (
    <div className="flex-none bg-white px-4 pt-3 pb-2 flex items-center gap-2">
      {/* 4 групи, всяка с 5 под-сегмента — едно четливо визуализация */}
      <div className="flex gap-2 flex-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex gap-0.5 flex-1">
            {[1, 2, 3, 4, 5].map((step) => {
              const filled = n < moduleId
                ? true
                : n === moduleId
                  ? step <= cardId
                  : false;
              return (
                <div
                  key={step}
                  className="flex-1 rounded-full transition-colors duration-300"
                  style={{
                    height: 5,
                    backgroundColor: filled ? MODULE_PROGRESS[n] : NAV.border,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {homeIcon}
    </div>
  );

  // ── Separator / Браво screen ───────────────────────────────────────────────
  if (isSeparator) {
    return (
      <div className="flex flex-col" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
        <div className="flex-none flex items-center justify-end px-4 py-2">
          {homeIcon}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2.5 text-center">
          <span className="text-7xl leading-none">🎉</span>
          <h1 className="font-bold text-xl" style={{ color: NAV.text }}>Браво!</h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>Завърши секция {sepFrom} от 4!</p>
        </div>
        <div className="px-4 pb-6 flex gap-3">
          <button
            onClick={() => navigate(`/${user}/lesson/${sepFrom}/5?${params}`)}
            className="btn-press flex-1 rounded-xl flex items-center justify-center text-xl"
            style={{ height: 56, backgroundColor: NAV.surface, color: NAV.text }}
          >
            ←
          </button>
          <button
            onClick={() => navigate(`/${user}/lesson/${sepTo}/1?${params}`)}
            className="btn-press flex-1 rounded-xl text-white text-xl flex items-center justify-center"
            style={{ backgroundColor: NAV.btnSolid, height: 56 }}
          >
            →
          </button>
        </div>
      </div>
    );
  }

  // ── Card UI ────────────────────────────────────────────────────────────────
  const moduleData = adaptation?.modules.find((m) => m.id === moduleId);
  const card       = moduleData?.cards.find((c) => c.id === cardId);

  return (
    <div className="flex flex-col" style={{ backgroundColor: "#ffffff", height: "100dvh" }}>
      {progressDots}

      {/* Navbar: module title only */}
      <nav className="flex-none px-4 py-2 bg-white">
        {moduleData?.title && (
          <span className="text-sm font-medium" style={{ color: NAV.textMuted }}>
            {moduleData.title}
          </span>
        )}
      </nav>

      {/* Съдържание */}
      <div {...swipeHandlers} className="flex-1 overflow-y-auto px-5 pt-4 pb-2" style={{ backgroundColor: bgColor }}>
        {!card ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: NAV.textMuted }}>Зарежда...</p>
          </div>
        ) : (
          <div>
            <p className="text-xl font-bold mb-4 leading-snug" style={{ color: NAV.text }}>{card.title}</p>
            <div className="space-y-2">
              <Section icon="📌" label="Какво е"      text={card.what}    moduleId={moduleId} />
              <Section icon="💡" label="Защо е важно" text={card.why}     moduleId={moduleId} />
              <Section icon="✏️" label="Пример"       text={card.example} moduleId={moduleId} />
            </div>
          </div>
        )}
      </div>

      {/* Бутони: равни ← и → */}
      <div className="flex-none flex gap-3 px-4 pb-6 pt-3 bg-white">
        <button
          onClick={() => isFirst
            ? navigate(`/${user}/confirm?${params}`)
            : navigate(prevStep(user, moduleId, cardId, params))
          }
          className="btn-press flex-1 rounded-xl flex items-center justify-center text-xl"
          style={{ height: 56, backgroundColor: NAV.surface, color: NAV.text }}
        >
          ←
        </button>
        <button
          onClick={() => navigate(nextStep(user, moduleId, cardId, params))}
          className="btn-press flex-1 rounded-xl text-white text-xl flex items-center justify-center"
          style={{ backgroundColor: MODULE_BTN[moduleId], height: 56 }}
        >
          →
        </button>
      </div>
    </div>
  );
}

function Section({ icon, label, text, moduleId }: { icon: string; label: string; text: string; moduleId: number }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: MODULE_SURFACE[moduleId] ?? "#F0F0F0" }}>
      <p className="text-sm font-medium uppercase tracking-wide mb-1" style={{ color: MODULE_BTN[moduleId], opacity: 0.8 }}>
        {icon} {label}
      </p>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
