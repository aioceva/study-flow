"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { MODULE_COLORS } from "@/types";
import { nextStep, prevStep, nextButtonLabel } from "@/lib/navigation";

export default function LessonLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useParams<{ user: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const segments = pathname.split("/").filter(Boolean);
  const isCardPage =
    segments.length === 4 &&
    !isNaN(parseInt(segments[2])) &&
    !isNaN(parseInt(segments[3]));

  if (!isCardPage) return <>{children}</>;

  const moduleId = parseInt(segments[2]);
  const cardId = parseInt(segments[3]);
  const params = searchParams.toString();
  const isReview = searchParams.get("mode") === "review";
  const bgColor = MODULE_COLORS[moduleId] ?? "#F8F9FA";
  const isFirst = moduleId === 1 && cardId === 1;

  function navigate(url: string) {
    startTransition(() => {
      router.push(url);
    });
  }

  return (
    <div
      className="flex flex-col"
      style={{ backgroundColor: bgColor, height: "100dvh", transition: "background-color 0.3s ease" }}
    >
      {/* Navbar — не се прерисува */}
      <nav className="flex-none flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm">
        <button
          onClick={() => navigate(`/${user}`)}
          className="w-8 h-8 flex items-center justify-center text-gray-500 text-lg"
        >
          🏠
        </button>

        <div className="flex gap-3 flex-1 justify-center">
          {[1, 2, 3, 4].map((m) => (
            <button
              key={m}
              onClick={() => navigate(`/${user}/lesson/${m}/1?${params}`)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2"
              style={{
                backgroundColor: MODULE_COLORS[m],
                borderColor: "#D1D5DB",
                color: "#374151",
              }}
            >
              {m}
              {m < moduleId && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-white flex items-center justify-center"
                  style={{ backgroundColor: "#22C55E", fontSize: "7px", color: "white" }}
                >
                  ✓
                </span>
              )}
              {m === moduleId && (
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#4F8EF7" }}
                />
              )}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-500 font-bold w-10 text-right">
          {cardId}/5
        </span>
      </nav>

      {/* Съдържание — остарялото се задържа докато новото е готово */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ opacity: isPending ? 0.4 : 1, transition: "opacity 0.15s ease" }}
      >
        {children}
      </div>

      {/* Бутони — не се прерисуват */}
      <div className="flex-none flex gap-3 px-5 py-4 bg-white/50 backdrop-blur-sm">
        {!isFirst && (
          <button
            onClick={() => navigate(prevStep(user, moduleId, cardId, params))}
            disabled={isPending}
            className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-bold text-gray-500 disabled:opacity-50"
          >
            ←
          </button>
        )}
        <button
          onClick={() => navigate(nextStep(user, moduleId, cardId, params))}
          disabled={isPending}
          className="flex-1 h-12 rounded-2xl text-white font-bold text-base disabled:opacity-50"
          style={{ backgroundColor: "#4F8EF7" }}
        >
          {nextButtonLabel(moduleId, cardId, isReview)}
        </button>
      </div>
    </div>
  );
}
