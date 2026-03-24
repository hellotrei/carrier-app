import { create } from 'zustand';

import type { AppRole } from '../../core/types/app-role';
import type { Order } from '../../domain/order/order';
import type { UserProfile } from '../../domain/user/user-profile';

type AppShellStore = {
  activeOrder: Order | null;
  activeRole: AppRole;
  bootstrapDone: boolean;
  deviceBindingPresent: boolean;
  profile: UserProfile | null;
  setActiveOrder: (order: Order | null) => void;
  setActiveRole: (role: AppRole) => void;
  setDeviceBindingPresent: (value: boolean) => void;
  setProfile: (profile: UserProfile | null) => void;
  setBootstrapSnapshot: (snapshot: {
    activeOrder: Order | null;
    bootstrapDone: boolean;
    deviceBindingPresent: boolean;
    profile: UserProfile | null;
  }) => void;
};

export const useAppShellStore = create<AppShellStore>(set => ({
  activeOrder: null,
  activeRole: 'customer',
  bootstrapDone: false,
  deviceBindingPresent: false,
  profile: null,
  setActiveOrder: activeOrder => set({ activeOrder }),
  setActiveRole: activeRole => set({ activeRole }),
  setDeviceBindingPresent: deviceBindingPresent => set({ deviceBindingPresent }),
  setProfile: profile =>
    set({
      profile,
      activeRole: profile?.currentRole ?? 'customer',
    }),
  setBootstrapSnapshot: snapshot =>
    set({
      activeOrder: snapshot.activeOrder,
      bootstrapDone: snapshot.bootstrapDone,
      deviceBindingPresent: snapshot.deviceBindingPresent,
      profile: snapshot.profile,
      activeRole: snapshot.profile?.currentRole ?? 'customer',
    }),
}));
