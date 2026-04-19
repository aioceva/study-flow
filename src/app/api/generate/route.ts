import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { generatePrompt, promptSet } from "@/prompts";
import { readJSON, writeJSON, writeBinaryFile } from "@/lib/github";
import type { Adaptation } from "@/types";

function validateAdaptation(obj: unknown): obj is Adaptation {
  if (!obj || typeof obj !== "object") return false;
  const a = obj as Record<string, unknown>;
  if (!a.meta || typeof a.meta !== "object") return false;
  const meta = a.meta as Record<string, unknown>;
  if (!meta.user || !meta.subject || meta.lesson === undefined || !meta.generated || !meta.title)
    return false;
  if (!Array.isArray(a.modules) || a.modules.length === 0) return false;
  for (const mod of a.modules as unknown[]) {
    if (!mod || typeof mod !== "object") return false;
    const m = mod as Record<string, unknown>;
    if (!m.id || !m.title || !m.color || !Array.isArray(m.cards) || m.cards.length === 0)
      return false;
    for (const card of m.cards as unknown[]) {
      if (!card || typeof card !== "object") return false;
      const c = card as Record<string, unknown>;
      if (!c.id || !c.title || !c.what || !c.why || !c.example) return false;
    }
  }
  return true;
}

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
    const mode = formData.get("mode") as string | null;
    const isTestMode = mode === "test";

    if (!file || !subject || !lesson || !user) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    // Проверка: общ лимит от 10 адаптации за пилота (пропуска се в test mode)
    const indexResult = await readJSON<{ subject: string; lesson: number }[]>(
      `users/${user}/adaptations/_index.json`
    );
    if (!isTestMode) {
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
    }

    // Проверка: max 5 генерации на ден (per-user) — пропуска се в test mode
    const today = new Date().toISOString().split("T")[0];
    const ratePath = `users/${user}/rate-limit.json`;
    const rateFile = await readJSON<{ date: string; count: number }>(ratePath);
    const todayCount = rateFile?.data.date === today ? rateFile.data.count : 0;
    if (!isTestMode && todayCount >= MAX_PER_DAY) {
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

    const parsed = JSON.parse(jsonMatch[0]);
    if (!validateAdaptation(parsed)) {
      console.error("Invalid adaptation structure from Claude:", JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json({ error: "Неуспешно генериране — невалидна структура" }, { status: 422 });
    }
    const adaptation: typeof parsed = {
      ...parsed,
      meta: { ...parsed.meta, prompt_set: promptSet },
    };

    // Записваме per-user брояча за деня (пропуска се в test mode)
    if (!isTestMode) {
      await writeJSON(ratePath, { date: today, count: todayCount + 1 }, rateFile?.sha);
    }

    // Записваме оригиналната снимка (фоново — не блокира при грешка)
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
    if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mediaType)) {
      const imgPath = `users/${user}/adaptations/${subject}/lesson-${lesson}/original.jpg`;
      writeBinaryFile(imgPath, base64).catch((err) =>
        console.error("Original image save failed (non-blocking):", err)
      );
    }

    return NextResponse.json(adaptation);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}
