import { NextRequest, NextResponse } from "next/server";
import { readFile } from "@/lib/github";

const ALLOWED_FILES = [
  "adaptation.json",
  "quiz.json",
  "adaptation-context.json",
  "original.jpg",
  "quality-check.json",
];

// GET /api/lesson-file?user=X&subject=Y&lesson=Z&file=adaptation.json
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const subject = searchParams.get("subject");
  const lesson = searchParams.get("lesson");
  const file = searchParams.get("file");

  if (!user || !subject || !lesson || !file) {
    return NextResponse.json({ error: "Липсват параметри" }, { status: 400 });
  }

  if (!ALLOWED_FILES.includes(file)) {
    return NextResponse.json({ error: "Непозволен файл" }, { status: 403 });
  }

  const path = `users/${user}/adaptations/${subject}/lesson-${lesson}/${file}`;
  const result = await readFile(path);

  if (!result) {
    return NextResponse.json({ error: "Файлът не съществува" }, { status: 404 });
  }

  if (file.endsWith(".json")) {
    const json = JSON.parse(result.content);
    return NextResponse.json(json);
  }

  // За binary файлове (original.jpg) — връщаме base64
  return NextResponse.json({ base64: Buffer.from(result.content).toString("base64") });
}
