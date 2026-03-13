import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";
import { Adaptation, Quiz } from "@/types";

// GET /api/adaptation?user=bobi&subject=math&lesson=14
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const subject = searchParams.get("subject");
  const lesson = searchParams.get("lesson");

  if (!user || !subject || !lesson) {
    return NextResponse.json({ error: "Липсват параметри" }, { status: 400 });
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
    const { user, subject, lesson, adaptation, quiz } = await req.json();

    if (!user || !subject || !lesson || !adaptation) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const basePath = `users/${user}/adaptations/${subject}/lesson-${lesson}`;

    await writeJSON(`${basePath}/adaptation.json`, adaptation);
    if (quiz) {
      await writeJSON(`${basePath}/quiz.json`, quiz);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Adaptation save error:", err);
    return NextResponse.json({ error: "Грешка при запис" }, { status: 500 });
  }
}
