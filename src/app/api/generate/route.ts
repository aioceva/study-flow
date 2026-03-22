import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { generatePrompt } from "@/prompts/generate";
import { readJSON, writeJSON } from "@/lib/github";

const client = new Anthropic();
const MAX_PER_DAY = 5;
const MAX_TOTAL = 10;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const subject = formData.get("subject") as string;
    const subjectBg = formData.get("subject_bg") as string;
    const lesson = formData.get("lesson") as string;
    const title = formData.get("title") as string;
    const user = formData.get("user") as string;

    if (!file || !subject || !lesson || !user) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    // Проверка: общ лимит от 10 адаптации за пилота
    const indexResult = await readJSON<{ subject: string; lesson: number }[]>(
      `users/${user}/adaptations/_index.json`
    );
    const adaptationCount = (indexResult?.data ?? []).length;
    if (adaptationCount >= MAX_TOTAL) {
      return NextResponse.json(
        {
          error:
            "Достигна лимита от 10 урока за пилота. Свържете се с Анни Йоцева за следващите стъпки.",
        },
        { status: 429 }
      );
    }

    // Проверка: max 5 генерации на ден (per-user)
    const today = new Date().toISOString().split("T")[0];
    const ratePath = `users/${user}/rate-limit.json`;
    const rateFile = await readJSON<{ date: string; count: number }>(ratePath);
    const todayCount = rateFile?.data.date === today ? rateFile.data.count : 0;
    if (todayCount >= MAX_PER_DAY) {
      return NextResponse.json(
        { error: `Достигна лимита от ${MAX_PER_DAY} урока за днес. Опитай утре.` },
        { status: 429 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

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

    // Записваме per-user брояча за деня
    await writeJSON(ratePath, { date: today, count: todayCount + 1 }, rateFile?.sha);

    return NextResponse.json(adaptation);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}
