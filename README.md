# TFLI Technical Interview - Playwright Test Suite

End-to-end tests for the TFLI technical interview, written with
[Playwright Test](https://playwright.dev/) and TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (tested with Node 22)
- npm (comes bundled with Node)

## Setup

1. Install project dependencies (Playwright Test + TypeScript types):

   ```bash
   npm install
   ```

2. Download the browser binaries Playwright drives (Chromium, Firefox, WebKit).
   This is a separate step from `npm install` because the browsers are large
   binaries, not npm packages:

   ```bash
   npx playwright install
   ```

## Running the tests

Run the full suite headlessly (all three browsers, as configured in
`playwright.config.ts`):

```bash
npm test
```

Other useful scripts (see `package.json`):

| Command               | What it does                                                      |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run test:headed`  | Runs tests with visible browser windows instead of headless mode  |
| `npm run test:ui`      | Opens Playwright's interactive UI mode for debugging/watching tests |
| `npm run test:debug`   | Runs tests with the Playwright inspector attached, step-by-step   |
| `npm run report`       | Opens the last HTML test report in a browser                      |

To run a single file or test by name:

```bash
npx playwright test tests/smoke.spec.ts
npx playwright test -g "test name substring"
```

To target a single browser:

```bash
npx playwright test --project=chromium
```

## Project structure

```
├── playwright.config.ts   # Test runner config: browsers, retries, reporter, etc.
├── tests/                 # All test spec files live here
│   └── smoke.spec.ts      # Sanity-check test confirming the setup works
├── package.json
└── README.md
```

## Notes

- `tests/smoke.spec.ts` is a placeholder sanity check (it just loads
  playwright.dev and checks the page title) added while the real interview
  spec was still pending. It will be replaced/removed once the actual
  spec-based tests are written.
- After a test run, an HTML report is generated in `playwright-report/`
  (view it with `npm run report`). This folder, along with `test-results/`
  and browser binaries, is git-ignored since it's regenerated output, not
  source.
