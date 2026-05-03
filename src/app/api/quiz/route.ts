import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";

export const maxDuration = 120;
import { Adaptation, Quiz } from "@/types";
import { quizPrompt } from "@/prompts/quiz";
import { sanitizeJsonFromLLM } from "@/lib/json-sanitize";

function validateQuiz(obj: unknown): obj is Quiz {
  if (!obj || typeof obj !== "object") return false;
  const q = obj as Record<string, unknown>;
  if (!q.meta || typeof q.meta !== "object") return false;
  if (!Array.isArray(q.questions) || q.questions.length === 0) return false;
  for (const item of q.questions as unknown[]) {
    if (!item || typeof item !== "object") return false;
    const qu = item as Record<string, unknown>;
    if (
      qu.id === undefined ||
      qu.module_id === undefined ||
      qu.card_id === undefined ||
      !qu.question ||
      !Array.isArray(qu.options) ||
      qu.options.length === 0
    )
      return false;
  }
  return true;
}

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { adaptation } = (await req.json()) as { adaptation: Adaptation };

    if (!adaptation) {
      return NextResponse.json({ error: "Липсва адаптация" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: quizPrompt(adaptation, today),
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Quiz: no JSON in response. stop_reason:", response.stop_reason, "text[:200]:", text.slice(0, 200));
      return NextResponse.json({ error: "Неуспешно генериране на quiz" }, { status: 422 });
    }

    const rawJson = sanitizeJsonFromLLM(jsonMatch[0]);
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e1) {
      console.warn("Quiz: JSON.parse(sanitized) failed:", String(e1));
      try {
        parsed = JSON.parse(jsonrepair(rawJson));
        console.warn("Quiz: repaired sanitized JSON ok. stop_reason:", response.stop_reason);
      } catch {
        try {
          parsed = JSON.parse(jsonrepair(jsonMatch[0]));
          console.warn("Quiz: repaired original JSON ok. stop_reason:", response.stop_reason);
        } catch (e3) {
          console.error("Quiz: all strategies failed. stop_reason:", response.stop_reason, "len:", rawJson.length, "err:", String(e3), "tail[-200]:", rawJson.slice(-200));
          return NextResponse.json({ error: "Неуспешно генериране на quiz — невалиден JSON" }, { status: 422 });
        }
      }
    }
    if (!validateQuiz(parsed)) {
      console.error("Invalid quiz structure from Claude:", JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json({ error: "Неуспешно генериране на quiz — невалидна структура" }, { status: 422 });
    }
    const quiz: typeof parsed = {
      ...parsed,
      meta: { ...parsed.meta },
    };
    return NextResponse.json(quiz);
  } catch (err) {
    console.error("Quiz error:", err);
    return NextResponse.json({ error: "Грешка при генериране на quiz" }, { status: 500 });
  }
}
