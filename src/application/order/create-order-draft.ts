import { asOrderId } from '../../core/types/ids';
import { createId } from '../../core/utils/create-id';
import { nowIso } from '../../core/utils/now';
import type { Result } from '../../core/result/result';
import type { LocationPoint, Order } from '../../domain/order/order';
import type { UserProfile } from '../../domain/user/user-profile';
import type { OrderRepositoryPort } from '../../data/repositories/order-repository-port';

export type CreateOrderDraftInput = {
  destination: LocationPoint;
  estimatedPrice: number;
  pickup: LocationPoint;
  profile: UserProfile;
};

export type CreateOrderDraftError = { code: 'PROFILE_NOT_FOUND' };

export type CreateOrderDraftDeps = {
  orderRepository: OrderRepositoryPort;
};

export async function createOrderDraft(
  deps: CreateOrderDraftDeps,
  input: CreateOrderDraftInput,
): Promise<Result<Order, CreateOrderDraftError>> {
  if (!input.profile) {
    return {
      ok: false,
      error: { code: 'PROFILE_NOT_FOUND' },
    };
  }

  const timestamp = nowIso();
  const order: Order = {
    orderId: asOrderId(createId('ord')),
    bookingSessionId: createId('book'),
    customerId: input.profile.userId,
    partnerId: input.profile.userId,
    riderDeclaredName: input.profile.displayName,
    pickup: input.pickup,
    destination: input.destination,
    estimatedPrice: input.estimatedPrice,
    status: 'Draft',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await deps.orderRepository.saveOrder(order);

  return {
    ok: true,
    value: order,
  };
}
