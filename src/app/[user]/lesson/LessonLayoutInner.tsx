"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Adaptation, MODULE_COLORS, MODULE_SURFACE, MODULE_PROGRESS, MODULE_BTN, NAV, SUBJECT_LABELS, Subject } from "@/types";
import { nextStep, prevStep, nextButtonLabel } from "@/lib/navigation";
import Image from "next/image";

export default function LessonLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useParams<{ user: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const loadedRef = useRef(false);

  const segments = pathname.split("/").filter(Boolean);
  const isCardPage =
    segments.length === 4 &&
    !isNaN(parseInt(segments[2])) &&
    !isNaN(parseInt(segments[3]));
  const isSeparator = segments.length === 3 && segments[2] === "separator";
  const isIntro     = segments.length === 3 && segments[2] === "intro";

  const moduleId = isCardPage ? parseInt(segments[2]) : 1;
  const cardId   = isCardPage ? parseInt(segments[3]) : 1;
  const params   = searchParams.toString();
  const isReview = searchParams.get("mode") === "review";

  const sepFrom     = isSeparator ? parseInt(searchParams.get("from") ?? "1") : 1;
  const sepTo       = isSeparator ? parseInt(searchParams.get("to")   ?? "2") : 2;
  const lessonTitle = searchParams.get("title") ?? "";
  const subject     = searchParams.get("subject") ?? "";
  const lesson      = searchParams.get("lesson") ?? "";
  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;
  const accentColor = MODULE_BTN[3]; // топло злато за subject·lesson label

  const bgColor = MODULE_COLORS[moduleId] ?? "#F8F9FA";
  const isFirst = moduleId === 1 && cardId === 1;

  useEffect(() => {
    if (loadedRef.current || !isCardPage) return;
    loadedRef.current = true;

    const raw = sessionStorage.getItem("adaptation");
    if (raw) { setAdaptation(JSON.parse(raw)); return; }

    const subj = searchParams.get("subject");
    const les  = searchParams.get("lesson");
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft:  () => { if (isCardPage) router.push(nextStep(user, moduleId, cardId, params)); },
    onSwipedRight: () => { if (isCardPage && !isFirst) router.push(prevStep(user, moduleId, cardId, params)); },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  if (!isCardPage && !isSeparator && !isIntro) return <>{children}</>;

  // ── Home icon (shared) ─────────────────────────────────────────────────────
  const homeIcon = (
    <div className="px-4 py-2">
      <button
        onClick={() => router.push(`/${user}`)}
        className="btn-press w-8 h-8 flex items-center justify-center"
        style={{ opacity: 0.5 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      </button>
    </div>
  );

  // ── Progress bar (card pages only) ────────────────────────────────────────
  const progressBar = (
    <div className="flex-none flex gap-1 px-4 pt-3 pb-0 bg-white">
      {[1, 2, 3, 4].map((m) => (
        <div key={m} className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: m < moduleId ? "100%" : m === moduleId ? `${(cardId / 5) * 100}%` : "0%",
              backgroundColor: MODULE_PROGRESS[m],
              transition: "width 0.4s ease",
            }}
          />
        </div>
      ))}
    </div>
  );

  // ── Intro screen ───────────────────────────────────────────────────────────
  if (isIntro) {
    return (
      <div className="flex flex-col" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
        {homeIcon}
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3 text-center">
          <Image src="/icons/icon-lesson.svg" width={96} height={96} alt="урок" />
          <h1 className="font-bold text-xl" style={{ color: NAV.text }}>
            {lessonTitle || `Урок ${lesson}`}
          </h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>{subjectLabel}</p>
        </div>
        <div className="px-4 pb-6">
          <button
            onClick={() => router.push(`/${user}/lesson/1/1?${params}`)}
            className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm text-center"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            Започни →
          </button>
        </div>
      </div>
    );
  }

  // ── Separator / Браво screen ───────────────────────────────────────────────
  if (isSeparator) {
    return (
      <div className="flex flex-col" style={{ backgroundColor: NAV.bg, height: "100dvh" }}>
        {homeIcon}
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2.5 text-center">
          <span className="text-7xl leading-none">🎉</span>
          <h1 className="font-bold text-xl" style={{ color: NAV.text }}>Браво!</h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>Завърши тази секция.</p>
          {subjectLabel && lesson && (
            <p className="text-xs font-semibold" style={{ color: accentColor }}>
              {subjectLabel} · Урок {lesson}
            </p>
          )}
        </div>
        <div className="px-4 pb-6 flex gap-2">
          <button
            onClick={() => router.push(`/${user}/lesson/${sepFrom}/5?${params}`)}
            className="btn-press rounded-xl flex items-center justify-center font-bold text-base flex-none"
            style={{
              width: 46, height: 46,
              backgroundColor: NAV.bg,
              border: `2px solid ${NAV.btnBorder}`,
              color: NAV.text,
            }}
          >
            ‹
          </button>
          <button
            onClick={() => router.push(`/${user}/lesson/${sepTo}/1?${params}`)}
            className="btn-press flex-1 rounded-xl text-white font-semibold text-sm text-center"
            style={{ backgroundColor: NAV.btnSolid, height: 46 }}
          >
            Напред →
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
      {progressBar}

      {/* Navbar с модул title */}
      <nav className="flex-none flex items-center gap-3 px-4 py-3 bg-white">
        <button
          onClick={() => router.push(`/${user}`)}
          className="btn-press w-8 h-8 flex-none flex items-center justify-center"
          style={{ opacity: 0.5 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
        {moduleData?.title && (
          <span className="text-sm font-semibold truncate" style={{ color: NAV.textMuted }}>
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
            <p className="text-lg font-bold mb-4" style={{ color: NAV.text }}>{card.title}</p>
            <div className="space-y-2">
              <Section icon="📌" label="Какво е"      text={card.what}    moduleId={moduleId} />
              <Section icon="💡" label="Защо е важно" text={card.why}     moduleId={moduleId} />
              <Section icon="✏️" label="Пример"       text={card.example} moduleId={moduleId} />
            </div>
          </div>
        )}
      </div>

      {/* Бутони */}
      <div className="flex-none flex gap-2 px-4 pb-6 pt-3 bg-white">
        {isFirst ? (
          <div style={{ width: 46, height: 46, flexShrink: 0 }} />
        ) : (
          <button
            onClick={() => router.push(prevStep(user, moduleId, cardId, params))}
            className="btn-press rounded-xl flex items-center justify-center font-bold text-base flex-none"
            style={{
              width: 46, height: 46,
              backgroundColor: NAV.bg,
              border: `2px solid ${NAV.btnBorder}`,
              color: NAV.text,
            }}
          >
            ‹
          </button>
        )}
        <button
          onClick={() => router.push(nextStep(user, moduleId, cardId, params))}
          className="btn-press flex-1 rounded-xl text-white font-semibold text-sm text-center"
          style={{ backgroundColor: MODULE_BTN[moduleId], height: 46 }}
        >
          {nextButtonLabel(moduleId, cardId, isReview)}
        </button>
      </div>
    </div>
  );
}

function Section({ icon, label, text, moduleId }: { icon: string; label: string; text: string; moduleId: number }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: MODULE_SURFACE[moduleId] ?? "#F0F0F0" }}>
      <p className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: MODULE_BTN[moduleId], opacity: 0.8 }}>
        {icon} {label}
      </p>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
