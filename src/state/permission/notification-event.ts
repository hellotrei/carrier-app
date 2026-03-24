import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export const NOTIFICATION_EVENT_TYPES = [
  'incoming_order',
  'order_response',
  'trip_update',
  'trip_terminal',
  'sos_notice',
] as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export type NotificationEvent = {
  orderId: string | null;
  preview: string;
  type: NotificationEventType | 'unknown';
};

function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNotificationEventType(value: unknown): NotificationEvent['type'] {
  const normalized = getStringValue(value);

  if (!normalized) {
    return 'unknown';
  }

  return NOTIFICATION_EVENT_TYPES.includes(
    normalized as NotificationEventType,
  )
    ? (normalized as NotificationEventType)
    : 'unknown';
}

export function normalizeNotificationEvent(
  message: FirebaseMessagingTypes.RemoteMessage | null,
): NotificationEvent | null {
  if (!message) {
    return null;
  }

  const title = getStringValue(message.notification?.title);
  const body = getStringValue(message.notification?.body);
  const type = getNotificationEventType(message.data?.type);
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
