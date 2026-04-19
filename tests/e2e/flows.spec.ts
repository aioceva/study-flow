import { test, expect } from "@playwright/test";
import adaptationFixture from "./fixtures/adaptation.json";
import quizFixture from "./fixtures/quiz.json";

const USER = "bobi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockAdaptationList(page: import("@playwright/test").Page) {
  return page.route("**/api/adaptation?user=bobi", (route) =>
    route.fulfill({
      json: {
        lessons: [
          { subject: "bio", lesson: 5, title: "Фотосинтеза", savedAt: "2026-04-01T10:00:00Z" },
        ],
      },
    })
  );
}

function mockSessions(page: import("@playwright/test").Page, sessions = []) {
  return page.route(`**/api/session?user=${USER}`, (route) =>
    route.fulfill({ json: { meta: { user: USER }, sessions } })
  );
}

function mockAdaptationDetail(page: import("@playwright/test").Page) {
  return page.route("**/api/adaptation?user=bobi&subject=bio&lesson=5", (route) =>
    route.fulfill({
      json: { exists: true, adaptation: adaptationFixture, quiz: quizFixture },
    })
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("Test 1: Home page renders and shows lesson card", async ({ page }) => {
  await mockAdaptationList(page);
  await mockSessions(page);

  await page.goto(`/${USER}`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(`Здравей, Bobi!`)).toBeVisible();
  await expect(page.getByText("Фотосинтеза")).toBeVisible();
});

test("Test 2: Confirm page renders lesson start card", async ({ page }) => {
  await mockSessions(page);
  await mockAdaptationDetail(page);

  await page.goto(`/${USER}/confirm?subject=bio&lesson=5&title=${encodeURIComponent("Фотосинтеза")}`);

  await expect(page.getByText("Биология · Урок 5")).toBeVisible();
  // Play button — SVG polygon (triangle) inside the start card
  await expect(page.locator('polygon[points="6,3 20,12 6,21"]')).toBeVisible();
});

test("Test 3: Quiz page renders question and reacts to answer", async ({ page }) => {
  // Seed sessionStorage before page load
  await page.addInitScript((quiz) => {
    sessionStorage.setItem("quiz", JSON.stringify(quiz));
  }, quizFixture);

  await page.goto(`/${USER}/reinforcement/quiz?subject=bio&lesson=5`);

  // First question visible
  await expect(page.getByText("Въпрос 1")).toBeVisible();

  // Click first answer — any of the option buttons
  const firstOption = page.locator("button").filter({ hasText: /^[a-cа-в]\./i }).first();
  await firstOption.click();

  // After answering, buttons become disabled (phase change)
  await expect(firstOption).toBeDisabled();
});

test("Test 4: Parent dashboard renders without crash", async ({ page }) => {
  await page.goto(`/${USER}/parent`);

  // Page renders the heading — even with empty sessions it should show
  await expect(page.getByRole("heading", { name: /Дневник/i })).toBeVisible();
});
