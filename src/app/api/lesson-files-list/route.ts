import { NextRequest, NextResponse } from "next/server";
import { listDirectory } from "@/lib/github";

// GET /api/lesson-files-list?user=X&subject=Y&lesson=Z[&run=run_001]
// Връща списък с файлове и run папки за даден lesson или run.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const subject = searchParams.get("subject");
  const lesson = searchParams.get("lesson");
  const run = searchParams.get("run");

  if (!user || !subject || !lesson) {
    return NextResponse.json({ error: "Липсват параметри" }, { status: 400 });
  }

  if (run && !/^run_\d{3}$/.test(run)) {
    return NextResponse.json({ error: "Невалиден run" }, { status: 400 });
  }

  const basePath = `users/${user}/adaptations/${subject}/lesson-${lesson}`;
  const targetPath = run ? `${basePath}/${run}` : basePath;

  const items = await listDirectory(targetPath);
  const files = items.filter((i) => i.type === "file").map((i) => i.name);
  const runs = run
    ? []
    : items
        .filter((i) => i.type === "dir" && /^run_\d{3}$/.test(i.name))
        .map((i) => i.name)
        .sort();

  return NextResponse.json({ files, runs });
}
