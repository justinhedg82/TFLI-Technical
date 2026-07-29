import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright Test config for the TFLI technical interview suite.
 * See https://playwright.dev/docs/test-configuration.
 *
 * Notes specific to this project (commercialexperts.com is a real, live
 * site, not a local app under test):
 *
 * - All three engines (chromium, firefox, webkit) are enabled below so the
 *   suite covers cross-browser behaviour, not just Chrome.
 * - `workers: 1` everywhere, not just on CI. The brief is explicit about
 *   not hammering the target site's infrastructure and about pacing
 *   requests like a real user - running multiple browser sessions against
 *   the same live funnel concurrently would work against that, even though
 *   there are currently only two spec files.
 * - `headless: true` is set explicitly (rather than just relying on the
 *   Playwright default) since headless was specifically asked for; use
 *   `npm run test:headed` when you want to watch a run locally.
 * - Chromium's project below sets a desktop Chrome user agent. Playwright's
 *   headless Chromium otherwise reports "HeadlessChrome" in its UA string,
 *   and this site's WAF 403s that outright (confirmed by comparing against
 *   a plain curl request with a normal browser UA, which got a 200).
 *   Firefox and WebKit don't have this problem - their default headless UAs
 *   already look like ordinary browsers - so the override is Chromium-only.
 */
export default defineConfig({
  testDir: './tests',
  // These journeys are deliberately paced like a human (thinking pauses,
  // real per-character typing) across ~9-13 steps each on a real site over
  // the network, so they legitimately take longer than the 30s default.
  timeout: 90_000,
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  // Deliberately serial - see the note above about not hammering a live site.
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    headless: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // See the WAF note above - without this override every Chromium
        // request to commercialexperts.com gets a 403.
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
