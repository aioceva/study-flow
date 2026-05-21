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
  readingSupport: ReadingSupport;
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
  1: "#F2F8FF",
  2: "#F2FCF7",
  3: "#FFF8FC",
  4: "#F6F2FF",
};

// Surface (секции вътре в карта)
export const MODULE_SURFACE: Record<number, string> = {
  1: "#CBE8F8",
  2: "#C4EAD0",
  3: "#FFD4E8",
  4: "#DDD0F4",
};

// Прогрес бар
export const MODULE_PROGRESS: Record<number, string> = {
  1: "#50B8DC",
  2: "#58C090",
  3: "#E89030",
  4: "#8B7FCC",
};

// Бутон Напред
export const MODULE_BTN: Record<number, string> = {
  1: "#1A3558",
  2: "#0D3D20",
  3: "#D4608A",
  4: "#1E0B4A",
};
