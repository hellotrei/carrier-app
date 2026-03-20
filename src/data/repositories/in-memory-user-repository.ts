import type { UserProfile } from '../../domain/user/user-profile';
import type { UserRepositoryPort } from './user-repository-port';

export function createInMemoryUserRepository(
  initialProfile: UserProfile | null = null,
): UserRepositoryPort {
  let profile = initialProfile;

  return {
    async getProfile() {
      return profile;
    },
    async saveProfile(nextProfile) {
      profile = nextProfile;
    },
  };
}
