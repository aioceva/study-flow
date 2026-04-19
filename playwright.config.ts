import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  expect: { timeout: 15000 },
  projects: [
    {
      name: isCI ? "chromium-mobile" : "webkit-iphone",
      use: isCI
        ? { ...devices["Pixel 5"], baseURL: "http://localhost:3000" }
        : { ...devices["iPhone 14"], baseURL: "http://localhost:3000" },
    },
  ],
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
});
