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

// Цветове по модул
export const MODULE_COLORS: Record<number, string> = {
  1: "#E8F4FD",
  2: "#E8F8E8",
  3: "#FDFBE8",
  4: "#F3E8FD",
};
