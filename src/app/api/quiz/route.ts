import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Adaptation } from "@/types";
import { quizPrompt } from "@/prompts/quiz";

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

    const quiz = JSON.parse(jsonMatch[0]);
    return NextResponse.json(quiz);
  } catch (err) {
    console.error("Quiz error:", err);
    return NextResponse.json({ error: "Грешка при генериране на quiz" }, { status: 500 });
  }
}
