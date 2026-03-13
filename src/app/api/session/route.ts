import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";
import { Sessions, Session } from "@/types";

// POST /api/session — записва сесия
export async function POST(req: NextRequest) {
  try {
    const { user, session }: { user: string; session: Session } = await req.json();

    if (!user || !session) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const path = `users/${user}/sessions/sessions.json`;
    const existing = await readJSON<Sessions>(path);

    if (existing) {
      existing.data.sessions.push(session);
      await writeJSON(path, existing.data, existing.sha);
    } else {
      const newSessions: Sessions = {
        meta: { user },
        sessions: [session],
      };
      await writeJSON(path, newSessions);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session save error:", err);
    return NextResponse.json({ error: "Грешка при запис на сесия" }, { status: 500 });
  }
}

// GET /api/session?user=bobi
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");

  if (!user) {
    return NextResponse.json({ error: "Липсва user" }, { status: 400 });
  }

  const path = `users/${user}/sessions/sessions.json`;
  const result = await readJSON<Sessions>(path);

  if (!result) {
    return NextResponse.json({ meta: { user }, sessions: [] });
  }

  return NextResponse.json(result.data);
}
