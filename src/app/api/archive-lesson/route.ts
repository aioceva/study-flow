import { NextRequest, NextResponse } from "next/server";
import { listDirectory, copyFile, deleteFile } from "@/lib/github";

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

    return NextResponse.json({ archived: true, runFolder });
  } catch (err) {
    console.error("Archive lesson error:", err);
    return NextResponse.json({ error: "Грешка при архивиране" }, { status: 500 });
  }
}
