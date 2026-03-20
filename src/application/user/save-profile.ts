import type { AppRole } from '../../core/types/app-role';
import { asDeviceBindingId, asUserId } from '../../core/types/ids';
import { createId } from '../../core/utils/create-id';
import { hashString } from '../../core/utils/hash-string';
import { nowIso } from '../../core/utils/now';
import { normalizePhoneE164, maskPhoneNumber } from '../../core/validation/profile';
import type { Result } from '../../core/result/result';
import type {
  UserProfile,
  VehicleProfile,
  VehicleType,
} from '../../domain/user/user-profile';
import { resolveDriverReadinessStatus } from '../../domain/user/validate-driver-readiness';
import type { UserRepositoryPort } from '../../data/repositories/user-repository-port';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';
import type { SecureStoragePort } from '../../data/storage/secure-storage-port';

export type SaveProfileInput = {
  currentRole: AppRole;
  displayName: string;
  hasSpareHelmet?: boolean;
  plateNumber?: string;
  phoneInput: string;
  vehicleType?: VehicleType;
};

export type SaveProfileError =
  | { code: 'DISPLAY_NAME_REQUIRED' }
  | { code: 'PHONE_REQUIRED' }
  | { code: 'VEHICLE_TYPE_REQUIRED' };

export type SaveProfileDeps = {
  secureStorage: SecureStoragePort;
  userRepository: UserRepositoryPort;
};

export type SaveProfileSuccess = {
  deviceBindingId: string;
  profile: UserProfile;
};

function validateInput(input: SaveProfileInput): SaveProfileError | null {
  if (!input.displayName.trim()) {
    return { code: 'DISPLAY_NAME_REQUIRED' };
  }

  if (input.currentRole === 'mitra' && !input.vehicleType) {
    return { code: 'VEHICLE_TYPE_REQUIRED' };
  }

  return null;
}

export async function saveProfile(
  deps: SaveProfileDeps,
  input: SaveProfileInput,
): Promise<Result<SaveProfileSuccess, SaveProfileError>> {
  const validationError = validateInput(input);

  if (validationError) {
    return {
      ok: false,
      error: validationError,
    };
  }

  const timestamp = nowIso();
  const displayName = input.displayName.trim();
  const existingProfile = await deps.userRepository.getProfile();
  const storedPhone =
    await deps.secureStorage.get(SECURE_STORAGE_KEYS.USER_PHONE_E164);
  const resolvedPhoneInput = input.phoneInput.trim() || storedPhone;

  if (!resolvedPhoneInput) {
    return {
      ok: false,
      error: { code: 'PHONE_REQUIRED' },
    };
  }

  const phoneE164 = normalizePhoneE164(resolvedPhoneInput);
  const phoneMasked = maskPhoneNumber(phoneE164);
  const phoneHash = hashString(phoneE164);
  const userId = existingProfile?.userId ?? asUserId(createId('usr'));
  const currentBinding =
    (await deps.secureStorage.get(SECURE_STORAGE_KEYS.DEVICE_BINDING_ID)) ??
    createId('bind');

  const profile: UserProfile = {
    userId,
    displayName,
    phoneHash,
    phoneMasked,
    activeRoles:
      input.currentRole === 'mitra'
        ? ['customer', 'mitra']
        : existingProfile?.activeRoles ?? ['customer'],
    currentRole: input.currentRole,
    deviceAuthEnabled: existingProfile?.deviceAuthEnabled ?? false,
    identityStatus: 'active',
    profileValidatedAt: timestamp,
    createdAt: existingProfile?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  if (input.currentRole === 'mitra' && input.vehicleType) {
    const vehicle: VehicleProfile = {
      vehicleId: createId('veh'),
      vehicleType: input.vehicleType,
      pricingMode: 'per_vehicle' as const,
      verificationStatus: 'minimum_valid' as const,
      isActiveForBooking: true,
    };

    if (input.plateNumber?.trim()) {
      vehicle.plateNumber = input.plateNumber.trim();
    }

    profile.vehicles = [vehicle];
    profile.hasSpareHelmet = Boolean(input.hasSpareHelmet);
    const readinessInput: {
      hasSpareHelmet?: boolean;
      vehicles: VehicleProfile[];
    } = {
      vehicles: profile.vehicles,
    };

    if (input.hasSpareHelmet !== undefined) {
      readinessInput.hasSpareHelmet = input.hasSpareHelmet;
    }

    profile.driverReadinessStatus = resolveDriverReadinessStatus(readinessInput);
  }

  await Promise.all([
    deps.userRepository.saveProfile(profile),
    deps.secureStorage.set(SECURE_STORAGE_KEYS.USER_PHONE_E164, phoneE164),
    deps.secureStorage.set(
      SECURE_STORAGE_KEYS.DEVICE_BINDING_ID,
      asDeviceBindingId(currentBinding),
    ),
  ]);

  return {
    ok: true,
    value: {
      deviceBindingId: currentBinding,
      profile,
    },
  };
}
