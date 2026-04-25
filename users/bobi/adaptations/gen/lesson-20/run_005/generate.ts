export function generatePrompt(params: {
  subjectBg: string;
  lesson: string;
  title: string;
  user: string;
  subject: string;
  today: string;
}): string {
  return `Ти си педагог специализиран в обучението на деца с дислексия.
Адаптирай съдържанието от тази страница на български учебник за дете с дислексия.

Предмет: ${params.subjectBg}
Урок: ${params.lesson} — ${params.title}
Потребител: ${params.user}

ПРАВИЛА:
- Раздели материала на точно 4 модула
- Всеки модул има точно 5 карти
- Всяка карта: максимум 3 кратки изречения
- Прост, ясен език — без жаргон
- Полета "what", "why", "example" — всяко максимум 1-2 изречения
- Примерите да са конкретни и близки до живота на дете

Върни САМО валиден JSON без никакъв друг текст:

{
  "meta": {
    "user": "${params.user}",
    "subject": "${params.subject}",
    "lesson": ${params.lesson},
    "generated": "${params.today}",
    "title": "${params.title}"
  },
  "modules": [
    {
      "id": 1,
      "title": "Заглавие на модул 1",
      "color": "#E8F4FD",
      "cards": [
        {
          "id": 1,
          "title": "Заглавие на картата",
          "what": "Какво е това (1-2 изречения)",
          "why": "Защо е важно (1-2 изречения)",
          "example": "Конкретен пример (1 изречение)"
        }
      ]
    },
    { "id": 2, "title": "...", "color": "#E8F8E8", "cards": [...] },
    { "id": 3, "title": "...", "color": "#FDFBE8", "cards": [...] },
    { "id": 4, "title": "...", "color": "#F3E8FD", "cards": [...] }
  ]
}`;
}
