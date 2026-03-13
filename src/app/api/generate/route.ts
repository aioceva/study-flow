import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { generatePrompt } from "@/prompts/generate";
import { readJSON, writeJSON } from "@/lib/github";

const client = new Anthropic();
const RATE_LIMIT_PATH = "rate-limit.json";
const HOURS_24 = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    // Проверка: max 1 генерация на 24 часа
    const rateFile = await readJSON<{ last_generated: string }>(RATE_LIMIT_PATH);
    if (rateFile) {
      const elapsed = Date.now() - new Date(rateFile.data.last_generated).getTime();
      if (elapsed < HOURS_24) {
        const hoursLeft = Math.ceil((HOURS_24 - elapsed) / 3600000);
        return NextResponse.json(
          { error: `Можеш да сканираш 1 урок на 24 часа. Опитай след ${hoursLeft}ч.` },
          { status: 429 }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    const subject = formData.get("subject") as string;
    const subjectBg = formData.get("subject_bg") as string;
    const lesson = formData.get("lesson") as string;
    const title = formData.get("title") as string;
    const user = formData.get("user") as string;

    if (!file || !subject || !lesson) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

    const today = new Date().toISOString().split("T")[0];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: generatePrompt({ subjectBg, lesson, title, user, subject, today }),
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Неуспешно генериране" }, { status: 422 });
    }

    const adaptation = JSON.parse(jsonMatch[0]);

    // Записваме timestamp на генерацията
    await writeJSON(RATE_LIMIT_PATH, { last_generated: new Date().toISOString() }, rateFile?.sha);

    return NextResponse.json(adaptation);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}
