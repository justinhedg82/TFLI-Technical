/**
 * Fake data for driving both journeys. None of this needs to be "real" -
 * we never reach the submit button - but it does need to pass whatever
 * client-side validation each field has, which is why a couple of values
 * below aren't arbitrary.
 */

export const applicant = {
  fullName: 'Justin Tester',
  email: 'justin.tester@example.com',
};

export const cwuk = {
  companyName: 'TFLI Ltd',
  // A real, well-formed UK postcode - passes format validation without
  // needing to be tied to any particular address.
  postcode: 'SK10 2XG',
  // The field's placeholder ("e.g. 0207xxxxxxx") is a plain 11-digit
  // string with no spaces, and it turns out that's not just cosmetic: the
  // input has a matching maxlength, so a value with a space in it (like
  // "01625 322555") silently gets truncated to 11 characters instead of
  // being rejected outright - it just quietly loses its last digit and
  // then fails validation on the shortened result. No spaces, basically.
  phone: '01625322555',
};

export const fcus = {
  companyName: 'TFLI Ltd',
  // Must be a real 5-digit US zip format - the form's own validation
  // rejects anything else, so this can't just mirror CWUK's UK-style value.
  zipCode: '10001',
  // The obvious choice here would be a "555" exchange number (the
  // Hollywood/fictional convention), but this form's validation actively
  // rejects those - it correctly flags them as non-working numbers. This
  // one instead just needs to satisfy the North American numbering plan
  // (valid area code, no reserved exchange codes); it isn't tied to any
  // real, callable line, but the site's own validator no longer objects.
  phone: '4155018942',
};
