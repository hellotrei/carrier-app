import type { OrderId, UserId } from '../../core/types/ids';

export type OrderStatus =
  | 'Draft'
  | 'Requested'
  | 'Accepted'
  | 'OnTheWay'
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
  partnerId: UserId;
  riderDeclaredName: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  estimatedPrice: number;
  status: OrderStatus;
  createdAt: string;
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
