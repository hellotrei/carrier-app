import type { UserProfile } from '../../domain/user/user-profile';

export type UserRepositoryPort = {
  getProfile: () => Promise<UserProfile | null>;
  saveProfile: (profile: UserProfile) => Promise<void>;
};
