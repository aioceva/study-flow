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
  completed: boolean;
  quiz_1: { score: number; total: number; errors: number[] };
  quiz_2: { score: number; total: number; errors: number[] };
}

export interface ReinforcementSession {
  date: string;
  subject: string;
  lesson: number;
  started_at: string;
  duration_min: number;
  type: "reinforcement";
  score: number;
  total: number;
  errors: number[];
}

export type Session = LearnSession | ReinforcementSession;

// Sessions файл
export interface Sessions {
  meta: { user: string };
  sessions: Session[];
}

// Пилот — потребителски профил
export interface UserProfile {
  name: string;
  grade: string;
  readingColor: string;
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

// Навигационна палитра
export const NAV = {
  headerBg:  "#4A6FA5",
  btnSolid:  "#4A6FA5",
  btnBorder: "#4A6FA5",
  surface:   "#F0F2F5",
  bg:        "#FFFFFF",
  text:      "#4A6FA5",
  textMuted: "#5A6A7E",
  border:    "#E2E5EA",
};

// Фон на модул (content area)
export const MODULE_COLORS: Record<number, string> = {
  1: "#EBF4FF",
  2: "#E8F9F1",
  3: "#FEFAE8",
  4: "#F3EEFF",
};

// Surface (секции вътре в карта)
export const MODULE_SURFACE: Record<number, string> = {
  1: "#BDD8F7",
  2: "#B4E5CC",
  3: "#F7E49E",
  4: "#D4C4EE",
};

// Прогрес бар
export const MODULE_PROGRESS: Record<number, string> = {
  1: "#6FA3E8",
  2: "#6DC297",
  3: "#C49020",
  4: "#A384CC",
};

// Бутон Напред
export const MODULE_BTN: Record<number, string> = {
  1: "#3B7DD8",
  2: "#3B9E6A",
  3: "#9A6E08",
  4: "#7B5EA7",
};
