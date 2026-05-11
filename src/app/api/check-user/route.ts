import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/github";
import { Enrollment } from "@/types";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.toLowerCase().trim();
  if (!slug) {
    return NextResponse.json({ exists: false });
  }

  const result = await readJSON<Enrollment>("pilot/enrollment.json");
  const participants = result?.data?.participants ?? [];
  const exists = participants.some((p) => p.user === slug);

  return NextResponse.json({ exists });
}
