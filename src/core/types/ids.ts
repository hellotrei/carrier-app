import type { Brand } from './brand';

export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type DeviceBindingId = Brand<string, 'DeviceBindingId'>;

export function asUserId(value: string): UserId {
  return value as UserId;
}

export function asOrderId(value: string): OrderId {
  return value as OrderId;
}

export function asDeviceBindingId(value: string): DeviceBindingId {
  return value as DeviceBindingId;
}
