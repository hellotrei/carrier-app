import type { AppRole } from '../../core/types/app-role';
import type { Result } from '../../core/result/result';
import type { UserProfile } from '../../domain/user/user-profile';
import type { UserRepositoryPort } from '../../data/repositories/user-repository-port';

type UpdateCurrentRoleError = { code: 'PROFILE_NOT_FOUND' };

export type UpdateCurrentRoleDeps = {
  userRepository: UserRepositoryPort;
};

export async function updateCurrentRole(
  deps: UpdateCurrentRoleDeps,
  role: AppRole,
): Promise<Result<UserProfile, UpdateCurrentRoleError>> {
  const profile = await deps.userRepository.getProfile();

  if (!profile) {
    return {
      ok: false,
      error: { code: 'PROFILE_NOT_FOUND' },
    };
  }

  const nextProfile: UserProfile = {
    ...profile,
    activeRoles: profile.activeRoles.includes(role)
      ? profile.activeRoles
      : [...profile.activeRoles, role],
    currentRole: role,
  };

  await deps.userRepository.saveProfile(nextProfile);

  return {
    ok: true,
    value: nextProfile,
  };
}
