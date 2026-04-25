import { Adaptation } from "@/types";

export function quizPrompt(adaptation: Adaptation, today: string): string {
  return `Въз основа на следната адаптация на урок, генерирай 20 въпроса за quiz.

АДАПТАЦИЯ:
${JSON.stringify(adaptation, null, 2)}

ПРАВИЛА:
- По 3 въпроса от всеки модул (12 общо) + 8 общи въпроса за целия урок
- Всеки въпрос има точно 3 отговора (a, b, c)
- Отговорите да са близки по вид — не се познава на случаен принцип
- Един верен отговор на въпрос
- Прост и ясен език
- За всеки въпрос добави поле "explanation" — 1 кратко изречение, което обяснява защо верният отговор е верен (показва се на детето след грешен отговор)

Върни САМО валиден JSON без никакъв друг текст:

{
  "meta": {
    "user": "${adaptation.meta.user}",
    "subject": "${adaptation.meta.subject}",
    "lesson": ${adaptation.meta.lesson},
    "generated": "${today}",
    "total": 20
  },
  "questions": [
    {
      "id": 1,
      "module_id": 1,
      "card_id": 1,
      "question": "Въпросът",
      "options": [
        { "id": "a", "text": "Отговор А", "correct": true },
        { "id": "b", "text": "Отговор Б", "correct": false },
        { "id": "c", "text": "Отговор В", "correct": false }
      ],
      "explanation": "Кратко обяснение защо отговор А е верен."
    }
  ]
}

Генерирай точно 20 въпроса: 3 за модул 1 (module_id:1), 3 за модул 2 (module_id:2), 3 за модул 3 (module_id:3), 3 за модул 4 (module_id:4), 8 общи (module_id:0).`;
}
