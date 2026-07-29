import { expect, type Page } from '@playwright/test';
import { BaseApplicationPage } from './base-application-page';

export type FleetSizeBand = 'OneToFour' | 'FiveToTwenty' | 'TwentyOneToFifty' | 'FiftyPlus';
export type FuelPurchaseMethod = 'Cash' | 'FleetFuelCard' | 'DebitCard' | 'CreditCardCorporate' | 'CreditCardPersonal';
export type FuelPurchaseLocation = 'GasStations' | 'TruckStops' | 'Other';
export type MonthlySpendBand = 'UpTo250' | '250To500' | '500To1000' | '1000To3000' | '3000Plus';
export type VehicleType = 'Cars' | 'VansTrucks' | 'HeavyDutyTrucksSemis' | 'Other';
export type BusinessType = 'SoleProprietorship' | 'Partnership' | 'LLC' | 'Corporation' | 'NotABusiness' | 'Other';
export type BusinessDescription = 'Logistics' | 'Construction' | 'FieldServices' | 'PublicTransportation' | 'Other';

// The button element ids don't follow a pattern we can derive from the type
// names above (e.g. the "500 - 1000" spend band's id ends "01000", and
// "3000+" ends "03001"), so rather than guess at a formula we're recording
// exactly what was observed on the live site for each option.
const FLEET_SIZE_BAND_ID: Record<FleetSizeBand, string> = {
  OneToFour: 'fleetSizeQuestion04',
  FiveToTwenty: 'fleetSizeQuestion020',
  TwentyOneToFifty: 'fleetSizeQuestion050',
  FiftyPlus: 'fleetSizeQuestion051',
};

const MONTHLY_SPEND_ID: Record<MonthlySpendBand, string> = {
  UpTo250: 'fuelMonthlySpend0250',
  '250To500': 'fuelMonthlySpend0500',
  '500To1000': 'fuelMonthlySpend01000',
  '1000To3000': 'fuelMonthlySpend03000',
  '3000Plus': 'fuelMonthlySpend03001',
};

/**
 * FCUS - Fuel Cards (US): https://commercialexperts.com/us/fuel-cards/Apply
 *
 * Longer funnel than CWUK - eight qualifying questions before it even asks
 * for contact details. The "1 - 4 Vehicles" band is the only one this
 * suite has walked through by hand; it's followed by a second screen asking
 * for the *exact* count (1/2/3/4 as separate buttons). The other bands may
 * well skip that follow-up or ask something else entirely - since that
 * wasn't observed, selectExactFleetSizeWithinOneToFour() only claims to
 * cover that one combination rather than guessing at the rest.
 */
