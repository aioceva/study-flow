export interface ReadingTheme {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  btn: string;
  btnSecondary: string;
  cardBorder: string;
}

export const READING_THEMES: Record<string, ReadingTheme> = {
  "off-white": {
    bg:           "#FAF8F4",
    card:         "#F0EDE7",
    text:         "#2D2D2D",
    textMuted:    "#6B6560",
    btn:          "#4A6FA5",
    btnSecondary: "#E8E4DD",
    cardBorder:   "#E5E0D8",
  },
  "dark-grey": {
    bg:           "#2C2C2C",
    card:         "#3A3A3A",
    text:         "#F0EDE8",
    textMuted:    "#B8B4AF",
    btn:          "#6B8CC4",
    btnSecondary: "#444444",
    cardBorder:   "#484848",
  },
  "light-pink": {
    bg:           "#FDF0F3",
    card:         "#F8E2E8",
    text:         "#5C1A2A",
    textMuted:    "#8B4A5A",
    btn:          "#B5435C",
    btnSecondary: "#F4D5DC",
    cardBorder:   "#ECC8D2",
  },
  "light-blue": {
    bg:           "#EFF5FC",
    card:         "#DDE9F7",
    text:         "#1A3558",
    textMuted:    "#4A6A8A",
    btn:          "#2B6CB0",
    btnSecondary: "#CCE0F5",
    cardBorder:   "#C5D9EE",
  },
  "light-purple": {
    bg:           "#F2EFF9",
    card:         "#E5DEEF",
    text:         "#2D1B5E",
    textMuted:    "#5E4A8A",
    btn:          "#6347B5",
    btnSecondary: "#DDD4F0",
    cardBorder:   "#D0C5E8",
  },
  "light-green": {
    bg:           "#EFF6EF",
    card:         "#DDF0DB",
    text:         "#1A3D1A",
    textMuted:    "#3D6B3A",
    btn:          "#2D7A2D",
    btnSecondary: "#CCE8CA",
    cardBorder:   "#BFDCBC",
  },
};

export const THEME_LABELS: Record<string, string> = {
  "off-white":    "Крем",
  "dark-grey":    "Тъмно сиво",
  "light-pink":   "Розово",
  "light-blue":   "Синьо",
  "light-purple": "Лилаво",
  "light-green":  "Зелено",
};

export const DEFAULT_THEME = "off-white";
