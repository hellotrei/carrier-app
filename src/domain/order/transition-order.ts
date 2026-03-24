import type { Order, OrderStatus } from './order';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Draft: ['Requested', 'Canceled'],
  Requested: ['Accepted', 'Rejected', 'Expired', 'Canceled'],
  Accepted: ['OnTheWay', 'Canceled'],
  OnTheWay: ['ArrivedAtPickup', 'Canceled'],
  ArrivedAtPickup: ['OnTrip', 'Canceled'],
  OnTrip: ['Completed', 'Canceled'],
  Completed: [],
  Canceled: [],
  Rejected: [],
  Expired: [],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function transitionOrder(
  order: Order,
  nextStatus: OrderStatus,
  updatedAt: string,
): Order {
  if (!canTransitionOrder(order.status, nextStatus)) {
    throw new Error(
      `Invalid order transition from ${order.status} to ${nextStatus}`,
    );
  }

  return {
    ...order,
    status: nextStatus,
    statusUpdatedAt: updatedAt,
    updatedAt,
  };
}
