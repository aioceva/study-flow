import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/github";

interface Profile {
  name: string;
  grade: string;
  readingSupport: string;
  joinedAt: string;
}

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const result = await readJSON<Profile>(`users/${user}/profile.json`);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result.data);
}
