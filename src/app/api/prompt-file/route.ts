import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const ALLOWED = new Set(["generate.ts", "quiz.ts", "recognize.ts"]);

// GET /api/prompt-file?name=generate.ts
// Връща локален prompt файл от src/prompts/ като download (root mode).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name || !ALLOWED.has(name)) {
    return NextResponse.json({ error: "Непозволен файл" }, { status: 400 });
  }

  try {
    const content = readFileSync(join(process.cwd(), "src", "prompts", name), "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Файлът не съществува" }, { status: 404 });
  }
}
