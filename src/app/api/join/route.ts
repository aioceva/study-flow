import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/github";
import { Enrollment } from "@/types";

const BG_TO_LATIN: Record<string, string> = {
  "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e",
  "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l",
  "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s",
  "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "ts", "ч": "ch",
  "ш": "sh", "щ": "sht", "ъ": "a", "ь": "", "ю": "yu", "я": "ya",
};

function transliterate(name: string): string {
  return name
    .toLowerCase()
    .split("")
    .map((ch) => BG_TO_LATIN[ch] ?? (/[a-z0-9]/.test(ch) ? ch : ""))
    .join("");
}

// GET /api/join — enrolled count
export async function GET() {
  const result = await readJSON<Enrollment>("pilot/enrollment.json");
  const enrollment = result?.data ?? { limit: 20, enrolled: 0, participants: [] };
  return NextResponse.json({ enrolled: enrollment.enrolled, limit: enrollment.limit });
}

// POST /api/join — register new child
export async function POST(req: NextRequest) {
  try {
    const { name, grade, readingColor } = await req.json();

    if (!name?.trim() || !grade) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const enrollmentResult = await readJSON<Enrollment>("pilot/enrollment.json");
    const enrollment = enrollmentResult?.data ?? { limit: 20, enrolled: 0, participants: [] };

    if (enrollment.enrolled >= enrollment.limit) {
      return NextResponse.json(
        { error: "Лимитът от 20 деца е достигнат. Свържете се с Анни Йоцева." },
        { status: 429 }
      );
    }

    // Generate unique slug
    const baseSlug = transliterate(name.trim()) || "user";
    const existingSlugs = new Set(enrollment.participants.map((p) => p.user));
    let slug = baseSlug;
    let counter = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}${counter++}`;
    }

    const joinedAt = new Date().toISOString().split("T")[0];

    const updatedEnrollment: Enrollment = {
      ...enrollment,
      enrolled: enrollment.enrolled + 1,
      participants: [
        ...enrollment.participants,
        { user: slug, name: name.trim(), grade, joinedAt },
      ],
    };

    await Promise.all([
      writeJSON(`users/${slug}/profile.json`, {
        name: name.trim(),
        grade,
        readingColor: readingColor ?? "#FFFFFF",
        joinedAt,
      }),
      writeJSON("pilot/enrollment.json", updatedEnrollment, enrollmentResult?.sha),
    ]);

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json({ error: "Грешка при записване" }, { status: 500 });
  }
}
