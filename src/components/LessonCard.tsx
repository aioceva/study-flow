"use client";

import { NAV, SUBJECT_LABELS, Subject } from "@/types";

const SUBJECT_COLORS: Record<string, string> = {
  math: "#4F8EF7",
  bio:  "#22C55E",
  chem: "#F59E0B",
  phys: "#EF4444",
  hist: "#A78BFA",
  lit:  "#EC4899",
  gen:  "#94A3B8",
};

interface LessonCardProps {
  subject: string;
  lesson: string | number;
  title?: string;
  /** Override the auto-resolved subject label */
  subjectLabel?: string;
  /** Show the play button — default true */
  showPlayButton?: boolean;
  /** If provided, play button is a real button with this action */
  onPlay?: () => void;
  /** If provided, the entire card is a clickable button */
  onClick?: () => void;
}

export function LessonCard({
  subject,
  lesson,
  title,
  subjectLabel,
  showPlayButton = true,
  onPlay,
  onClick,
}: LessonCardProps) {
  const dotColor = SUBJECT_COLORS[subject] ?? "#94A3B8";
  const label = subjectLabel ?? SUBJECT_LABELS[subject as Subject] ?? subject;

  const cardStyle: React.CSSProperties = {
    backgroundColor: NAV.surface,
    border: `1px solid ${NAV.border}`,
  };

  const inner = (
    <div className="flex items-center gap-3 p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: dotColor }} />
          <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: NAV.textMuted }}>
            {label} · Урок {lesson}
          </span>
        </div>
        {title && (
          <p className="text-base font-semibold leading-snug" style={{ color: NAV.text }}>{title}</p>
        )}
      </div>
      {showPlayButton && (
        onPlay ? (
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="btn-press flex-none w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: NAV.btnSolid }}
            aria-label="Започни"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polygon points="5,3 15,9 5,15" fill="white" />
            </svg>
          </button>
        ) : (
          <div
            className="flex-none w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: NAV.btnSolid }}
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polygon points="5,3 15,9 5,15" fill="white" />
            </svg>
          </div>
        )
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="btn-press w-full rounded-xl text-left"
        style={cardStyle}
        type="button"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl" style={cardStyle}>
      {inner}
    </div>
  );
}
