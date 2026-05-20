import { readJSON } from "@/lib/github";
import { READING_THEMES, DEFAULT_THEME, ReadingTheme } from "@/types/themes";
import { UserProfile } from "@/types";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;

  let theme: ReadingTheme = READING_THEMES[DEFAULT_THEME];
  let themeName = DEFAULT_THEME;
  try {
    const result = await readJSON<UserProfile>(`users/${user}/profile.json`);
    themeName = result?.data?.readingTheme ?? DEFAULT_THEME;
    theme = READING_THEMES[themeName] ?? READING_THEMES[DEFAULT_THEME];
  } catch {
    // fall back to default theme on any error
  }

  const isDefault = themeName === "default";

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        borderLeft: `1px solid ${theme.cardBorder}`,
        borderRight: `1px solid ${theme.cardBorder}`,
        minHeight: "100dvh",
        backgroundColor: theme.bg,
        // Core vars — always set (fallbacks in NAV/CARD_BG already match DEFAULT values)
        "--theme-content-bg":    isDefault ? "#F0F2F5" : "#FFFFFF",
        "--theme-header-bg":     theme.headerBg,
        "--theme-bg":            theme.bg,
        "--theme-text":          theme.text,
        "--theme-text-muted":    theme.textMuted,
        "--theme-btn":           theme.btn,
        "--theme-btn-secondary": theme.btnSecondary,
        "--theme-card":          theme.card,
        "--theme-card-border":   theme.cardBorder,
        // Module-override vars — only set for colored themes.
        // For DEFAULT, these are intentionally absent so LessonLayoutInner falls back
        // to MODULE_COLORS / MODULE_SURFACE / MODULE_BTN per-module colors.
        ...(isDefault ? {} : {
          "--theme-accent":          theme.btn,
          "--theme-surface":         theme.card,
          "--theme-lesson-bg":       "#FFFFFF",
          "--theme-progress-dot":    theme.btn,
          "--calendar-today-bg":     "#FFFFFF",
          "--calendar-today-border": theme.text,
          "--calendar-future-bg":    "#FFFFFF",
          "--calendar-future-text":  theme.text,
          "--theme-card-shadow":     "0 2px 10px rgba(74, 111, 165, 0.09)",
        }),
        ...(themeName === "light-purple" ? { "--theme-lesson-chrome": "#FFFFFF", "--theme-lesson-play-btn": "#7E64CE", "--theme-lesson-play-btn-shadow": "0 6px 10px rgba(0,0,0,0.20)", "--theme-lesson-sound-btn": "var(--theme-surface)", "--theme-lesson-sound-btn-shadow": "0 6px 10px rgba(0,0,0,0.20)" } : {}),
        ...(themeName === "light-blue"   ? { "--theme-lesson-chrome": "#FFFFFF", "--theme-lesson-play-btn": "#25A896", "--theme-lesson-play-btn-shadow": "0 6px 10px rgba(0,0,0,0.20)", "--theme-lesson-sound-btn": "var(--theme-surface)", "--theme-lesson-sound-btn-shadow": "0 6px 10px rgba(0,0,0,0.20)" } : {}),
        // Quiz vars — always fixed (quiz is always white regardless of theme)
        "--quiz-correct-bg":     "#E8F9F1",
        "--quiz-correct-text":   "#3B9E6A",
        "--quiz-wrong-bg":       "#FDF0F0",
        "--quiz-wrong-text":     "#C07070",
        "--quiz-pill-bg":        theme.quizPillBg,
        "--quiz-pill-text":      theme.quizPillText,
        // Badge vars
        "--badge-learn-bg":      theme.badgeLearnBg,
        "--badge-learn-text":    theme.badgeLearnText,
        "--badge-partial-bg":    theme.badgePartialBg,
        "--badge-partial-text":  theme.badgePartialText,
        "--badge-review-bg":     theme.badgeReviewBg,
        "--badge-review-text":   theme.badgeReviewText,
        "--calendar-active-bg":  theme.calendarDot,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
