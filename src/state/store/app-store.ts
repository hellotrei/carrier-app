import { create } from 'zustand';

import type { AppRole } from '../../core/types/app-role';
import type { Order } from '../../domain/order/order';
import type { UserProfile } from '../../domain/user/user-profile';

type AppStore = {
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

export const useAppStore = create<AppStore>(set => ({
  activeOrder: null,
  activeRole: 'customer',
  bootstrapDone: false,
  deviceBindingPresent: false,
  profile: null,
  setActiveOrder: order => set({ activeOrder: order }),
  setActiveRole: role => set({ activeRole: role }),
  setDeviceBindingPresent: value => set({ deviceBindingPresent: value }),
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
