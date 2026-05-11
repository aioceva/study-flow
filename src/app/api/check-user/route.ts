import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/github";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.toLowerCase().trim();
  if (!slug) {
    return NextResponse.json({ exists: false });
  }

  const profile = await readJSON(`users/${slug}/profile.json`);
  return NextResponse.json({ exists: profile !== null });
}
