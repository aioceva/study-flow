"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MODULE_COLORS } from "@/types";

export default function SeparatorPage() {
  const { user } = useParams<{ user: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = parseInt(searchParams.get("from") ?? "1");
  const to = parseInt(searchParams.get("to") ?? "2");
  const params = searchParams.toString();

  const bgColor = MODULE_COLORS[to] ?? "#F8F9FA";

  function goNext() {
    router.push(`/${user}/lesson/${to}/1?${params}`);
  }

  function goPrev() {
    router.push(`/${user}/lesson/${from}/5?${params}`);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ backgroundColor: bgColor }}
    >
      <div className="text-5xl mb-6">✓</div>
      <h2 className="text-2xl font-bold mb-2">Модул {from} готов!</h2>
      <p className="text-lg text-gray-600 mb-12">Започваме Модул {to}</p>

      {/* Модул индикатори */}
      <div className="flex gap-3 mb-12">
        {[1, 2, 3, 4].map((m) => (
          <div
            key={m}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: m <= from ? "#22C55E" : m === to ? "#4F8EF7" : "#E5E7EB",
              color: m <= from || m === to ? "white" : "#9CA3AF",
            }}
          >
            {m <= from ? "✓" : m}
          </div>
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={goPrev}
          className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-bold text-gray-500"
        >
          ←
        </button>
        <button
          onClick={goNext}
          className="flex-1 h-12 rounded-2xl text-white font-bold text-base"
          style={{ backgroundColor: "#4F8EF7" }}
        >
          Започни Модул {to} →
        </button>
      </div>
    </div>
  );
}
