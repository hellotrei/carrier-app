import type { Order } from '../../domain/order/order';

export type ResumeTarget = 'home' | 'active_trip';

export function resolveResumeTarget(
  activeOrder: Order | null,
): ResumeTarget {
  if (!activeOrder) {
    return 'home';
  }

  if (activeOrder.status === 'Draft') {
    return 'home';
  }

  return 'active_trip';
}

export function getHasRecoverableOrder(activeOrder: Order | null): boolean {
  return Boolean(activeOrder);
}
