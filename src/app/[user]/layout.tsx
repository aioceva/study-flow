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

  const isDark = themeName === "dark-grey";

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        borderLeft: `1px solid ${theme.cardBorder}`,
        borderRight: `1px solid ${theme.cardBorder}`,
        minHeight: "100dvh",
        backgroundColor: theme.bg,
        "--theme-bg":            theme.bg,
        "--theme-card":          theme.card,
        "--theme-text":          theme.text,
        "--theme-text-muted":    theme.textMuted,
        "--theme-btn":           theme.btn,
        "--theme-accent":        theme.btn,
        "--theme-btn-secondary": theme.btnSecondary,
        "--theme-surface":       theme.card,
        "--theme-card-border":   theme.cardBorder,
        "--quiz-correct-bg":     isDark ? "#1a4d2e" : "#E8F9F1",
        "--quiz-correct-text":   isDark ? "#a8e6c3" : "#3B9E6A",
        "--quiz-wrong-bg":       isDark ? "#4d1a1a" : "#FDF0F0",
        "--quiz-wrong-text":     isDark ? "#e6a8a8" : "#C07070",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
