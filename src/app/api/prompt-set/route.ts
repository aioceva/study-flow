import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { promptSet } from "@/prompts";

const PROMPT_FILES = ["generate.ts", "quiz.ts", "recognize.ts", "prepare.ts"];

export async function GET() {
  const dir = join(process.cwd(), "src", "prompts", promptSet);
  const files: Record<string, string> = {};

  for (const file of PROMPT_FILES) {
    try {
      files[file] = readFileSync(join(dir, file), "utf-8");
    } catch {
      // файлът може да не съществува в конкретния prompt set
    }
  }

  return NextResponse.json(
    { promptSet, files },
    { headers: { "Content-Disposition": `attachment; filename="prompt-set-${promptSet}.json"` } }
  );
}
