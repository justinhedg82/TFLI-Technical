import { test, expect } from '@playwright/test';

// Placeholder smoke test.
//
// Why this file exists: it has no relation to the actual interview spec
// (which hasn't been provided yet) - it only proves the Playwright install,
// config, and browser binaries are wired up correctly before we write real
// tests. Delete this file once real spec-based tests are added, or keep it
// around as a quick "is my setup broken?" sanity check.
test('playwright.dev homepage has the expected title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Title assertion is a simple, low-flake way to confirm the browser
  // launched, navigated, and Playwright's assertion/retry logic works.
  await expect(page).toHaveTitle(/Playwright/);
});
