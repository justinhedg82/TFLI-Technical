import { expect, type Page } from '@playwright/test';
import { BaseApplicationPage } from './base-application-page';

export type WasteType = 'General' | 'DryRecycling' | 'FoodWaste' | 'Hazardous' | 'Clinical' | 'OtherMultiple';
export type CollectionFrequency = 'Ongoing' | 'Oneoff';
export type ClientType = 'Business' | 'Residential';

// The summary screen shows a human-readable label, not the raw option id
// (e.g. selecting "DryRecycling" shows as "Dry Recycling"). Keeping that
// mapping here means expectSummaryPage() can verify whatever combination of
// answers a test picked, rather than only ever checking the one path we
// happen to exercise below.
const WASTE_TYPE_LABEL: Record<WasteType, string> = {
  General: 'General',
  DryRecycling: 'Dry Recycling',
  FoodWaste: 'Food Waste',
  Hazardous: 'Hazardous',
  Clinical: 'Clinical',
  OtherMultiple: 'Other / Multiple',
};

const COLLECTION_FREQUENCY_LABEL: Record<CollectionFrequency, string> = {
  Ongoing: 'Ongoing Waste Collection',
  Oneoff: 'One Off Clearance',
};

/**
 * CWUK - Commercial Waste (UK): https://commercialexperts.com/uk/commercial-waste/Apply
 *
 * The journey is nine screens: three button-choice questions, then five
 * text fields, ending on a summary screen that recaps three of those
 * answers before the (never-clicked) "Get My Quote" button.
 */
export class CommercialWasteUkApplyPage extends BaseApplicationPage {
  private static readonly URL = 'https://commercialexperts.com/uk/commercial-waste/Apply';

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.openJourney(CommercialWasteUkApplyPage.URL);
  }

  async selectWasteType(type: WasteType): Promise<void> {
    await this.chooseOption(`#serviceType0${type}`);
  }

  async selectCollectionFrequency(frequency: CollectionFrequency): Promise<void> {
    await this.chooseOption(`#collectionTypeQuestion0${frequency}`);
  }

  async selectClientType(type: ClientType): Promise<void> {
    await this.chooseOption(`#clientType0${type}`);
  }

  async enterCompanyName(name: string): Promise<void> {
    await this.answerWith('#companyName0', name);
    await this.continueToNextStep();
  }

  async enterPostcode(postcode: string): Promise<void> {
    await this.answerWith('#companyPostcode0', postcode);
    await this.continueToNextStep();
  }

  async enterFullName(name: string): Promise<void> {
    await this.answerWith('#fullName0', name);
    await this.continueToNextStep();
  }

  async enterEmail(email: string): Promise<void> {
    await this.answerWith('#email0', email);
    await this.continueToNextStep();
  }

  async enterPhone(phone: string): Promise<void> {
    await this.answerWith('#telephone10', phone);
    await this.continueToNextStep();
  }

  /**
   * Confirms we've landed on the real, final summary screen and that it's
   * showing back the answers this specific test gave it - without ever
   * touching "Get My Quote". Whoever edits this file next: that button is
   * asserted visible/enabled on purpose, so we know we actually reached
   * it - please don't add a `.click()` on it.
   */
  async expectSummaryPage(expected: {
    wasteType: WasteType;
    collectionFrequency: CollectionFrequency;
    postcode: string;
  }): Promise<void> {
    await expect(this.page.getByText('Your Summary', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Final Step - Get Your Quote')).toBeVisible();

    await expect(this.page.getByText('Type of Waste')).toBeVisible();
    await expect(this.page.getByText(WASTE_TYPE_LABEL[expected.wasteType], { exact: true })).toBeVisible();
    await expect(this.page.getByText('Postcode', { exact: true })).toBeVisible();
    // Exact match matters here, not just tidiness: the site's own footer
    // prints its registered office address, and if that address's postcode
    // ever happens to match the one a test enters (as it did while working
    // on this), a substring match would ambiguously match both the summary
    // row and the footer copy.
    await expect(this.page.getByText(expected.postcode, { exact: true })).toBeVisible();
    await expect(this.page.getByText(COLLECTION_FREQUENCY_LABEL[expected.collectionFrequency])).toBeVisible();

    const getQuoteButton = this.page.getByRole('button', { name: 'Get My Quote' });
    await expect(getQuoteButton).toBeVisible();
    await expect(getQuoteButton).toBeEnabled();

    // Still on the Apply SPA route, i.e. nothing has been submitted.
    expect(this.page.url()).toContain('/uk/commercial-waste/Apply');
  }
}
