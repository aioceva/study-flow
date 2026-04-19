import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    ...devices["iPhone 14"],
  },
  webServer: {
    // В CI: next start (срещу production build)
    // Локално: next dev (по-бърз старт, hot reload)
    command: isCI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
});
