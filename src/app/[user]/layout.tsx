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
  try {
    const result = await readJSON<UserProfile>(`users/${user}/profile.json`);
    const name = result?.data?.readingTheme ?? DEFAULT_THEME;
    theme = READING_THEMES[name] ?? READING_THEMES[DEFAULT_THEME];
  } catch {
    // fall back to default theme on any error
  }

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        borderLeft: `1px solid ${theme.cardBorder}`,
        borderRight: `1px solid ${theme.cardBorder}`,
        minHeight: "100dvh",
        backgroundColor: theme.bg,
        "--theme-bg":           theme.bg,
        "--theme-card":         theme.card,
        "--theme-text":         theme.text,
        "--theme-text-muted":   theme.textMuted,
        "--theme-btn":          theme.btn,
        "--theme-btn-secondary": theme.btnSecondary,
        "--theme-surface":      theme.card,
        "--theme-card-border":  theme.cardBorder,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
