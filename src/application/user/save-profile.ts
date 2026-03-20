import type { AppRole } from '../../core/types/app-role';
import { asDeviceBindingId, asUserId } from '../../core/types/ids';
import { createId } from '../../core/utils/create-id';
import { hashString } from '../../core/utils/hash-string';
import { nowIso } from '../../core/utils/now';
import { normalizePhoneE164, maskPhoneNumber } from '../../core/validation/profile';
import type { Result } from '../../core/result/result';
import type { UserProfile } from '../../domain/user/user-profile';
import type { UserRepositoryPort } from '../../data/repositories/user-repository-port';
import { SECURE_STORAGE_KEYS } from '../../data/storage/secure-storage-keys';
import type { SecureStoragePort } from '../../data/storage/secure-storage-port';

export type SaveProfileInput = {
  currentRole: AppRole;
  displayName: string;
  phoneInput: string;
};

export type SaveProfileError =
  | { code: 'DISPLAY_NAME_REQUIRED' }
  | { code: 'PHONE_REQUIRED' };

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

  if (!input.phoneInput.trim()) {
    return { code: 'PHONE_REQUIRED' };
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
  const phoneE164 = normalizePhoneE164(input.phoneInput);
  const phoneMasked = maskPhoneNumber(phoneE164);
  const phoneHash = hashString(phoneE164);
  const existingProfile = await deps.userRepository.getProfile();
  const userId = existingProfile?.userId ?? asUserId(createId('usr'));
  const currentBinding =
    (await deps.secureStorage.get(SECURE_STORAGE_KEYS.DEVICE_BINDING_ID)) ??
    createId('bind');

  const profile: UserProfile = {
    userId,
    displayName,
    phoneHash,
    phoneMasked,
    activeRoles: [input.currentRole],
    currentRole: input.currentRole,
    deviceAuthEnabled: false,
    identityStatus: 'active',
    profileValidatedAt: timestamp,
    createdAt: existingProfile?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

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
