import { NextRequest, NextResponse } from "next/server";
import { listDirectory, copyFile, deleteFile, readJSON, writeJSON } from "@/lib/github";
import type { Adaptation } from "@/types";

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

    // Добавяме записа обратно в индекса
    const indexPath = `users/${user}/adaptations/_index.json`;
    const adaptation = await readJSON<Adaptation>(`${lessonRoot}/adaptation.json`);
    if (adaptation) {
      const existing = await readJSON<{ subject: string; lesson: number; title: string; savedAt: string }[]>(indexPath);
      const entries = existing?.data ?? [];
      const filtered = entries.filter(
        (e) => !(e.subject === subject && String(e.lesson) === String(lesson))
      );
      await writeJSON(indexPath, [...filtered, {
        subject,
        lesson: parseInt(lesson),
        title: adaptation.data.meta?.title ?? "",
        savedAt: new Date().toISOString(),
      }], existing?.sha);
    }

    return NextResponse.json({ restored: true });
  } catch (err) {
    console.error("Restore lesson error:", err);
    return NextResponse.json({ error: "Грешка при възстановяване" }, { status: 500 });
  }
}
