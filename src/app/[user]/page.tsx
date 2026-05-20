import { redirect } from "next/navigation";
import { readJSON } from "@/lib/github";
import UserHome from "./UserHome";
import { UserProfile } from "@/types";
import { DEFAULT_THEME } from "@/types/themes";

export const dynamic = "force-dynamic";

export default async function UserPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;
  let readingTheme = DEFAULT_THEME;

  if (!process.env.E2E_SKIP_AUTH) {
    const profile = await readJSON<UserProfile>(`users/${user}/profile.json`);
    if (!profile) {
      const sessions = await readJSON(`users/${user}/sessions/sessions.json`);
      if (!sessions) {
        redirect("/join");
      }
    } else {
      readingTheme = profile.data.readingTheme ?? DEFAULT_THEME;
    }
  }

  return <UserHome readingTheme={readingTheme} />;
}
