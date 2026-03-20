const PHONE_VISIBLE_PREFIX = 2;
const PHONE_VISIBLE_SUFFIX = 2;

export function normalizePhoneE164(input: string): string {
  const digitsOnly = input.replace(/[^\d+]/g, '');

  if (digitsOnly.startsWith('+')) {
    return digitsOnly;
  }

  if (digitsOnly.startsWith('0')) {
    return `+62${digitsOnly.slice(1)}`;
  }

  if (digitsOnly.startsWith('62')) {
    return `+${digitsOnly}`;
  }

  return `+62${digitsOnly}`;
}

export function maskPhoneNumber(phoneE164: string): string {
  if (phoneE164.length <= PHONE_VISIBLE_PREFIX + PHONE_VISIBLE_SUFFIX) {
    return phoneE164;
  }

  const prefix = phoneE164.slice(0, PHONE_VISIBLE_PREFIX);
  const suffix = phoneE164.slice(-PHONE_VISIBLE_SUFFIX);
  const middle = '*'.repeat(
    phoneE164.length - PHONE_VISIBLE_PREFIX - PHONE_VISIBLE_SUFFIX,
  );

  return `${prefix}${middle}${suffix}`;
}
