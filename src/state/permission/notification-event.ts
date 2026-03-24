import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export type NotificationEvent = {
  orderId: string | null;
  preview: string;
  type: string;
};

function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function normalizeNotificationEvent(
  message: FirebaseMessagingTypes.RemoteMessage | null,
): NotificationEvent | null {
  if (!message) {
    return null;
  }

  const title = getStringValue(message.notification?.title);
  const body = getStringValue(message.notification?.body);
  const type = getStringValue(message.data?.type) ?? 'unknown';
  const orderId = getStringValue(message.data?.orderId);

  const preview =
    (title && body && `${title}: ${body}`) ||
    title ||
    body ||
    `data:${type}`;

  return {
    orderId,
    preview,
    type,
  };
}
