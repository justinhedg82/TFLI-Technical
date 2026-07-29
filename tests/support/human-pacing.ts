import type { Locator, Page } from '@playwright/test';

/**
 * A person filling in one of these forms doesn't teleport between fields -
 * they read the question, think for a moment, then type at typing speed.
 * The interview brief specifically asks us not to hammer the target site at
 * full automation speed, so every step in our page objects routes through
 * these two helpers instead of calling .fill()/.click() directly.
 *
 * Small bonus discovered while mapping the FCUS journey: its phone field
 * only runs its client-side validation off real keystrokes. A raw .fill()
 * (which sets the DOM value in one go) left the "Continue" button silently
 * doing nothing. Typing character-by-character isn't just cosmetic pacing
 * here, it's required for that field to behave.
 */

function randomBetween(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/** Waits a random, human-scale amount of time, as if reading the next question. */
export async function thinkPause(page: Page, minMs = 400, maxMs = 1100): Promise<void> {
  await page.waitForTimeout(randomBetween(minMs, maxMs));
}

/** Types like a person would, one key at a time, rather than pasting the whole value in. */
export async function humanType(locator: Locator, text: string): Promise<void> {
  await locator.pressSequentially(text, { delay: randomBetween(70, 160) });
}
