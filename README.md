# TFLI Technical Interview - Playwright Test Suite

UI automation for two live product application journeys, written with
[Playwright Test](https://playwright.dev/) and TypeScript:

- **CWUK** - Commercial Waste (UK): https://commercialexperts.com/uk/commercial-waste/Apply
- **FCUS** - Fuel Cards (US): https://commercialexperts.com/us/fuel-cards/Apply

Both tests drive their journey from the start through to the **Summary**
page and stop there - neither ever clicks the final "Get My Quote" / "Get
Quotes" button, so no automated run creates a real quote or lead in
production. Each spec file explains, in comments, *why* that particular
combination of answers was chosen over the many other paths through the
funnel.

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

Run the full suite (all three browsers, as configured in
`playwright.config.ts`):

```bash
npm test
```

Browser windows are visible by default (`headless: false` in the config) so
you can actually watch a run happen - useful while this suite is still
being worked on. These are also real, human-paced runs against a live site
(see "Why this is slower than a typical test suite" below), so a full run
takes a few minutes rather than seconds.

If you want it to run invisibly instead (e.g. in CI), there's no CLI flag
for that when the config already defaults to headed - flip `headless` back
to `true` in `playwright.config.ts`.

Other useful scripts (see `package.json`):

| Command                | What it does                                                         |
| ----------------------- | ---------------------------------------------------------------------- |
| `npm run test:ui`      | Opens Playwright's interactive UI mode for debugging/watching tests   |
| `npm run test:debug`   | Runs tests with the Playwright inspector attached, step-by-step       |
| `npm run report`       | Opens the last HTML test report in a browser                          |

To run a single journey:

```bash
npx playwright test cwuk-commercial-waste
npx playwright test fcus-fuel-cards
```

To target a single browser:

```bash
npx playwright test --project=chromium
```

## Project structure

```
├── playwright.config.ts             # Test runner config: browsers, pacing/serial-run settings, etc.
├── tests/
│   ├── cwuk-commercial-waste.spec.ts  # CWUK journey test - what path was chosen and why
│   ├── fcus-fuel-cards.spec.ts         # FCUS journey test - what path was chosen and why
│   ├── pages/
│   │   ├── base-application-page.ts        # Shared wizard mechanics (both products use the same funnel engine)
│   │   ├── commercial-waste-uk.page.ts     # CWUK-specific fields/steps + Summary assertions
│   │   └── fuel-cards-us.page.ts           # FCUS-specific fields/steps + Summary assertions
│   ├── support/
│   │   └── human-pacing.ts            # Shared "type and think like a person" helpers
│   └── fixtures/
│       └── test-data.ts               # Fake applicant/company data used by both journeys
├── package.json
└── README.md
```

This is a Page Object Model: each product's page object exposes one method
per step (`selectWasteType()`, `enterPostcode()`, ...), so the test files
read as a plain narrative of the journey, and the click/fill/pacing
mechanics that both journeys share only need to be written once, in
`BaseApplicationPage`.

## Why this is slower than a typical test suite

The brief specifically asks for tests paced like a real person, not
machine-speed automation, and for the target site's infrastructure to be
treated with some care rather than hammered. That shapes several
deliberate choices here, all commented in the code where they apply:

- `tests/support/human-pacing.ts` adds randomised "thinking" pauses between
  steps and types into fields character-by-character rather than pasting
  values in.
- `playwright.config.ts` runs everything with `workers: 1` (serial, not
  parallel) so we're never running multiple sessions against the live site
  at once, and sets a longer per-test timeout to give that pacing room to
  breathe.
- The Chromium project overrides its default User-Agent. Headless
  Chromium's UA otherwise contains the literal string `HeadlessChrome`,
  which the site's WAF rejects outright with a 403 (confirmed by comparing
  against a plain `curl` request using a normal browser UA, which got a
  200). Firefox and WebKit don't need this - their default headless UAs
  already look like ordinary browsers.

If a run does start getting 403 responses back (the brief flags this as a
possibility under heavier load), stop for five minutes before retrying, and
consider adding a short delay between runs when you do.

## Notes

- After a test run, an HTML report is generated in `playwright-report/`
  (view it with `npm run report`). This folder, along with `test-results/`
  and browser binaries, is git-ignored since it's regenerated output, not
  source.
