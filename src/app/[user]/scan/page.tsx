"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Преоразмерява и компресира снимката до макс 1600px
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function handleRecognize() {
    if (!file) return;
    setRecognizing(true);
    setError(null);

    try {
      // Компресираме снимката преди изпращане
      const { blob, base64, type } = await compressImage(file);

      // Запазваме компресираната снимка в sessionStorage за loading страницата
      sessionStorage.setItem("scan_image_base64", base64);
      sessionStorage.setItem("scan_image_type", type);

      // Изпращаме за разпознаване
      const formData = new FormData();
      formData.append("image", new File([blob], "lesson.jpg", { type }));

      const res = await fetch("/api/recognize", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error ?? "Грешка при разпознаване");
      }

      const params = new URLSearchParams({
        subject: result.subject,
        subject_bg: result.subject_bg,
        lesson: String(result.lesson),
        title: result.title,
        confidence: result.confidence,
      });
      router.push(`/${user}/loading?${params}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неуспешно разпознаване";
      setError(`${msg}. Опитай отново с по-ясна снимка.`);
      setRecognizing(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <button onClick={() => router.back()} className="text-2xl text-gray-400">←</button>
        <h1 className="text-xl font-bold">Сканирай урок</h1>
      </div>

      {!preview && (
        <div className="rounded-2xl p-5 mb-6 text-base space-y-2" style={{ backgroundColor: "#E8F4FD" }}>
          <p className="font-bold">Как да снимаш:</p>
          <p>📄 Сложи учебника на равна, светла повърхност</p>
          <p>💡 Уверете се, че има достатъчно светлина</p>
          <p>📐 Снимай право отгоре, без наклон</p>
          <p>🔍 Цялата страница трябва да се вижда</p>
        </div>
      )}

      {preview && (
        <div className="mb-6 rounded-2xl overflow-hidden border-2 border-blue-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Снимка на урок" className="w-full object-contain max-h-80" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-4 mb-4 text-red-700 font-bold" style={{ backgroundColor: "#FEE2E2" }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        {!preview ? (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-5 rounded-2xl text-white text-xl font-bold flex items-center justify-center gap-3"
              style={{ backgroundColor: "#4F8EF7" }}
            >
              <span className="text-2xl">📷</span>
              Снимай
            </button>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </>
        ) : (
          <>
            <button
              onClick={handleRecognize}
              disabled={recognizing}
              className="w-full py-5 rounded-2xl text-white text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-60"
              style={{ backgroundColor: "#22C55E" }}
            >
              {recognizing ? (
                <><span className="animate-spin">⏳</span> Разпознавам...</>
              ) : (
                <><span>✓</span> Използвай тази снимка</>
              )}
            </button>
            <button
              onClick={() => { setPreview(null); setFile(null); inputRef.current?.click(); }}
              disabled={recognizing}
              className="w-full py-3 rounded-2xl text-gray-600 font-bold border-2 border-gray-200 disabled:opacity-60"
            >
              Снимай отново
            </button>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </>
        )}
      </div>
    </main>
  );
}
