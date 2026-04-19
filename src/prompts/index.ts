import { readdirSync } from "fs";
import { join } from "path";

// Finds exactly one folder containing "_active" in prompts/ and returns its name.
// Throws a descriptive error if 0 or more than 1 are found.
function resolvePromptSet(): string {
  const dir = join(process.cwd(), "src", "prompts");
  let activeFolders: string[];
  try {
    activeFolders = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.includes("_active"))
      .map((d) => d.name);
  } catch (e) {
    const msg = `Грешка: Не може да се прочете директория prompts/ (${dir})`;
    console.error(msg, e);
    throw new Error(msg);
  }

  if (activeFolders.length === 0) {
    const msg =
      'Грешка: Няма папка с "_active" в prompts/. Преименувайте активния промпт сет да съдържа "_active".';
    console.error(msg);
    throw new Error(msg);
  }
  if (activeFolders.length > 1) {
    const msg = `Грешка: Намерени са ${activeFolders.length} папки с "_active": ${activeFolders.join(", ")}. Трябва да има точно една.`;
    console.error(msg);
    throw new Error(msg);
  }

  return activeFolders[0];
}

// The name of the active prompt set — included in meta of all generated files.
// To switch prompt sets: create a new dated folder with "_active", rename the old one
// (remove "_active"), and update the re-export paths below.
export const promptSet = resolvePromptSet();

// Static re-exports from the active prompt set folder.
// Update these four paths when switching to a new prompt set.
export { generatePrompt } from "./2026-04-19_active/generate";
export { preparePrompt } from "./2026-04-19_active/prepare";
export { quizPrompt } from "./2026-04-19_active/quiz";
export { recognizePrompt } from "./2026-04-19_active/recognize";
