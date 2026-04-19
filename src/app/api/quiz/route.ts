import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Adaptation, Quiz } from "@/types";
import { quizPrompt, promptSet } from "@/prompts";

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
      max_tokens: 4096,
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
      return NextResponse.json({ error: "Неуспешно генериране на quiz" }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!validateQuiz(parsed)) {
      console.error("Invalid quiz structure from Claude:", JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json({ error: "Неуспешно генериране на quiz — невалидна структура" }, { status: 422 });
    }
    const quiz: typeof parsed = {
      ...parsed,
      meta: { ...parsed.meta, prompt_set: promptSet },
    };
    return NextResponse.json(quiz);
  } catch (err) {
    console.error("Quiz error:", err);
    return NextResponse.json({ error: "Грешка при генериране на quiz" }, { status: 500 });
  }
}
