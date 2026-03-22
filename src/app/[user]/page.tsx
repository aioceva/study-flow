import { redirect } from "next/navigation";
import { readJSON } from "@/lib/github";
import UserHome from "./UserHome";

export const dynamic = "force-dynamic";

export default async function UserPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;

  // Check if profile.json exists (pilot-enrolled users)
  const profile = await readJSON(`users/${user}/profile.json`);
  if (!profile) {
    // Allow existing users (e.g. Bobi) who have sessions but no profile.json
    const sessions = await readJSON(`users/${user}/sessions/sessions.json`);
    if (!sessions) {
      redirect("/join");
    }
  }

  return <UserHome />;
}
