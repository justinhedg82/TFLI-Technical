import { test } from '@playwright/test';
import { FuelCardsUsApplyPage } from './pages/fuel-cards-us.page';
import { applicant, fcus } from './fixtures/test-data';

/**
 * FCUS - Fuel Cards (US)
 *
 * Same brief as CWUK: pick the path that represents the most common, most
 * commercially important applicant rather than trying to cover all eight
 * qualifying questions' worth of combinations in one journey. Reasoning
 * for this particular combination:
 *
 * - Fleet size "1 - 4 Vehicles" (exact count 2) - a small operator is the
 *   volume case for a fuel card product; a large enterprise fleet is
 *   probably handled by an entirely different sales motion in practice.
 * - Currently paying by "Cash" at "Gas Stations" - this is precisely the
 *   pain point a fuel card product is pitched to solve, so it's the
 *   persona most likely to convert, and the one the business most needs
 *   this form to work for.
 * - Vehicle type "Vans/Trucks" and business type "LLC" doing
 *   "Construction" - a small construction outfit running a couple of vans
 *   is a mainstream, realistic fit for the vehicle/business combination
 *   rather than an edge case.
 *
 * As with CWUK, we stop at the summary screen and never touch "Get
 * Quotes" - no automated run should create a real lead.
 */
test('reaches the Summary page after completing the small-fleet cash-payer journey', async ({ page }) => {
  const fcusPage = new FuelCardsUsApplyPage(page);

  await fcusPage.open();

  await fcusPage.selectFleetSizeBand('OneToFour');
  await fcusPage.selectExactFleetSizeWithinOneToFour(2);
  await fcusPage.selectFuelPurchaseMethod('Cash');
  await fcusPage.selectFuelPurchaseLocation('GasStations');
  await fcusPage.selectMonthlySpend('500To1000');
  await fcusPage.selectVehicleType('VansTrucks');
  await fcusPage.selectBusinessType('LLC');
  await fcusPage.selectBusinessDescription('Construction');

  await fcusPage.enterZipCode(fcus.zipCode);
  await fcusPage.enterCompanyName(fcus.companyName);
  await fcusPage.enterFullName(applicant.fullName);
  await fcusPage.enterEmail(applicant.email);
  await fcusPage.enterPhone(fcus.phone);

  await fcusPage.expectSummaryPage({
    fleetSize: 2,
    zipCode: fcus.zipCode,
    phone: fcus.phone,
  });
});
