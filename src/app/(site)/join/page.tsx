import { readJSON } from "@/lib/github";
import { Enrollment } from "@/types";
import { JoinWizard } from "./JoinWizard";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const result = await readJSON<Enrollment>("pilot/enrollment.json");
  const enrollment = result?.data ?? { limit: 20, enrolled: 0, participants: [] };

  return <JoinWizard enrolled={enrollment.enrolled} limit={enrollment.limit} />;
}
