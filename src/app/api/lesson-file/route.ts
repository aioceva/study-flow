import { NextRequest, NextResponse } from "next/server";
import { readFile, readBinaryFile } from "@/lib/github";

const ALLOWED_EXT = [".json", ".jpg", ".jpeg", ".png", ".webp", ".ts", ".md"];

function contentType(file: string): string {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".ts")) return "text/plain; charset=utf-8";
  if (file.endsWith(".md")) return "text/markdown; charset=utf-8";
  return "application/octet-stream";
}

function isBinary(file: string): boolean {
  return /\.(jpg|jpeg|png|webp)$/i.test(file);
}

// GET /api/lesson-file?user=X&subject=Y&lesson=Z&file=adaptation.json[&run=run_001]
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const subject = searchParams.get("subject");
  const lesson = searchParams.get("lesson");
  const file = searchParams.get("file");
  const run = searchParams.get("run");

  if (!user || !subject || !lesson || !file) {
    return NextResponse.json({ error: "Липсват параметри" }, { status: 400 });
  }

  // Безопасност: без path traversal, само по разширение
  if (file.includes("/") || file.includes("..") || file.startsWith(".")) {
    return NextResponse.json({ error: "Невалидно име" }, { status: 400 });
  }
  if (!ALLOWED_EXT.some((ext) => file.toLowerCase().endsWith(ext))) {
    return NextResponse.json({ error: "Непозволен тип" }, { status: 403 });
  }
  if (run && !/^run_\d{3}$/.test(run)) {
    return NextResponse.json({ error: "Невалиден run" }, { status: 400 });
  }

  const basePath = `users/${user}/adaptations/${subject}/lesson-${lesson}`;
  const path = run ? `${basePath}/${run}/${file}` : `${basePath}/${file}`;

  if (isBinary(file)) {
    const result = await readBinaryFile(path);
    if (!result) {
      return NextResponse.json({ error: "Файлът не съществува" }, { status: 404 });
    }
    const ab = result.data.buffer.slice(
      result.data.byteOffset,
      result.data.byteOffset + result.data.byteLength
    ) as ArrayBuffer;
    return new NextResponse(ab, {
      headers: {
        "Content-Type": contentType(file),
        "Content-Disposition": `attachment; filename="${file}"`,
      },
    });
  }

  const result = await readFile(path);
  if (!result) {
    return NextResponse.json({ error: "Файлът не съществува" }, { status: 404 });
  }

  return new NextResponse(result.content, {
    headers: {
      "Content-Type": contentType(file),
      "Content-Disposition": `attachment; filename="${file}"`,
    },
  });
}
