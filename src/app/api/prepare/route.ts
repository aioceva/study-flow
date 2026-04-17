import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { preparePrompt } from "@/prompts/prepare";
import { writeJSON } from "@/lib/github";

type ConceptEntry = { concept: string; importance: "key" | "secondary" };
type PrepareResult = { concept_map: ConceptEntry[] };

function extractJSON(text: string): object | null {
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/,
    /```\s*([\s\S]*?)\s*```/,
    /(\{[\s\S]*\})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        continue;
      }
    }
  }
  return null;
}

function validateResult(obj: unknown): obj is PrepareResult {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  if (!Array.isArray(r.concept_map) || r.concept_map.length === 0) return false;
  for (const entry of r.concept_map) {
    if (!entry || typeof entry !== "object") return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.concept !== "string") return false;
    if (e.importance !== "key" && e.importance !== "secondary") return false;
  }
  return true;
}

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const user = formData.get("user") as string;
    const subject = formData.get("subject") as string;
    const lesson = formData.get("lesson") as string;
    const imageQuality = formData.get("image_quality") as string;

    if (!file || !user || !subject || !lesson) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: preparePrompt },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const result = extractJSON(text);

    if (!result || !validateResult(result)) {
      console.error("Prepare Claude response:", text);
      return NextResponse.json({ error: "Неуспешно извличане на концепти" }, { status: 422 });
    }

    const basePath = `users/${user}/adaptations/${subject}/lesson-${lesson}`;
    const context = {
      meta: {
        user,
        subject,
        lesson: parseInt(lesson),
        generated_at: new Date().toISOString(),
        version: "1.0",
      },
      image_quality: imageQuality || "high",
      concept_map: result.concept_map,
    };

    await writeJSON(`${basePath}/adaptation-context.json`, context);

    return NextResponse.json({ concept_map: result.concept_map });
  } catch (err) {
    console.error("Prepare error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
