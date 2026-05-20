export interface ReadingTheme {
  bg: string;
  headerBg: string;
  card: string;
  text: string;
  textMuted: string;
  btn: string;
  btnSecondary: string;
  cardBorder: string;
  badgeLearnBg: string;
  badgeLearnText: string;
  badgePartialBg: string;
  badgePartialText: string;
  badgeReviewBg: string;
  badgeReviewText: string;
  calendarDot: string;
  quizPillBg: string;
  quizPillText: string;
}

export const READING_THEMES: Record<string, ReadingTheme> = {
  // Идентична с main branch — оригиналната NAV палитра, бели карти
  "default": {
    bg:               "#FFFFFF",
    headerBg:         "#FFFFFF",
    card:             "#FFFFFF",
    text:             "#4A6FA5",
    textMuted:        "#5A6A7E",
    btn:              "#4A6FA5",
    btnSecondary:     "#F0F2F5",
    cardBorder:       "#E2E5EA",
    badgeLearnBg:     "#EBF4FF",
    badgeLearnText:   "#3B7DD8",
    badgePartialBg:   "#FEF3C7",
    badgePartialText: "#92400E",
    badgeReviewBg:    "#F3EEFF",
    badgeReviewText:  "#7B5EA7",
    calendarDot:      "#3B9E6A",
    quizPillBg:       "#E8EAED",
    quizPillText:     "#5A6A7E",
  },
  // 5 нюанса синьо-зелено (тюркоаз): много светъл bg → малко по-тъмен за secondary → карти → мутиран текст → тъмен текст/бутони
  "light-blue": {
    bg:               "#F2FAF8",
    headerBg:         "#E0F2EE",
    card:             "#C4EAE6",
    text:             "#1B6A68",
    textMuted:        "#3A908D",
    btn:              "#1B6A68",
    btnSecondary:     "#D5F5F2",
    cardBorder:       "#3A908D",
    badgeLearnBg:     "#C8F8F4",
    badgeLearnText:   "#1B6A68",
    badgePartialBg:   "#FEF3C7",
    badgePartialText: "#92400E",
    badgeReviewBg:    "#E0D8F8",
    badgeReviewText:  "#3A1A80",
    calendarDot:      "#228B80",
    quizPillBg:       "#A8E8E3",
    quizPillText:     "#1B6A68",
  },
  // 5 нюанса лилаво: много светъл bg → малко по-тъмен за secondary → карти → мутиран текст → тъмен текст/бутони
  "light-purple": {
    bg:               "#F6F3FC",
    headerBg:         "#EDE8F5",
    card:             "#E0D6F7",
    text:             "#2C1668",
    textMuted:        "#6B4FAA",
    btn:              "#2C1668",
    btnSecondary:     "#E5DEF8",
    cardBorder:       "#6B4FAA",
    badgeLearnBg:     "#D5C8F0",
    badgeLearnText:   "#2C1668",
    badgePartialBg:   "#FDEBD0",
    badgePartialText: "#8A4010",
    badgeReviewBg:    "#C8E0F5",
    badgeReviewText:  "#1A3A70",
    calendarDot:      "#3E2490",
    quizPillBg:       "#B8A0D8",
    quizPillText:     "#2C1668",
  },
};

export const THEME_LABELS: Record<string, string> = {
  "default":      "По подразбиране",
  "light-blue":   "Синьо",
  "light-purple": "Лилаво",
};

export const DEFAULT_THEME = "default";
