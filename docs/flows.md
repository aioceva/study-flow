# Study Flow — Flows

Описва основните потоци през приложението. Стъпките са изразени чрез `screen_id` от [screens.md](screens.md). API повикванията са отбелязани в скоби.

---

## Режими

### Normal Mode
Стандартният режим за деца от пилота. AI generate се извиква само при ново сканиране — повторното отваряне на урок чете кеш от GitHub без AI calls. Има rate limit (5 урока на ден per user, 10 общо за пилота). Сесиите се записват в sessions.json.

### Test Mode
QA / dev режим за валидиране на prompt pipeline-а. Активира се чрез `?mode=test` query параметър, който се пренася през навигацията (всички вътрешни линкове го запазват). Разлики:

- Скип на rate limits (`MAX_PER_DAY`, `MAX_TOTAL`) в `/api/generate`.
- Включва Claude `thinking` (budget 10k tokens, max_tokens 16k) и записва `adaptation-thinking.json`.
- При cache hit регенерира **винаги** — старата версия се архивира в `run_NNN/` чрез `/api/archive-lesson` (всички файлове + snapshot на текущите `src/prompts/{generate,quiz,recognize}.ts`).
- Жълт test panel на `lesson/confirm` с download links за всички lesson файлове, бутон „↓ zip all", и списък с предишни run-ове.
- Поддържа `?run=run_NNN` за read-only преглед на конкретен предишен опит — `lesson/confirm` и `quiz/question` четат от `run_NNN/` папката, не от root.
- Не пише сесии когато `?run=` е активен (за чистота на logs).

---

## Normal Mode Flow

### Първо сканиране на нов урок

```
home/list
  └─[„Сканирай нов урок"]→ scan/capture
                              │ (POST /api/recognize → предмет + урок)
  ───────────────────────────┘
scan/capture
  └─[„Продължи"]→ scan/loading
                    │ (GET /api/adaptation — кеш проверка)
                    │ → cache miss
                    │ (POST /api/generate → adaptation.json + original.jpg)
                    │ (POST /api/quiz → quiz.json)
                    │ кеш в sessionStorage
  ─────────────────┘
scan/loading
  └─(auto)→ lesson/confirm
              └─[„Отвори урока"]→ lesson/card 1/1 → ... → lesson/card 1/5
                                    └─→ lesson/separator (1→2)
                                          └─→ lesson/card 2/1 → ... → 2/5
                                                └─→ lesson/separator (2→3)
                                                      └─→ ... → lesson/card 4/5
                                                                  └─→ lesson/done
                                                                        │ (POST /api/session — completed)
                                                                        ├─[„Провери знанията си"]→ quiz/question
                                                                        └─[„Към началото"]→ home/list
```

**Стъпки:**

1. **`home/list`** — детето отваря началния екран и кликва „Сканирай нов урок".
2. **`scan/capture`** — снима страница; `/api/recognize` връща предмет и номер на урок (Claude Vision).
3. **`scan/loading`** — checks GitHub кеша. Cache miss → `/api/generate` с изображението (~30 сек, генерира 4 модула × 5 карти) и след това `/api/quiz` (20 въпроса). Записва adaptation.json, quiz.json, original.jpg, adaptation-context.json в GitHub. Кешира в sessionStorage.
4. **`lesson/confirm`** — hub: показва заглавието, модулите, време за четене. Детето избира „Отвори урока" или (заключено за първи път) „Провери знанията".
5. **`lesson/card` × 20** — четене карта по карта, swipe навигация. На първата карта се записва partial session.
6. **`lesson/separator`** — между модулите („Браво! Завърши секция X от 4!").
7. **`lesson/done`** — край. Записва се completed сесия (`type: "learn"`).
8. **(опц.) `quiz/question` → `quiz/result`** — 10 случайни въпроса от quiz.json (без AI). Записва се reinforcement сесия с total + errors.

### Повторно отваряне (reinforcement)

```
home/list
  └─[tile на урок]→ lesson/confirm
                      │ (GET /api/adaptation — cache hit, без AI)
                      ├─[„Отвори урока"]→ lesson/card → ... → lesson/done
                      └─[„Провери знанията си"]→ quiz/question → quiz/result
```

**Ключова разлика:** на `scan/loading` cache hit → директно към `lesson/confirm` без AI calls. Но в реалност повторното отваряне започва от `home/list` → tile → `lesson/confirm` без да минава през scan въобще.

---

## Test Mode Flow

```
home/list?mode=test
  └─[„Сканирай нов урок"]→ scan/capture?mode=test
                              │
  ───────────────────────────┘
scan/capture?mode=test
  └─[„Продължи"]→ scan/loading?mode=test
                    │ (GET /api/adaptation)
                    │ → cache hit?
                    │   └─[ДА] (POST /api/archive-lesson → run_NNN/)
                    │            архивира + snapshot на prompts
                    │            маха записа от _index.json
                    │ (POST /api/generate?mode=test → thinking enabled, adaptation-thinking.json)
                    │ (POST /api/quiz)
  ─────────────────┘
scan/loading?mode=test
  └─(auto)→ lesson/confirm?mode=test
              │ Test panel: download links + list на run-ове
              ├─[„Отвори урока"]→ lesson/card?mode=test → ... → lesson/done
              ├─[„Провери знанията"]→ quiz/question?mode=test → quiz/result
              └─[run_NNN ↗ link]→ lesson/confirm?mode=test&run=run_NNN
                                    │ чете от run_NNN/ папката
                                    └─[„Отвори урока"]→ lesson/card?run=run_NNN ...
```

**Стъпки:**

1. **`?mode=test` се пренася от началото докрай.** Линкове в `home/list`, `scan/capture`, `lesson/confirm` запазват query параметъра при навигация.
2. **`scan/loading?mode=test`** — независимо от cache hit, регенерира. При hit извиква `/api/archive-lesson` — премества всички текущи lesson файлове в `run_NNN/` (next free index, формат `run_001`, `run_002`...), копира snapshot на `generate.ts`, `quiz.ts`, `recognize.ts` от `src/prompts/`, маха записа от `_index.json`. После `/api/generate?mode=test` — Claude thinking enabled, записва `adaptation-thinking.json`. Rate limit пропуснат.
3. **`lesson/confirm?mode=test`** — жълт test panel. Динамичен листинг на файловете в lesson папката (`/api/lesson-files-list`). Бутони:
   - download link за всеки data файл (adaptation.json, quiz.json, original.jpg, adaptation-context.json, adaptation-thinking.json)
   - download link за всеки prompt файл (`generate.ts`, `quiz.ts`, `recognize.ts` — от `/api/prompt-file` в root mode, от run папката в run mode)
   - „↓ zip all" за общ архив
   - списък с прежни run-ове (само в root mode) — клик отваря нов tab с `?run=run_NNN`
4. **`?run=run_NNN`** (нов tab от run pill) — read-only преглед. `lesson/confirm` и `quiz/question` четат adaptation/quiz от `run_NNN/` папка вместо root. Test panel показва файловете в run папката (включително snapshot на промптите). Не се записват сесии.
5. Нататък flow-ът върви като Normal — `lesson/card` → ... → `lesson/done` → опц. `quiz/question` → `quiz/result`. Всички URL-и носят `?mode=test` (и `?run=` ако е активен).
