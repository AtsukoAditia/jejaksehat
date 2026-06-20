import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "narrow-mobile",
      use: {
        viewport: { width: 320, height: 700 },
        userAgent: devices["Pixel 5"].userAgent,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "pixel-5",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
