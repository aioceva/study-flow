// Карта в урок
export interface Card {
  id: number;
  title: string;
  what: string;
  why: string;
  example: string;
}

// Модул
export interface Module {
  id: number;
  title: string;
  color: string;
  cards: Card[];
}

// Адаптация на урок
export interface Adaptation {
  meta: {
    user: string;
    subject: string;
    lesson: number;
    generated: string;
    title: string;
  };
  modules: Module[];
}

// Въпрос за quiz
export interface QuizOption {
  id: "a" | "b" | "c";
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: number;
  module_id: number;
  card_id: number;
  question: string;
  options: QuizOption[];
  explanation?: string;
}

// Quiz файл
export interface Quiz {
  meta: {
    user: string;
    subject: string;
    lesson: number;
    generated: string;
    total: number;
  };
  questions: QuizQuestion[];
}

// Сесия
export interface LearnSession {
  date: string;
  subject: string;
  lesson: number;
  started_at: string;
  duration_min: number;
  type: "learn";
  status?: "completed" | "partial";
  completed: boolean;
}

export interface ReinforcementSession {
  date: string;
  subject: string;
  lesson: number;
  started_at: string;
  duration_min: number;
  type: "reinforcement";
  score?: number; // legacy — нови сесии не го пазят; ползвай total - errors.length
  total: number;
  errors: number[];
}

export type Session = LearnSession | ReinforcementSession;

// Sessions файл
export interface Sessions {
  meta: { user: string };
  sessions: Session[];
}

// Ниво на четене
export type ReadingSupport = "low_support" | "medium_support" | "high_support";

// Пилот — потребителски профил
export interface UserProfile {
  name: string;
  grade: string;
  readingSupport?: ReadingSupport;
  readingColor?: string;
  readingTheme?: string;
  joinedAt: string;
}

// Пилот — регистрация
export interface EnrollmentParticipant {
  user: string;
  name: string;
  grade: string;
  joinedAt: string;
}

export interface Enrollment {
  limit: number;
  enrolled: number;
  participants: EnrollmentParticipant[];
}

// Предмети
export type Subject = "math" | "bio" | "chem" | "phys" | "hist" | "lit" | "gen";

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: "Математика",
  bio: "Биология",
  chem: "Химия",
  phys: "Физика",
  hist: "История",
  lit: "Литература",
  gen: "Общ",
};

// Навигационна палитра — стойностите са CSS custom property references
// CSS vars се задават от [user]/layout.tsx спрямо избраната ReadingTheme
// Fallback стойностите съвпадат с оригиналната NAV палитра (main branch)
export const NAV = {
  headerBg:  "var(--theme-btn, #4A6FA5)",
  btnSolid:  "var(--theme-btn, #4A6FA5)",
  btnBorder: "var(--theme-btn, #4A6FA5)",
  surface:   "var(--theme-btn-secondary, #F0F2F5)",
  bg:        "var(--theme-bg, #FFFFFF)",
  text:      "var(--theme-text, #4A6FA5)",
  textMuted: "var(--theme-text-muted, #5A6A7E)",
  border:    "var(--theme-card-border, #E2E5EA)",
};

// Фон на карти/тайлове — #FFFFFF съвпада с оригиналните бели карти
export const CARD_BG = "var(--theme-card, #FFFFFF)";

// Фон на модул (content area)
export const MODULE_COLORS: Record<number, string> = {
  1: "#D6EEFA",
  2: "#D4F2E5",
  3: "#FFF0F5",
  4: "#EAE5FA",
};

// Surface (секции вътре в карта)
export const MODULE_SURFACE: Record<number, string> = {
  1: "#A5D8F0",
  2: "#A5E0C8",
  3: "#F9C0D4",
  4: "#C8BEF0",
};

// Прогрес бар
export const MODULE_PROGRESS: Record<number, string> = {
  1: "#50B8DC",
  2: "#58C090",
  3: "#E8739A",
  4: "#8B7FCC",
};

// Бутон Напред
export const MODULE_BTN: Record<number, string> = {
  1: "#2898C0",
  2: "#3B9E6A",
  3: "#C94F7C",
  4: "#7068B8",
};
