import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";
import { UserProfile } from "@/types";
import { READING_THEMES } from "@/types/themes";

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const result = await readJSON<UserProfile>(`users/${user}/profile.json`);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result.data);
}

export async function PATCH(req: NextRequest) {
  try {
    const user = req.nextUrl.searchParams.get("user");
    if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });

    const { readingTheme } = await req.json();
    if (!readingTheme || !READING_THEMES[readingTheme]) {
      return NextResponse.json({ error: "Invalid readingTheme" }, { status: 400 });
    }

    const result = await readJSON<UserProfile>(`users/${user}/profile.json`);

    if (result) {
      await writeJSON(
        `users/${user}/profile.json`,
        { ...result.data, readingTheme },
        result.sha,
      );
    } else {
      await writeJSON(`users/${user}/profile.json`, {
        name: user,
        grade: "",
        readingColor: "#FFFFFF",
        readingTheme,
        joinedAt: "",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Грешка при записване" }, { status: 500 });
  }
}
