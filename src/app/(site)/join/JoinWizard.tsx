"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = {
  btnSolid: "#4A6FA5",
  surface: "#F0F2F5",
  bg: "#FFFFFF",
  text: "#4A6FA5",
  textMuted: "#5A6A7E",
  border: "#E2E5EA",
};

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const P: React.CSSProperties = { fontSize: 15, color: NAV.textMuted, lineHeight: 1.65, margin: 0 };
const LABEL: React.CSSProperties = { fontSize: 13, color: NAV.textMuted, fontWeight: 500, display: "block", marginBottom: 8 };

export function JoinWizard() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = name.trim().length > 0 && grade !== "" && email.trim().length > 0 && agreed && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), grade, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Грешка при изпращане. Опитайте отново.");
        return;
      }
      setDone(true);
    } catch {
      setError("Грешка при свързване. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div
        style={{
          backgroundColor: NAV.bg,
          fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div
            className="flex flex-col gap-6"
            style={{ textAlign: "center", alignItems: "center" }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#E8F9F1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              ✓
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: NAV.text, marginBottom: 12 }}
              >
                Заявката е изпратена
              </h1>
              <p style={{ ...P, marginBottom: 10 }}>
                Благодарим. Ще ви пишем по имейл при първа възможност.
              </p>
              <p style={{ ...P }}>
                Ако детето бъде включено, ще получите линк за достъп до приложението.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block rounded-xl px-7 py-3 text-white font-medium"
              style={{ backgroundColor: NAV.btnSolid, fontSize: 15 }}
            >
              Към началото →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: NAV.bg,
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Back link */}
        <Link
          href="/"
          style={{ fontSize: 14, color: NAV.textMuted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 36 }}
        >
          ← Към началото
        </Link>

        {/* Header */}
        <h1
          className="text-xl font-bold"
          style={{ color: NAV.text, marginBottom: 10 }}
        >
          Присъедини се към пилота
        </h1>
        <p style={{ ...P, marginBottom: 6 }}>
          Ще създадем профил за твоето дете и ще ти изпратим личен линк по имейл.
        </p>
        <p style={{ ...P, marginBottom: 36 }}>
          След записване ще получиш имейл с адреса, на който детето може да влезе и да започне да използва приложението.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Ime na deteto */}
          <div>
            <label style={LABEL}>Име на детето</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Димитър"
              autoComplete="off"
              style={{
                width: "100%",
                fontSize: 15,
                padding: "12px 16px",
                borderRadius: 12,
                backgroundColor: NAV.surface,
                color: NAV.text,
                border: `1px solid ${NAV.border}`,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Klas */}
          <div>
            <label style={LABEL}>Клас</label>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className="btn-press rounded-xl"
                  style={{
                    padding: "8px 14px",
                    fontSize: 15,
                    backgroundColor: grade === g ? NAV.btnSolid : NAV.surface,
                    color: grade === g ? "#FFFFFF" : NAV.text,
                    border: grade === g ? `1px solid ${NAV.btnSolid}` : `1px solid ${NAV.border}`,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={LABEL}>Имейл на родителя</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              autoComplete="email"
              style={{
                width: "100%",
                fontSize: 15,
                padding: "12px 16px",
                borderRadius: 12,
                backgroundColor: NAV.surface,
                color: NAV.text,
                border: `1px solid ${NAV.border}`,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Terms checkbox */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              fontSize: 14,
              color: NAV.textMuted,
              lineHeight: 1.55,
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: NAV.btnSolid }}
            />
            <span>
              Съгласен/съгласна съм с{" "}
              <Link
                href="/terms?from=join"
                target="_blank"
                style={{ color: NAV.text, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                условията за участие
              </Link>
            </span>
          </label>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 14, color: "#EF4444", margin: 0 }}>{error}</p>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-press w-full rounded-xl py-4 text-white font-medium"
              style={{
                backgroundColor: NAV.btnSolid,
                fontSize: 15,
                opacity: canSubmit ? 1 : 0.4,
              }}
            >
              {loading ? "Изпращаме..." : "Създай достъп"}
            </button>
            <p style={{ fontSize: 13, color: NAV.textMuted, textAlign: "center", margin: 0 }}>
              Данните се използват само за този пилот и няма да бъдат споделяни.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
