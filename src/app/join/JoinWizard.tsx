"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { NAV } from "@/types";

const COLOR_OPTIONS = [
  { label: "Топло жълто", value: "#FEFCE8", emoji: "☀️" },
  { label: "Светло синьо", value: "#EBF4FF", emoji: "🩵" },
  { label: "Светло зелено", value: "#F0FDF4", emoji: "🌿" },
  { label: "Бяло", value: "#FFFFFF", emoji: "⬜" },
];

const GRADES = ["5", "6", "7", "8", "9", "10", "11", "12"];

type Step = "welcome" | "data" | "color" | "done";

export function JoinWizard({ enrolled, limit }: { enrolled: number; limit: number }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [color, setColor] = useState("#FFFFFF");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isFull = enrolled >= limit;

  async function handleSubmit() {
    if (!name.trim() || !grade) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), grade, readingColor: color }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Грешка при записване");
        setLoading(false);
        return;
      }
      setSlug(data.slug);
      setStep("done");
    } catch {
      setError("Грешка при свързване. Опитай отново.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function goToApp() {
    setTimeout(() => startTransition(() => router.push(`/${slug}`)), 150);
  }

  // ── Welcome ─────────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
          <div className="text-5xl">📚</div>
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: NAV.text }}>
              Участие в пилотна употреба на Study Flow
            </h1>
            <p className="text-sm" style={{ color: NAV.textMuted }}>
              Помагаме на деца с дислексия да учат по-лесно.
            </p>
          </div>
          <div
            className="rounded-xl px-5 py-3"
            style={{ backgroundColor: NAV.surface }}
          >
            <p className="text-sm" style={{ color: NAV.textMuted }}>
              Включени: <span style={{ color: NAV.text }}>{enrolled} от {limit} деца</span>
            </p>
          </div>
        </div>
        <div className="flex-none px-6 pb-10">
          <button
            onClick={() => setStep("data")}
            disabled={isFull}
            className="btn-press w-full rounded-xl py-4 text-white text-base"
            style={{ backgroundColor: isFull ? NAV.border : NAV.btnSolid }}
          >
            {isFull ? "Местата са запълнени" : "Запиши се →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Data ────────────────────────────────────────────────────────────────────
  if (step === "data") {
    return (
      <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
        <div className="flex-none flex items-center px-4 py-3">
          <button
            onClick={() => setStep("welcome")}
            className="btn-press w-8 h-8 flex items-center justify-center"
            style={{ opacity: 0.55 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold ml-2" style={{ color: NAV.text }}>Данни за детето</h1>
        </div>

        <div className="flex-1 px-6 pt-4 space-y-6">
          <div>
            <p className="text-sm mb-2" style={{ color: NAV.textMuted }}>Как се казва детето?</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Димитър"
              className="w-full rounded-xl px-4 py-3 text-base"
              style={{
                backgroundColor: NAV.surface,
                color: NAV.text,
                border: `1px solid ${NAV.border}`,
                outline: "none",
              }}
            />
          </div>

          <div>
            <p className="text-sm mb-2" style={{ color: NAV.textMuted }}>В кой клас е?</p>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className="btn-press rounded-xl px-4 py-2 text-base"
                  style={{
                    backgroundColor: grade === g ? NAV.btnSolid : NAV.surface,
                    color: grade === g ? "#FFFFFF" : NAV.text,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-none px-6 pb-10">
          <button
            onClick={() => setStep("color")}
            disabled={!name.trim() || !grade}
            className="btn-press w-full rounded-xl py-4 text-white text-base"
            style={{ backgroundColor: NAV.btnSolid, opacity: (!name.trim() || !grade) ? 0.4 : 1 }}
          >
            Напред →
          </button>
        </div>
      </div>
    );
  }

  // ── Color ───────────────────────────────────────────────────────────────────
  if (step === "color") {
    return (
      <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
        <div className="flex-none flex items-center px-4 py-3">
          <button
            onClick={() => setStep("data")}
            className="btn-press w-8 h-8 flex items-center justify-center"
            style={{ opacity: 0.55 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold ml-2" style={{ color: NAV.text }}>Предпочитан фон</h1>
        </div>

        <div className="flex-1 px-6 pt-4 space-y-4">
          <p className="text-sm" style={{ color: NAV.textMuted }}>Кой фон е най-удобен за четене?</p>

          <div className="grid grid-cols-2 gap-3">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setColor(opt.value)}
                className="btn-press rounded-xl p-4 flex flex-col items-center gap-2"
                style={{
                  backgroundColor: opt.value,
                  border: color === opt.value ? `2px solid ${NAV.btnSolid}` : `2px solid ${NAV.border}`,
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm" style={{ color: NAV.text }}>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: color, border: `1px solid ${NAV.border}` }}
          >
            <p className="text-sm" style={{ color: NAV.text }}>
              Примерен текст от учебник. Буквите се четат лесно на този фон.
            </p>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
          )}
        </div>

        <div className="flex-none px-6 pb-10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-press w-full rounded-xl py-4 text-white text-base"
            style={{ backgroundColor: NAV.btnSolid, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Записваме..." : "Готово →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  const appUrl = typeof window !== "undefined" ? `${window.location.origin}/${slug}` : `/${slug}`;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="text-5xl">✓</div>
        <div>
          <h1 className="text-xl font-bold mb-2" style={{ color: NAV.text }}>
            Готово, {name}!
          </h1>
          <p className="text-sm" style={{ color: NAV.textMuted }}>Твоят личен линк:</p>
        </div>

        <button
          onClick={copyLink}
          className="btn-press w-full rounded-xl px-4 py-3 text-base"
          style={{ backgroundColor: NAV.surface, color: NAV.text }}
        >
          {copied ? "✓ Копирано!" : appUrl}
        </button>

        <div
          className="rounded-xl px-4 py-3 w-full text-left"
          style={{ backgroundColor: "#FEF9C3" }}
        >
          <p className="text-sm" style={{ color: "#92400E" }}>
            ⚠️ Запази го — това е начинът да влезеш отново
          </p>
        </div>
      </div>

      <div className="flex-none px-6 pb-10">
        <button
          onClick={goToApp}
          className="btn-press w-full rounded-xl py-4 text-white text-base"
          style={{ backgroundColor: NAV.btnSolid }}
        >
          Към урока →
        </button>
      </div>
    </div>
  );
}
