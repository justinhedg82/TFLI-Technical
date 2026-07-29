import { test } from '@playwright/test';
import { CommercialWasteUkApplyPage } from './pages/commercial-waste-uk.page';
import { applicant, cwuk } from './fixtures/test-data';

/**
 * CWUK - Commercial Waste (UK)
 *
 * The brief asks us to use judgement about what's worth covering rather
 * than exhaustively testing every branch, so here's the reasoning behind
 * this specific path:
 *
 * - Waste type "General" is the first option offered and, going by the
 *   business's own marketing on the landing page ("Affordable Business
 *   Waste Collections"), reads as the default/most common case - the one
 *   most quote requests will actually be.
 * - "Ongoing Waste Collection" rather than "One Off Clearance" - ongoing
 *   contracts are the recurring-revenue product; a broken ongoing-signup
 *   funnel is a bigger business risk than the one-off variant.
 * - "Business" rather than "Residential" - this product is Commercial
 *   Waste, so Business is the persona the whole funnel exists for.
 *
 * We stop dead at the summary screen and never touch "Get My Quote" - the
 * brief is explicit that automated runs must not create real leads/quotes.
 */
test('reaches the Summary page after completing the commercial (ongoing, general waste) journey', async ({ page }) => {
  const cwukPage = new CommercialWasteUkApplyPage(page);

  await cwukPage.open();

  await cwukPage.selectWasteType('General');
  await cwukPage.selectCollectionFrequency('Ongoing');
  await cwukPage.selectClientType('Business');

  await cwukPage.enterCompanyName(cwuk.companyName);
  await cwukPage.enterPostcode(cwuk.postcode);
  await cwukPage.enterFullName(applicant.fullName);
  await cwukPage.enterEmail(applicant.email);
  await cwukPage.enterPhone(cwuk.phone);

  await cwukPage.expectSummaryPage({
    wasteType: 'General',
    collectionFrequency: 'Ongoing',
    postcode: cwuk.postcode,
  });
});
