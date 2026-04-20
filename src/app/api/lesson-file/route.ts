import { NextRequest, NextResponse } from "next/server";
import { readFile, readBinaryFile } from "@/lib/github";

const ALLOWED_FILES = [
  "adaptation.json",
  "quiz.json",
  "adaptation-context.json",
  "adaptation-thinking.json",
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

  if (file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png")) {
    const result = await readBinaryFile(path);
    if (!result) {
      return NextResponse.json({ error: "Файлът не съществува" }, { status: 404 });
    }
    // Buffer → ArrayBuffer за NextResponse (BodyInit не приема Buffer директно)
    const ab = result.data.buffer.slice(
      result.data.byteOffset,
      result.data.byteOffset + result.data.byteLength
    ) as ArrayBuffer;
    return new NextResponse(ab, {
      headers: {
        "Content-Type": file.endsWith(".png") ? "image/png" : "image/jpeg",
        "Content-Disposition": `attachment; filename="${file}"`,
      },
    });
  }

  const result = await readFile(path);
  if (!result) {
    return NextResponse.json({ error: "Файлът не съществува" }, { status: 404 });
  }

  const json = JSON.parse(result.content);
  return NextResponse.json(json, {
    headers: { "Content-Disposition": `attachment; filename="${file}"` },
  });
}
