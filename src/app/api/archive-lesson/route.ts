import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { listDirectory, copyFile, deleteFile, readJSON, writeJSON, writeFile } from "@/lib/github";

export const maxDuration = 60;

// POST /api/archive-lesson — архивира текущите lesson файлове в следващата run_NNN папка
export async function POST(req: NextRequest) {
  try {
    const { user, subject, lesson } = await req.json();

    if (!user || !subject || !lesson) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const lessonRoot = `users/${user}/adaptations/${subject}/lesson-${lesson}`;

    const items = await listDirectory(lessonRoot);
    const files = items.filter((i) => i.type === "file");
    const runDirs = items
      .filter((i) => i.type === "dir" && /^run_\d{3}$/.test(i.name))
      .map((i) => parseInt(i.name.split("_")[1]));

    const nextNum = runDirs.length > 0 ? Math.max(...runDirs) + 1 : 1;
    const runFolder = `run_${String(nextNum).padStart(3, "0")}`;

    for (const file of files) {
      const fromPath = `${lessonRoot}/${file.name}`;
      const toPath = `${lessonRoot}/${runFolder}/${file.name}`;
      try {
        await copyFile(fromPath, toPath);
        await deleteFile(fromPath, file.sha);
      } catch (err) {
        // Продължаваме при грешка на отделен файл — не спираме целия процес
        console.error(`Archive failed for ${file.name}:`, err);
      }
    }

    // Записваме snapshot на prompt файловете в run папката
    await Promise.all(
      ["generate.ts", "quiz.ts", "recognize.ts"].map(async (name) => {
        try {
          const content = await fs.readFile(
            path.join(process.cwd(), "src", "prompts", name),
            "utf-8"
          );
          await writeFile(`${lessonRoot}/${runFolder}/${name}`, content);
        } catch (err) {
          console.error(`Prompt snapshot failed for ${name}:`, err);
        }
      })
    );

    // Маhаме записа от индекса — адаптацията вече не е в root папката
    const indexPath = `users/${user}/adaptations/_index.json`;
    const existing = await readJSON<{ subject: string; lesson: number; title: string; savedAt: string }[]>(indexPath);
    if (existing) {
      const filtered = existing.data.filter(
        (e) => !(e.subject === subject && String(e.lesson) === String(lesson))
      );
      await writeJSON(indexPath, filtered, existing.sha);
    }

    return NextResponse.json({ archived: true, runFolder });
  } catch (err) {
    console.error("Archive lesson error:", err);
    return NextResponse.json({ error: "Грешка при архивиране" }, { status: 500 });
  }
}
