import { NextRequest, NextResponse } from "next/server";
import { listDirectory, copyFile, deleteFile } from "@/lib/github";

// POST /api/restore-lesson — връща архивирани файлове от run_NNN обратно в lesson root
export async function POST(req: NextRequest) {
  try {
    const { user, subject, lesson, runFolder } = await req.json();

    if (!user || !subject || !lesson || !runFolder) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const lessonRoot = `users/${user}/adaptations/${subject}/lesson-${lesson}`;
    const runPath = `${lessonRoot}/${runFolder}`;

    const items = await listDirectory(runPath);
    const files = items.filter((i) => i.type === "file");

    for (const file of files) {
      const fromPath = `${runPath}/${file.name}`;
      const toPath = `${lessonRoot}/${file.name}`;
      try {
        await copyFile(fromPath, toPath);
        await deleteFile(fromPath, file.sha);
      } catch (err) {
        console.error(`Restore failed for ${file.name}:`, err);
      }
    }

    return NextResponse.json({ restored: true });
  } catch (err) {
    console.error("Restore lesson error:", err);
    return NextResponse.json({ error: "Грешка при възстановяване" }, { status: 500 });
  }
}
