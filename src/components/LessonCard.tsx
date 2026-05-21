"use client";

import { NAV, SUBJECT_LABELS, Subject } from "@/types";

const SUBJECT_COLORS: Record<string, string> = {
  math: "#6fa3e8",
  bio:  "#6dc297",
  chem: "#f4a261",
  phys: "#e57373",
  hist: "#a384cc",
  lit:  "#f48fb1",
  gen:  "#50b8d8",
};

interface LessonCardProps {
  subject: string;
  lesson: string | number;
  title?: string;
  /** Override the auto-resolved subject label */
  subjectLabel?: string;
  /** If provided, the entire card is a clickable button */
  onClick?: () => void;
}

export function LessonCard({
  subject,
  lesson,
  title,
  subjectLabel,
  onClick,
}: LessonCardProps) {
  const label    = subjectLabel ?? SUBJECT_LABELS[subject as Subject] ?? subject;
  const barColor = SUBJECT_COLORS[subject] ?? "#50b8d8";

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  };

  const inner = (
    <div className="flex">
      {/* Colored vertical bar */}
      <div className="flex-none" style={{ width: 4, backgroundColor: barColor }} />
      {/* Content */}
      <div className="flex items-center gap-3 p-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex" style={{ backgroundColor: barColor, borderRadius: 24, padding: "3px 10px" }}>
              <span className="text-sm font-medium tracking-wider uppercase" style={{ color: "#FFFFFF" }}>
                {label}
              </span>
            </div>
            <span className="text-sm font-medium" style={{ color: NAV.textMuted }}>· Урок {lesson}</span>
          </div>
          {title && (
            <p className="text-base leading-snug" style={{ color: NAV.text }}>{title}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="tile-press w-full rounded-xl text-left"
        style={cardStyle}
        type="button"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl" style={{ ...cardStyle, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      {inner}
    </div>
  );
}
