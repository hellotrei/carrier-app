import type { OrderId, UserId } from '../../core/types/ids';

export type OrderStatus =
  | 'Draft'
  | 'Requested'
  | 'Accepted'
  | 'OnTheWay'
  | 'ArrivedAtPickup'
  | 'OnTrip'
  | 'Completed'
  | 'Canceled'
  | 'Rejected'
  | 'Expired';

export type OrderCancelReason =
  | 'other'
  | 'no_show'
  | 'identity_mismatch'
  | 'contact_mismatch'
  | 'unsafe_or_suspicious'
  | 'pickup_mismatch';

export type LocationPoint = {
  label?: string;
  latitude: number;
  longitude: number;
  source: 'gps' | 'manual';
};

export type Order = {
  orderId: OrderId;
  bookingSessionId: string;
  cancelReason?: OrderCancelReason;
  customerId: UserId;
  completedAt?: string;
  partnerId: UserId;
  feedbackSource?: 'default_auto' | 'manual';
  finalRating?: number;
  reviewText?: string;
  riderDeclaredName: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  estimatedPrice: number;
  requestedAt?: string;
  status: OrderStatus;
  createdAt: string;
  statusUpdatedAt: string;
  updatedAt: string;
};

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return (
    status === 'Completed' ||
    status === 'Canceled' ||
    status === 'Rejected' ||
    status === 'Expired'
  );
}

export function canCancelOrderWithReason(
  status: OrderStatus,
  reason: OrderCancelReason,
): boolean {
  switch (reason) {
    case 'no_show':
      return status === 'ArrivedAtPickup';
    case 'pickup_mismatch':
      return (
        status === 'Draft' ||
        status === 'Requested' ||
        status === 'Accepted' ||
        status === 'OnTheWay' ||
        status === 'ArrivedAtPickup'
      );
    case 'identity_mismatch':
      return status !== 'Draft' && status !== 'OnTrip';
    case 'unsafe_or_suspicious':
      return status !== 'Draft';
    case 'contact_mismatch':
      return status === 'Requested' || status === 'Accepted';
    case 'other':
      return status === 'Draft';
    default:
      return false;
  }
}
