const BLOCKED_ERROR_PATTERNS = [
  /\/Users\//,
  /content:\/\//,
  /file:\/\//,
  /sqlite/i,
  /select\s+/i,
  /insert\s+/i,
  /update\s+/i,
  /delete\s+/i,
  /exception/i,
  /stack/i,
] as const;

export function sanitizeErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();

  if (!message || message.length > 160) {
    return fallback;
  }

  if (BLOCKED_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
    return fallback;
  }

  return message;
}