export class FuelCardsUsApplyPage extends BaseApplicationPage {
  private static readonly URL = 'https://commercialexperts.com/us/fuel-cards/Apply';

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.openJourney(FuelCardsUsApplyPage.URL);
  }

  async selectFleetSizeBand(band: FleetSizeBand): Promise<void> {
    await this.chooseOption(`#${FLEET_SIZE_BAND_ID[band]}`);
  }

  async selectExactFleetSizeWithinOneToFour(count: 1 | 2 | 3 | 4): Promise<void> {
    await this.chooseOption(`#fleetSize0${count}`);
  }

  async selectFuelPurchaseMethod(method: FuelPurchaseMethod): Promise<void> {
    await this.chooseOption(`#howPurchaseFuel0${method}`);
  }

  async selectFuelPurchaseLocation(location: FuelPurchaseLocation): Promise<void> {
    await this.chooseOption(`#wherePurchaseFuel0${location}`);
  }

  async selectMonthlySpend(band: MonthlySpendBand): Promise<void> {
    await this.chooseOption(`#${MONTHLY_SPEND_ID[band]}`);
  }

  async selectVehicleType(type: VehicleType): Promise<void> {
    await this.chooseOption(`#vehiclesType0${type}`);
  }

  async selectBusinessType(type: BusinessType): Promise<void> {
    await this.chooseOption(`#businessType0${type}`);
  }

  async selectBusinessDescription(description: BusinessDescription): Promise<void> {
    await this.chooseOption(`#businessDescription0${description}`);
  }

  async enterZipCode(zipCode: string): Promise<void> {
    await this.answerWith('#companyZipcode0', zipCode);
    await this.continueToNextStep();
  }

  async enterCompanyName(name: string): Promise<void> {
    await this.answerWith('#companyName0', name);
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

    // Found this by hitting it: submitting the phone step here briefly
    // shows a "Please wait while we check what you entered" dialog - looks
    // like an async phone-number check (CWUK's phone step doesn't do this,
    // for comparison). While that's in flight the summary screen underneath
    // it can momentarily render twice, which trips Playwright's strict-mode
    // duplicate-match check if we assert on it too early. So: wait for the
    // check to actually finish rather than assuming the step is done the
    // moment Continue is clicked.
    const verifyingDialog = this.page.getByText('Please wait while we check what you entered');
    const appeared = await verifyingDialog
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
    if (appeared) {
      await verifyingDialog.waitFor({ state: 'hidden', timeout: 15000 });
    }
  }

  /**
   * Confirms we've reached the real final screen and that it's echoing
   * back what we entered - without ever touching "Get Quotes". Please
   * don't add a `.click()` on that button; it's asserted visible/enabled
   * on purpose, precisely so we can prove we got there without pressing it.
   *
   * Worth flagging separately from what this method checks: unlike CWUK's
   * summary (which recaps every qualifying answer), this one only recaps
   * fleet size, monthly spend, zip and phone - the other four qualifying
   * answers (purchase method/location, vehicle type, business type and
   * description) plus company name and full name are captured but never
   * shown back to the user for confirmation. That's a product/UX question
   * worth raising, not a test bug, so it's noted here rather than asserted
   * against.
   *
   * One more thing found by running this rather than reading the markup:
   * the summary is actually built from several conditional blocks (each
   * one an `id="summary0"`, `summary1`, ... span guarded by a
   * `data-displayif` condition on the fleet-size answer, presumably one
   * block per fleet-size band), and the ones that don't apply stay in the
   * DOM hidden via CSS rather than being removed. So "Fleet Size"/"Your
   * Summary" etc. can genuinely exist twice at once, which trips
   * Playwright's strict-mode duplicate check if you match on text alone.
   * Scoping to whichever block is actually visible is the real fix -
   * `.first()` on the unscoped text would silently work sometimes and
   * silently pick the wrong (hidden) block other times, so it's worth
   * avoiding rather than reaching for it as the easy way out.
   */
  async expectSummaryPage(expected: {
    fleetSize: number;
    zipCode: string;
    phone: string;
  }): Promise<void> {
    const summaryPanel = this.page.locator('[id^="summary"]:visible').first();

    await expect(summaryPanel.getByText('Your Summary', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Final Step - Get Your Free Quotes')).toBeVisible();

    await expect(summaryPanel.getByText('Fleet Size', { exact: true })).toBeVisible();
    await expect(summaryPanel.getByText(String(expected.fleetSize), { exact: true })).toBeVisible();
    await expect(summaryPanel.getByText('Company Zip Code', { exact: true })).toBeVisible();
    await expect(summaryPanel.getByText(expected.zipCode)).toBeVisible();
    await expect(summaryPanel.getByText('Cellphone Number', { exact: true })).toBeVisible();
    await expect(summaryPanel.getByText(expected.phone)).toBeVisible();

    const getQuotesButton = this.page.getByRole('button', { name: 'Get Quotes' });
    await expect(getQuotesButton).toBeVisible();
    await expect(getQuotesButton).toBeEnabled();

    // Still on the Apply SPA route, i.e. nothing has been submitted.
    expect(this.page.url()).toContain('/us/fuel-cards/Apply');
  }
}
