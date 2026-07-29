/**
 * Fake data for driving both journeys. None of this needs to be "real" -
 * we never reach the submit button - but it does need to pass whatever
 * client-side validation each field has, which is why a couple of values
 * below aren't arbitrary.
 */

export const applicant = {
  fullName: 'Jamie Tester',
  email: 'jamie.tester@example.com',
};

export const cwuk = {
  companyName: 'Playwright Test Ltd',
  // A real, well-formed UK postcode. Central London one purely because
  // it's easy to recognise as a placeholder while still passing format
  // validation.
  postcode: 'SW1A 1AA',
  // UK phone validation only checked the format during exploration, so a
  // standard-looking landline number was accepted without any fuss.
  phone: '02071234567',
};

export const fcus = {
  companyName: 'Playwright Test Inc',
  zipCode: '10001',
  // The obvious choice here would be a "555" exchange number (the
  // Hollywood/fictional convention), but this form's validation actively
  // rejects those - it correctly flags them as non-working numbers. This
  // one instead just needs to satisfy the North American numbering plan
  // (valid area code, no reserved exchange codes); it isn't tied to any
  // real, callable line, but the site's own validator no longer objects.
  phone: '4155018942',
};
