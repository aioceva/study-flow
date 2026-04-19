import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: isCI ? "chromium-mobile" : "webkit-iphone",
      use: isCI
        ? { ...devices["Pixel 5"] }          // Chromium — надежден на Linux CI
        : { ...devices["iPhone 14"] },        // WebKit — локално
    },
  ],
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 60000,
  },
});
