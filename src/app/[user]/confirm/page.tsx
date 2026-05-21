"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { zipSync } from "fflate";
import { NAV, SUBJECT_LABELS, Subject, Sessions, Adaptation, ReinforcementSession } from "@/types";

const PROMPT_FILES = ["generate.ts", "quiz.ts", "recognize.ts"];

const MODULE_DOT_COLORS: Record<number, string> = {
  1: "#BDD8F7",
  2: "#B4E5CC",
  3: "#F9C0D4",
  4: "#D4C4EE",
};

const MODULE_DOT_TEXT: Record<number, string> = {
  1: "#1A3558",
  2: "#1A3D1A",
  3: "#5C1A2A",
  4: "#2D1B5E",
};

function lessonFileUrl(user: string, subject: string, lesson: string, file: string, run: string | null): string {
  const base = `/api/lesson-file?user=${user}&subject=${subject}&lesson=${lesson}&file=${file}`;
  return run ? `${base}&run=${run}` : base;
}

function promptFileUrl(name: string, user: string, subject: string, lesson: string, run: string | null): string {
  if (run) {
    // В run mode промптовете са snapshot-нати в самата run папка
    return lessonFileUrl(user, subject, lesson, name, run);
  }
  return `/api/prompt-file?name=${name}`;
}

