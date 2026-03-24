const REDACTED_VALUE = '[redacted]';
const SENSITIVE_KEY_PATTERN =
  /(actorUserId|customerId|partnerId|userId|phone|pickup|destination|label|reviewText|path|payload)/i;

function sanitizeStructuredValue(value: unknown, parentKey?: string): unknown {
  if (parentKey && SENSITIVE_KEY_PATTERN.test(parentKey)) {
    return REDACTED_VALUE;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeStructuredValue(item, parentKey));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeStructuredValue(nestedValue, key),
      ]),
    );
  }

  if (typeof value === 'string' && value.trim().startsWith('/')) {
    return REDACTED_VALUE;
  }

  return value;
}

export function sanitizeJsonPreview(rawValue: string): string {
  try {
    return JSON.stringify(
      sanitizeStructuredValue(JSON.parse(rawValue)),
      null,
      2,
    );
  } catch {
    return REDACTED_VALUE;
  }
}

export function sanitizeFilePathPreview(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const parts = normalizedPath.split('/').filter(Boolean);

  if (!parts.length) {
    return 'exports/[redacted]';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}
