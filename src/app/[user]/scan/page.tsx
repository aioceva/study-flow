"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState, startTransition } from "react";
import { NAV } from "@/types";
import { FeedbackButton } from "@/components/FeedbackButton";

async function compressImage(file: File): Promise<{ blob: Blob; base64: string; type: string }> {
  const MAX_SIZE = 1600;
  const QUALITY = 0.85;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(",")[1];
            resolve({ blob, base64, type: "image/jpeg" });
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        QUALITY
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ScanPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }

  async function handleRecognize() {
    if (!file) return;
    setRecognizing(true);
    setError(null);

    try {
      const { blob, base64, type } = await compressImage(file);
      sessionStorage.setItem("scan_image_base64", base64);
      sessionStorage.setItem("scan_image_type", type);

      const formData = new FormData();
      formData.append("image", new File([blob], "lesson.jpg", { type }));

      const res = await fetch("/api/recognize", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok || result.error) throw new Error(result.error ?? "Грешка при разпознаване");

      const params = new URLSearchParams({
        subject: result.subject,
        subject_bg: result.subject_bg,
        lesson: String(result.lesson),
        title: result.title,
        confidence: result.confidence,
      });
      navigate(`/${user}/loading?${params}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неуспешно разпознаване";
      setError(`${msg}. Опитай отново с по-ясна снимка.`);
      setRecognizing(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: NAV.bg }}>

      {/* Хедър */}
      <div className="flex-none flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${user}`)}
            className="btn-press w-8 h-8 flex items-center justify-center"
            style={{ opacity: 0.5 }}
            aria-label="Назад"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold" style={{ color: NAV.text }}>Сканирай урок</h1>
        </div>
        <FeedbackButton user={user} />
      </div>

      {/* Съдържание */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-2">
        {!preview ? (
          <div className="rounded-xl p-4 space-y-2 text-sm" style={{ backgroundColor: NAV.surface }}>
            <p className="font-bold text-sm" style={{ color: NAV.text }}>Как да снимаш:</p>
            <p style={{ color: NAV.textMuted }}>📄 Сложи учебника на равна, светла повърхност</p>
            <p style={{ color: NAV.textMuted }}>💡 Увери се, че има достатъчно светлина</p>
            <p style={{ color: NAV.textMuted }}>📐 Снимай право отгоре, без наклон</p>
            <p style={{ color: NAV.textMuted }}>🔍 Цялата страница трябва да се вижда</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `2px solid ${NAV.border}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Снимка на урок" className="w-full object-contain max-h-72" />
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 mt-3 text-sm font-semibold" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
            {error}
          </div>
        )}
      </div>

      {/* Footer с бутони */}
      <div className="flex-none px-4 pb-6 pt-3 space-y-2">
        {!preview ? (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="btn-press w-full rounded-xl py-3.5 text-white font-medium text-base flex items-center justify-center gap-2"
              style={{ backgroundColor: NAV.btnSolid }}
            >
              <span>📷</span>
              Снимай
            </button>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </>
        ) : (
          <>
            <button
              onClick={handleRecognize}
              disabled={recognizing}
              className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: NAV.btnSolid }}
            >
              {recognizing ? "Разпознавам..." : "Използвай тази снимка →"}
            </button>
            <button
              onClick={() => { setPreview(null); setFile(null); inputRef.current?.click(); }}
              disabled={recognizing}
              className="btn-press w-full rounded-xl py-3 font-medium text-base disabled:opacity-60"
              style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
            >
              Снимай отново
            </button>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </>
        )}
      </div>
    </div>
  );
}
