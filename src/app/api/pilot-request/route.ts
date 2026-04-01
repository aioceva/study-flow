import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";

interface PilotRequest {
  name: string;
  grade: string;
  email: string;
  requestedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, grade, email } = await req.json();

    if (!name?.trim() || !grade || !email?.trim()) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const result = await readJSON<PilotRequest[]>("pilot/requests.json");
    const requests = result?.data ?? [];

    const requestedAt = new Date().toISOString().split("T")[0];
    const updated: PilotRequest[] = [
      ...requests,
      { name: name.trim(), grade, email: email.trim(), requestedAt },
    ];

    await writeJSON("pilot/requests.json", updated, result?.sha);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Pilot request error:", err);
    return NextResponse.json({ error: "Грешка при записване" }, { status: 500 });
  }
}
