"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Adaptation } from "@/types";

export default function LoadingPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);

  const subject = searchParams.get("subject") ?? "";
  const subjectBg = searchParams.get("subject_bg") ?? "";
  const lesson = searchParams.get("lesson") ?? "0";
  const title = searchParams.get("title") ?? "";

  const [status, setStatus] = useState<"checking" | "generating" | "quiz" | "done" | "cached" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    try {
      // Стъпка 1: Проверяваме кеша
      setStatus("checking");
      const cacheRes = await fetch(
        `/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`
      );
      const cacheData = await cacheRes.json();

      if (cacheData.exists) {
        // Заредено от кеш — без нови AI calls
        setStatus("cached");
        sessionStorage.setItem("adaptation", JSON.stringify(cacheData.adaptation));
        sessionStorage.setItem("quiz", JSON.stringify(cacheData.quiz));
        setTimeout(() => navigateToConfirm(), 1200);
        return;
      }

      // Стъпка 2: Генерираме адаптация
      setStatus("generating");
      const imageBase64 = sessionStorage.getItem("scan_image_base64");
      const imageType = sessionStorage.getItem("scan_image_type") ?? "image/jpeg";

      if (!imageBase64) {
        setError("Снимката липсва. Моля сканирай отново.");
        setStatus("error");
        return;
      }

      // Конвертираме base64 обратно към File
      const byteArray = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: imageType });
      const imageFile = new File([blob], "lesson.jpg", { type: imageType });

      const genFormData = new FormData();
      genFormData.append("image", imageFile);
      genFormData.append("subject", subject);
      genFormData.append("subject_bg", subjectBg);
      genFormData.append("lesson", lesson);
      genFormData.append("title", title);
      genFormData.append("user", user);

      const genRes = await fetch("/api/generate", { method: "POST", body: genFormData });
      if (genRes.status === 429) {
        const data = await genRes.json();
        setError(data.error ?? "Лимитът за сканиране е достигнат. Опитай утре.");
        setStatus("error");
        return;
      }
      if (!genRes.ok) throw new Error("Грешка при генериране на адаптация");
      const adaptation: Adaptation = await genRes.json();

      sessionStorage.setItem("adaptation", JSON.stringify(adaptation));

      // Стъпка 3: Генерираме quiz (фоново — не блокира)
      setStatus("quiz");
      fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adaptation }),
      })
        .then((r) => r.json())
        .then((quiz) => {
          sessionStorage.setItem("quiz", JSON.stringify(quiz));
          // Записваме и двата файла в GitHub
          fetch("/api/adaptation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, subject, lesson, adaptation, quiz }),
          });
        })
        .catch(() => {
          // Quiz грешка не блокира потребителя — ще се пробва пак
          console.error("Quiz generation failed");
        });

      // Стъпка 4: Записваме адаптацията (без quiz — той е фонов)
      setStatus("done");
      setTimeout(() => navigateToConfirm(), 500);
    } catch (err) {
      console.error(err);
      setError("Нещо се обърка. Опитай отново.");
      setStatus("error");
    }
  }

  function navigateToConfirm() {
    const params = new URLSearchParams({ subject, subject_bg: subjectBg, lesson, title });
    router.replace(`/${user}/confirm?${params}`);
  }

  const messages: Record<typeof status, string> = {
    checking: "Проверяваме дали си учил това...",
    generating: "Подготвяме твоя урок...",
    quiz: "Финални щрихи...",
    done: "Готово!",
    cached: "Намерихме твоя урок! ✓",
    error: error ?? "Грешка",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {status !== "error" ? (
        <>
          <div className="text-6xl mb-8 animate-bounce">📚</div>
          <h1 className="text-2xl font-bold mb-4">{messages[status]}</h1>
          {status === "generating" && (
            <p className="text-gray-500">Изчакай около 30 секунди.</p>
          )}
          {/* Прогрес индикатор */}
          <div className="mt-8 flex gap-2">
            {(["checking", "generating", "quiz", "done"] as const).map((s, i) => {
              const steps = ["checking", "generating", "quiz", "done", "cached"];
              const currentIdx = steps.indexOf(status);
              const stepIdx = i;
              return (
                <div
                  key={s}
                  className="w-3 h-3 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      status === "cached" || stepIdx <= currentIdx ? "#4F8EF7" : "#E5E7EB",
                  }}
                />
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="text-6xl mb-8">😔</div>
          <h1 className="text-2xl font-bold mb-4">Нещо се обърка</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button
            onClick={() => router.back()}
            className="py-3 px-8 rounded-2xl text-white font-bold"
            style={{ backgroundColor: "#4F8EF7" }}
          >
            Опитай отново
          </button>
        </>
      )}
    </main>
  );
}
