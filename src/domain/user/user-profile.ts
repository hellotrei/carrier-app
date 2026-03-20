import type { AppRole } from '../../core/types/app-role';
import type { UserId } from '../../core/types/ids';

export type IdentityStatus = 'draft' | 'active' | 'blocked';

export type DriverReadinessStatus =
  | 'draft'
  | 'declared'
  | 'minimum_valid'
  | 'flagged'
  | 'blocked';

export type VehicleType = 'motor' | 'mobil' | 'bajaj' | 'angkot';

export type VehicleProfile = {
  vehicleId: string;
  vehicleType: VehicleType;
  plateNumber?: string;
  pricingMode: 'per_vehicle' | 'per_seat' | 'fixed_price';
  verificationStatus?: DriverReadinessStatus;
  isActiveForBooking: boolean;
};

export type UserProfile = {
  userId: UserId;
  displayName: string;
  phoneMasked?: string;
  phoneHash?: string;
  activeRoles: AppRole[];
  currentRole: AppRole;
  deviceAuthEnabled: boolean;
  identityStatus: IdentityStatus;
  profileValidatedAt?: string;
  driverReadinessStatus?: DriverReadinessStatus;
  vehicles?: VehicleProfile[];
  hasSpareHelmet?: boolean;
  createdAt: string;
  updatedAt: string;
};
