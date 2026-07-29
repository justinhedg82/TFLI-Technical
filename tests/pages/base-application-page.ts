import type { Locator, Page } from '@playwright/test';
import { humanType, thinkPause } from '../support/human-pacing';

/**
 * Both CWUK and FCUS are the same underlying "question wizard" product
 * (same button styling, same one-field-per-page pattern, same footer), just
 * skinned differently for waste vs fuel cards. Rather than duplicating the
 * click/fill/continue mechanics in both page objects, that shared behaviour
 * lives here and the two product pages just describe *which* fields exist
 * and in *what order* - that's the bit that's actually specific to each
 * journey and the bit most likely to need updating if the funnel changes.
 */
export abstract class BaseApplicationPage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  protected get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Navigates to the given journey's start and waits for it to genuinely
   * settle before we touch anything.
   *
   * Two different failure modes were found here, not just one:
   *
   * Just waiting for Playwright's default `load` event wasn't enough on a
   * cold run (fresh browser, nothing cached) - `load` fires before this
   * SPA's JS has actually hydrated and wired up its click handlers, so the
   * very first option-button click could land on a page that looked ready
   * but wasn't listening yet, and the journey never advanced.
   *
   * The obvious next thing to reach for is `waitUntil: 'networkidle'`, and
   * it's what the exploratory scripts used - but under a full three-browser
   * run it once hung for the entire 90s test timeout waiting for idle that
   * never came, almost certainly some background analytics/chat-widget
   * request keeping the connection count above zero indefinitely. That's a
   * documented Playwright foot-gun, not a fluke, which is why it's avoided
   * here in the real suite even though it looked fine in ad-hoc scripts.
   *
   * So: the default, reliable `load` wait, plus an explicit pause long
   * enough for hydration to finish - which also happens to be exactly what
   * a real visitor does anyway (look at a page for a moment before
   * clicking anything).
   */
  protected async openJourney(url: string): Promise<void> {
    await this.page.goto(url);
    await thinkPause(this.page, 1500, 2500);
    await this.dismissCookieBannerIfPresent();
  }

  /**
   * Cookie consent shows up on the UK journey but never appeared during
   * exploration of the US one - possibly geo/consent-tool driven rather
   * than a fixed part of the page. Rather than assume either way for every
   * environment this suite might run in, we just check for it and move on
   * if it's not there, instead of hard-coding per-product behaviour.
   *
   * Two things worth flagging about how this is written, both found by
   * actually hitting them: "Accept" renders as an `<a>`, not a `<button>`,
   * so a role-based "button" locator silently never matches it - matching
   * on visible text instead is what actually works here. And
   * `locator.isVisible()` does *not* wait for the element to appear (its
   * `timeout` option is a documented no-op) - it checks the DOM at that
   * exact instant and returns, so calling it immediately after `goto()`
   * raced the consent script and always came back false. `waitFor()` does
   * the real waiting we want.
   *
   * The consequence of getting this wrong wasn't a clean failure either:
   * the banner's full-page click-catching backdrop stayed up and silently
   * swallowed every click on the actual form underneath - the first
   * "select waste type" step just sat there forever with no error to
   * explain why.
   *
   * The timeout below is generous (rather than, say, 2-3s) because this is
   * a real third-party consent script racing the page load, not something
   * under our control - on a cold run it can take a few seconds to mount.
   * The cost of that is a few seconds of dead time on every FCUS run (where
   * no banner ever shows up, so we always wait out the full timeout), which
   * is a trade we're making deliberately in favour of not failing a whole
   * CWUK run over a slow consent script.
   */
  private async dismissCookieBannerIfPresent(): Promise<void> {
    const acceptLink = this.page.getByText('Accept', { exact: true });
    const appeared = await acceptLink
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (appeared) {
      await acceptLink.click();
    }
  }

  /**
   * Every question in this wizard is answered by clicking one of a row of
   * option buttons (waste type, fleet size, etc). Those buttons carry a
   * "pulse" CSS animation to draw the eye - great for a real user, but it
   * means the button's bounding box is constantly moving, so Playwright's
   * normal actionability check ("wait until the element stops moving")
   * never settles and the click times out. `force: true` skips that
   * stability wait; we've already confirmed the button is the right one via
   * its selector, so we're not losing any real safety by skipping it.
   */
  protected async chooseOption(selector: string): Promise<void> {
    await thinkPause(this.page);
    await this.page.locator(selector).click({ force: true });
  }

  /** Types the given value into a field at human speed, then moves on. */
  protected async answerWith(selector: string, value: string): Promise<void> {
    await thinkPause(this.page);
    await humanType(this.page.locator(selector), value);
  }

  /** Submits the current step and waits for the next question to render. */
  protected async continueToNextStep(): Promise<void> {
    await thinkPause(this.page, 300, 700);
    await this.continueButton.click({ force: true });
  }
}