async function downloadLessonZip({
  user, subject, lesson, run, files,
}: { user: string; subject: string; lesson: string; run: string | null; files: string[] }) {
  const enc = new TextEncoder();
  const out: Record<string, Uint8Array> = {};

  await Promise.all(
    files.map(async (file) => {
      try {
        const res = await fetch(lessonFileUrl(user, subject, lesson, file, run));
        if (!res.ok) return;
        if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
          out[file] = new Uint8Array(await res.arrayBuffer());
        } else {
          out[file] = enc.encode(await res.text());
        }
      } catch { /* skip missing */ }
    })
  );

  // Промпти: в run mode идват от самия zip-нат списък файлове (вече добавени);
  // в root mode ги дърпаме от локалния /api/prompt-file.
  if (!run) {
    await Promise.all(
      PROMPT_FILES.map(async (name) => {
        try {
          const res = await fetch(promptFileUrl(name, user, subject, lesson, null));
          if (!res.ok) return;
          out[name] = enc.encode(await res.text());
        } catch { /* skip */ }
      })
    );
  }

  const zipped = zipSync(out);
  const blob = new Blob([zipped as unknown as BlobPart], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = run ? `lesson-${subject}-${lesson}-${run}.zip` : `lesson-${subject}-${lesson}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ConfirmPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") ?? "";
  const lesson = searchParams.get("lesson") ?? "";
  const title = searchParams.get("title") ?? "";
  const mode = searchParams.get("mode");
  const run = searchParams.get("run");
  const isTest = mode === "test";
  const params = searchParams.toString();

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;

  const [hasSessions, setHasSessions] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<{ label: string; pct: number } | null>(null);
  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const [adaptationMissing, setAdaptationMissing] = useState(false);

  // Test panel state
  const [panelOpen, setPanelOpen] = useState(true);
  const [testFiles, setTestFiles] = useState<string[]>([]);
  const [testRuns, setTestRuns] = useState<string[]>([]);

  useEffect(() => {
    // Run mode не пише в sessions — пропускаме fetch-а за чистота
    if (run) {
      setHasSessions(true);
      return;
    }
    fetch(`/api/session?user=${user}`)
      .then((r) => r.json())
      .then((data: Sessions) => {
        const relevant = (data.sessions ?? []).filter(
          (s) => s.subject === subject && String(s.lesson) === lesson
        );
        setHasSessions(relevant.length > 0);

        const months = ["яну", "фев", "март", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"];
        const quizSessions = relevant
          .filter((s): s is ReinforcementSession => s.type === "reinforcement")
          .sort((a, b) => (a.date + a.started_at) > (b.date + b.started_at) ? -1 : 1);
        if (quizSessions.length > 0) {
          const s = quizSessions[0];
          const [, m, d] = s.date.split("-");
          const dateStr = `${parseInt(d)} ${months[parseInt(m) - 1]}`;
          const correct = s.errors.length > 0 ? s.total - s.errors.length : (s.score ?? s.total);
          const pct = Math.round((correct / s.total) * 100);
          setLastResult({ label: `${dateStr} · ${pct}%`, pct });
        }
      })
      .catch(() => setHasSessions(false));
  }, [user, subject, lesson, run]);

  useEffect(() => {
    const url = run
      ? `/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}&run=${run}`
      : `/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) setAdaptation(data.adaptation);
        else setAdaptationMissing(true);
      })
      .catch(() => setAdaptationMissing(true));
  }, [user, subject, lesson, run]);

  // Test mode: динамичен листинг на файлове и run папки
  useEffect(() => {
    if (!isTest || !user || !subject || !lesson) return;
    const url = run
      ? `/api/lesson-files-list?user=${user}&subject=${subject}&lesson=${lesson}&run=${run}`
      : `/api/lesson-files-list?user=${user}&subject=${subject}&lesson=${lesson}`;
    fetch(url)
      .then((r) => r.json())
      .then((data: { files?: string[]; runs?: string[] }) => {
        setTestFiles(data.files ?? []);
        setTestRuns(data.runs ?? []);
      })
      .catch(() => { /* skip */ });
  }, [isTest, user, subject, lesson, run]);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  function homeUrl() {
    return isTest ? `/${user}?mode=test` : `/${user}`;
  }

  function runOpenUrl(runName: string) {
    const sp = new URLSearchParams();
    sp.set("subject", subject);
    sp.set("lesson", lesson);
    if (title) sp.set("title", title);
    sp.set("mode", "test");
    sp.set("run", runName);
    return `/${user}/confirm?${sp.toString()}`;
  }

  const modules = adaptation?.modules ?? [];
  const totalCards = modules.reduce((sum, m) => sum + m.cards.length, 0);
  const estMin = totalCards > 0 ? Math.round(totalCards * 0.75) : null;

  // Файлове без промптите (промптите са отделна група в panel-а)
  const dataFiles = testFiles.filter((f) => !PROMPT_FILES.includes(f));
  const promptFilesPresent = run
    ? testFiles.filter((f) => PROMPT_FILES.includes(f))
    : PROMPT_FILES; // root mode: винаги показваме трите от src/prompts

  // ZIP включва точно файловете, които са в папката + (в root mode) промптите от src/prompts
  // testFiles вече съдържа промптите в run mode; в root mode добавяме ги в downloadLessonZip
  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="flex-none flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#F0F2F5" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(homeUrl())}
            className="btn-press w-8 h-8 flex items-center justify-center flex-none"
            style={{ opacity: 0.55 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>
            {subjectLabel} · Урок {lesson}
          </h1>
        </div>
        <button
          onClick={() => navigate(homeUrl())}
          className="btn-press w-8 h-8 flex items-center justify-center flex-none"
          style={{ opacity: 0.4 }}
          aria-label="Начало"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>
      </div>

      {/* Test Mode Banner */}
      {isTest && (
        <div className="flex-none mx-4 mb-1 rounded-xl px-3 py-2" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D" }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="btn-press flex items-center gap-1.5 flex-1 text-left"
              aria-expanded={panelOpen}
              aria-label={panelOpen ? "Сгъни test panel" : "Разгъни test panel"}
            >
              <svg
                width="10" height="10" viewBox="0 0 12 12"
                style={{ color: "#92400E", transform: panelOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
                fill="currentColor"
              >
                <path d="M3 1l6 5-6 5V1z" />
              </svg>
              <p className="text-xs font-bold" style={{ color: "#92400E" }}>
                🔧 Test mode{run ? ` · ${run}` : " · Lesson files"}
              </p>
            </button>
            <button
              onClick={() => downloadLessonZip({ user, subject, lesson, run, files: testFiles })}
              className="text-xs px-2 py-0.5 rounded-full font-medium btn-press"
              style={{ backgroundColor: "#92400E", color: "#FEF3C7" }}
            >
              ↓ zip all
            </button>
          </div>

          {panelOpen && (
            <div className="mt-2 flex flex-col gap-2">
              {/* Файлове на урока */}
              {dataFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dataFiles.map((file) => (
                    <a
                      key={file}
                      href={lessonFileUrl(user, subject, lesson, file, run)}
                      download={file}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "#FCD34D", color: "#78350F" }}
                    >
                      {file}
                    </a>
                  ))}
                </div>
              )}

              {/* Промпти */}
              {promptFilesPresent.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {promptFilesPresent.map((name) => (
                    <a
                      key={name}
                      href={promptFileUrl(name, user, subject, lesson, run)}
                      download={name}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "#FDE68A", color: "#78350F" }}
                    >
                      {name}
                    </a>
                  ))}
                </div>
              )}

              {/* Списък run-ове — само в root mode */}
              {!run && testRuns.length > 0 && (
                <div className="pt-1" style={{ borderTop: "1px dashed #FCD34D" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1 mt-1" style={{ color: "#92400E" }}>
                    Runs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {testRuns.map((r) => (
                      <a
                        key={r}
                        href={runOpenUrl(r)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#FFFFFF", color: "#78350F", border: "1px solid #FCD34D" }}
                      >
                        {r} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Карти */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-6" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* 1. Модули карта */}
        {modules.length > 0 && (
          <div className="px-0 pt-1 pb-1">
            {title && (
              <p className="text-base" style={{ color: NAV.text, fontWeight: 600, marginBottom: 20 }}>
                {title}
              </p>
            )}
            {modules.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 py-1.5" style={i < modules.length - 1 ? { borderBottom: "1px solid #E2E5EA" } : undefined}>
                <div
                  className="flex-none w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: MODULE_DOT_COLORS[m.id] ?? NAV.btnSolid }}
                >
                  <span style={{ color: MODULE_DOT_TEXT[m.id] ?? "#1A1A2E", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{m.id}</span>
                </div>
                <p className="text-sm" style={{ color: NAV.text }}>{m.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* 2. Primary action card — Учи урока */}
        {adaptationMissing ? (
          <div className="rounded-xl" style={{ backgroundColor: "#50B8D8", opacity: 0.55, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", bottom: -20, right: 20, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div style={{ padding: "14px 18px", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 800 }}>Учи урока</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Адаптацията не е налична. Сканирай урока отново.
                </p>
              </div>
              <span style={{ color: "#FFFFFF", fontSize: 28, opacity: 0.7, lineHeight: 1, flexShrink: 0 }}>›</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/${user}/lesson/1/1?${params}`)}
            className="tile-press w-full text-left rounded-xl"
            style={{ backgroundColor: "#50B8D8", position: "relative", overflow: "hidden" }}
            type="button"
          >
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", bottom: -20, right: 20, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div style={{ padding: "14px 18px", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 800 }}>Учи урока</p>
                {totalCards > 0 && (
                  <div style={{ display: "inline-flex", backgroundColor: "transparent", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "2px 8px", marginTop: 6 }}>
                    <span style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 600 }}>{totalCards} карти</span>
                  </div>
                )}
              </div>
              <span style={{ color: "#FFFFFF", fontSize: 28, opacity: 0.7, lineHeight: 1, flexShrink: 0 }}>›</span>
            </div>
          </button>
        )}

        {/* 3. Secondary action card — Тест на знанията */}
        {hasSessions && !adaptationMissing ? (
          <button
            onClick={() => navigate(`/${user}/reinforcement/quiz?${params}`)}
            className="tile-press w-full text-left rounded-xl"
            style={{ backgroundColor: NAV.surface }}
            type="button"
          >
            <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p className="font-bold" style={{ color: NAV.text, fontSize: 18 }}>Тест на знанията</p>
                <div style={{ display: "inline-flex", backgroundColor: NAV.border, borderRadius: 20, padding: "2px 8px", marginTop: 4 }}>
                  <span style={{ color: NAV.textMuted, fontSize: 12, fontWeight: 600 }}>10 въпроса</span>
                </div>
              </div>
              <span style={{ color: NAV.textMuted, fontSize: 22, lineHeight: 1, marginLeft: 12 }}>›</span>
            </div>
          </button>
        ) : (
          !adaptationMissing && (
            <div className="rounded-xl" style={{ backgroundColor: NAV.surface, opacity: 0.7, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p className="font-bold" style={{ color: NAV.text, fontSize: 18 }}>Тест на знанията</p>
                  <div style={{ display: "inline-flex", backgroundColor: NAV.border, borderRadius: 20, padding: "2px 8px", marginTop: 4 }}>
                    <span style={{ color: NAV.textMuted, fontSize: 12, fontWeight: 600 }}>10 въпроса · отключва се</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}
