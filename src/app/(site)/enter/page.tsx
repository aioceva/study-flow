"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const NAV = {
  btnSolid: "#4A6FA5",
  surface: "#F0F2F5",
  bg: "#FFFFFF",
  text: "#4A6FA5",
  textMuted: "#5A6A7E",
  border: "#E2E5EA",
};

function EnterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get("mode") === "test";
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = name.toLowerCase().trim();
  const canSubmit = slug.length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/check-user?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.exists) {
        router.push(`/${slug}${isTestMode ? "?mode=test" : ""}`);
      } else {
        setError(
          `Не намерихме акаунт с името "${name.trim()}". Проверете дали името на латиница се изписва точно така.`
        );
      }
    } catch {
      setError("Грешка при свързване. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: NAV.bg,
        fontFamily: "'Adys', 'OpenDyslexic', Arial, sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😊</div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: NAV.text,
              margin: 0,
            }}
          >
            Добре дошли!
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label
            style={{
              fontSize: 15,
              color: NAV.textMuted,
              lineHeight: 1.65,
              display: "block",
            }}
          >
            За да влезнете в приложението въведете на латиница първото име на детето:
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Например: dodo"
            autoComplete="off"
            autoCapitalize="none"
            style={{
              width: "100%",
              fontSize: 16,
              padding: "13px 16px",
              borderRadius: 14,
              backgroundColor: NAV.surface,
              color: NAV.text,
              border: error ? "1.5px solid #EF4444" : `1px solid ${NAV.border}`,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ fontSize: 14, color: "#EF4444", margin: 0, lineHeight: 1.55 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-press w-full rounded-2xl py-4 text-white font-medium"
            style={{
              backgroundColor: NAV.btnSolid,
              fontSize: 16,
              opacity: canSubmit ? 1 : 0.4,
              border: "none",
              cursor: canSubmit ? "pointer" : "default",
            }}
          >
            {loading ? "Търсим..." : "Влез →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EnterPage() {
  return (
    <Suspense>
      <EnterForm />
    </Suspense>
  );
}
