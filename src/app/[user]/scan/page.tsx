"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, startTransition } from "react";
import { NAV } from "@/types";
import Link from "next/link";

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
    img.onerror = (err) => { URL.revokeObjectURL(url); reject(err); };
    img.src = url;
  });
}

type RecognizeResult = {
  subject: string;
  subject_bg: string;
  lesson: number;
  title: string;
  confidence: "high" | "medium" | "low";
};

export default function ScanPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<"high" | "medium" | "low" | null>(null);
  const [recognizeResult, setRecognizeResult] = useState<RecognizeResult | null>(null);

  function navigate(url: string) {
    setTimeout(() => startTransition(() => router.push(url)), 150);
  }

  function navigateToLoading(result: RecognizeResult) {
    const paramsObj: Record<string, string> = {
      subject: result.subject,
      subject_bg: result.subject_bg,
      lesson: String(result.lesson),
      title: result.title,
      confidence: result.confidence,
    };
    if (mode === "test") paramsObj.mode = "test";
    navigate(`/${user}/loading?${new URLSearchParams(paramsObj)}`);
  }

  function openCamera() {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  function handleRetake() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setQuality(null);
    setRecognizeResult(null);
    openCamera();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setQuality(null);
    setRecognizeResult(null);
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
    checkQuality(f);
  }

  async function checkQuality(f: File) {
    setRecognizing(true);
    setError(null);

    try {
      const { blob, base64, type } = await compressImage(f);
      sessionStorage.setItem("scan_image_base64", base64);
      sessionStorage.setItem("scan_image_type", type);

      const formData = new FormData();
      formData.append("image", new File([blob], "lesson.jpg", { type }));

      const res = await fetch("/api/recognize", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok || result.error) throw new Error(result.error ?? "Грешка при разпознаване");

      setQuality(result.confidence);
      setRecognizeResult(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неуспешно разпознаване";
      setError(`${msg}. Опитай отново с по-ясна снимка.`);
    } finally {
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
        <Link
          href={`/${user}`}
          aria-label="Начало"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
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

        {quality === "low" && (
          <div className="rounded-xl p-4 mt-3" style={{ backgroundColor: NAV.surface }}>
            <p className="text-base font-semibold" style={{ color: NAV.text }}>Не се вижда добре</p>
            <p className="text-sm mt-1" style={{ color: NAV.textMuted }}>Снимай отново</p>
          </div>
        )}

        {quality === "medium" && (
          <div className="rounded-xl p-4 mt-3" style={{ backgroundColor: NAV.surface }}>
            <p className="text-base font-semibold" style={{ color: NAV.text }}>Става, но снимката може да е по-ясна</p>
            <p className="text-sm mt-1" style={{ color: NAV.textMuted }}>Можеш да снимаш отново</p>
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
        <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        {!preview ? (
          <button
            onClick={openCamera}
            className="btn-press w-full rounded-xl py-3.5 text-white font-medium text-base flex items-center justify-center gap-2"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            <span>📷</span>
            Снимай
          </button>
        ) : quality === "low" ? (
          <button
            onClick={handleRetake}
            className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: NAV.btnSolid }}
          >
            Снимай отново
          </button>
        ) : quality === "medium" ? (
          <>
            <button
              onClick={() => recognizeResult && navigateToLoading(recognizeResult)}
              className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: NAV.btnSolid }}
            >
              Продължи →
            </button>
            <button
              onClick={handleRetake}
              className="btn-press w-full rounded-xl py-3 font-medium text-base"
              style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
            >
              Снимай отново
            </button>
          </>
        ) : quality === "high" ? (
          <>
            <button
              onClick={() => recognizeResult && navigateToLoading(recognizeResult)}
              className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: NAV.btnSolid }}
            >
              Използвай тази снимка →
            </button>
            <button
              onClick={handleRetake}
              className="btn-press w-full rounded-xl py-3 font-medium text-base"
              style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
            >
              Снимай отново
            </button>
          </>
        ) : (
          <>
            <button
              disabled
              className="btn-press w-full rounded-xl py-3.5 text-white font-semibold text-sm flex items-center justify-center gap-2 opacity-60"
              style={{ backgroundColor: NAV.btnSolid }}
            >
              Проверявам снимката...
            </button>
            <button
              onClick={handleRetake}
              className="btn-press w-full rounded-xl py-3 font-medium text-base"
              style={{ backgroundColor: NAV.surface, color: NAV.textMuted }}
            >
              Снимай отново
            </button>
          </>
        )}
      </div>
    </div>
  );
}
