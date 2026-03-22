import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";
import { UserProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { user, message, screen } = await req.json();

    if (!user || !message?.trim()) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    // Опционално: вземи name/grade от profile.json
    const profile = await readJSON<UserProfile>(`users/${user}/profile.json`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `pilot/feedback/${timestamp}-${user}.json`;

    await writeJSON(filename, {
      user,
      name: profile?.data?.name ?? user,
      grade: profile?.data?.grade ?? "",
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      screen: screen ?? "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Грешка" }, { status: 500 });
  }
}
