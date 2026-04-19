import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";
import { Adaptation, Quiz } from "@/types";

interface IndexEntry {
  subject: string;
  lesson: number;
  title: string;
  savedAt: string;
}

// GET /api/adaptation?user=bobi               → списък на всички адаптации
// GET /api/adaptation?user=bobi&subject=math&lesson=14 → конкретна адаптация
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const subject = searchParams.get("subject");
  const lesson = searchParams.get("lesson");

  if (!user) {
    return NextResponse.json({ error: "Липсва user" }, { status: 400 });
  }

  // Листване на всички адаптации за потребителя
  if (!subject || !lesson) {
    const index = await readJSON<IndexEntry[]>(`users/${user}/adaptations/_index.json`);
    return NextResponse.json({ lessons: index?.data ?? [] });
  }

  const basePath = `users/${user}/adaptations/${subject}/lesson-${lesson}`;

  const [adaptationResult, quizResult] = await Promise.all([
    readJSON<Adaptation>(`${basePath}/adaptation.json`),
    readJSON<Quiz>(`${basePath}/quiz.json`),
  ]);

  if (!adaptationResult || !quizResult) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({
    exists: true,
    adaptation: adaptationResult.data,
    quiz: quizResult.data,
  });
}

// POST /api/adaptation — записва adaptation.json и quiz.json
export async function POST(req: NextRequest) {
  try {
    const { user, subject, lesson, adaptation, quiz, image_quality } = await req.json();

    if (!user || !subject || !lesson || !adaptation) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const basePath = `users/${user}/adaptations/${subject}/lesson-${lesson}`;

    await writeJSON(`${basePath}/adaptation.json`, adaptation);
    if (quiz) {
      await writeJSON(`${basePath}/quiz.json`, quiz);
    }
    if (image_quality) {
      await writeJSON(`${basePath}/adaptation-context.json`, {
        meta: {
          user,
          subject,
          lesson: parseInt(lesson),
          generated_at: new Date().toISOString(),
          version: "1.0",
          prompt_set: (adaptation as Adaptation).meta?.prompt_set,
        },
        image_quality,
      });
    }

    // Актуализираме индекса
    const indexPath = `users/${user}/adaptations/_index.json`;
    const existing = await readJSON<IndexEntry[]>(indexPath);
    const entries: IndexEntry[] = existing?.data ?? [];
    const filtered = entries.filter(
      (e) => !(e.subject === subject && String(e.lesson) === String(lesson))
    );
    const newEntry: IndexEntry = {
      subject,
      lesson: parseInt(lesson),
      title: (adaptation as Adaptation).meta?.title ?? "",
      savedAt: new Date().toISOString(),
    };
    await writeJSON(indexPath, [...filtered, newEntry], existing?.sha);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Adaptation save error:", err);
    return NextResponse.json({ error: "Грешка при запис" }, { status: 500 });
  }
}
