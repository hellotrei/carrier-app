import React from 'react';
import { View } from 'react-native';

import { AppButton } from '../../ui/primitives/app-button';
import { AppScreen } from '../../ui/primitives/app-screen';
import { AppText } from '../../ui/primitives/app-text';
import { SectionCard } from '../../ui/patterns/section-card';
import { bootstrapDeps } from '../config/bootstrap-deps';
import { saveProfile } from '../../application/user/save-profile';
import { updateCurrentRole } from '../../application/user/update-current-role';
import { HomeCustomerScreen } from '../../features/home-customer/screens/home-customer-screen';
import { HomeMitraScreen } from '../../features/home-mitra/screens/home-mitra-screen';
import { BasicProfileScreen } from '../../features/profile/screens/basic-profile-screen';
import { useAppStore } from '../../state/store/app-store';

export function RootNavigation(): React.JSX.Element {
  const activeOrder = useAppStore(state => state.activeOrder);
  const activeRole = useAppStore(state => state.activeRole);
  const bootstrapDone = useAppStore(state => state.bootstrapDone);
  const deviceBindingPresent = useAppStore(state => state.deviceBindingPresent);
  const profile = useAppStore(state => state.profile);
  const setDeviceBindingPresent = useAppStore(
    state => state.setDeviceBindingPresent,
  );
  const setProfile = useAppStore(state => state.setProfile);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  async function handleRoleChange(role: 'customer' | 'mitra') {
    if (!profile) {
      useAppStore.getState().setActiveRole(role);
      return;
    }

    const result = await updateCurrentRole(bootstrapDeps, role);

    if (!result.ok) {
      return;
    }

    setProfile(result.value);
  }

  async function handleProfileSubmit(params: {
    displayName: string;
    hasSpareHelmet?: boolean;
    phoneInput: string;
    plateNumber?: string;
    vehicleType?: 'motor' | 'mobil' | 'bajaj' | 'angkot';
  }) {
    const payload: {
      currentRole: typeof activeRole;
      displayName: string;
      hasSpareHelmet?: boolean;
      phoneInput: string;
      plateNumber?: string;
      vehicleType?: 'motor' | 'mobil' | 'bajaj' | 'angkot';
    } = {
      currentRole: activeRole,
      displayName: params.displayName,
      phoneInput: params.phoneInput,
    };

    if (params.hasSpareHelmet !== undefined) {
      payload.hasSpareHelmet = params.hasSpareHelmet;
    }

    if (params.plateNumber) {
      payload.plateNumber = params.plateNumber;
    }

    if (params.vehicleType) {
      payload.vehicleType = params.vehicleType;
    }

    const result = await saveProfile(bootstrapDeps, payload);

    if (!result.ok) {
      const errorMap: Record<typeof result.error.code, string> = {
        DISPLAY_NAME_REQUIRED: 'Display name is required.',
        PHONE_REQUIRED: 'Phone number is required.',
        VEHICLE_TYPE_REQUIRED: 'Vehicle type is required for mitra.',
      };

      setSubmitError(errorMap[result.error.code]);
      return;
    }

    setSubmitError(null);
    setProfile(result.value.profile);
    setDeviceBindingPresent(Boolean(result.value.deviceBindingId));
  }

  return (
    <AppScreen scrollable>
      <SectionCard
        eyebrow="Carrier"
        title="Scaffold baseline is ready"
        description="This shell keeps the boundary between UI, feature flow, domain logic, and data IO explicit from day one."
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <AppButton
            label="Customer"
            onPress={() => {
              void handleRoleChange('customer');
            }}
            kind={activeRole === 'customer' ? 'primary' : 'secondary'}
          />
          <AppButton
            label="Mitra"
            onPress={() => {
              void handleRoleChange('mitra');
            }}
            kind={activeRole === 'mitra' ? 'primary' : 'secondary'}
          />
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Architecture"
        title="Current active shell"
        description="Role switching lives in the app layer, while feature surfaces stay isolated."
      >
        <AppText tone="muted">
          Active role: {activeRole === 'customer' ? 'Customer' : 'Mitra'}
        </AppText>
        <AppText tone="muted">
          Bootstrap: {bootstrapDone ? 'Done' : 'Pending'}
        </AppText>
        <AppText tone="muted">
          Device binding: {deviceBindingPresent ? 'Present' : 'Missing'}
        </AppText>
        <AppText tone="muted">
          Profile: {profile ? profile.displayName : 'Not created yet'}
        </AppText>
        <AppText tone="muted">
          Driver readiness:{' '}
          {profile?.driverReadinessStatus ?? 'Not evaluated yet'}
        </AppText>
        <AppText tone="muted">
          Active order: {activeOrder ? activeOrder.status : 'None'}
        </AppText>
      </SectionCard>

      <BasicProfileScreen
        activeRole={activeRole}
        existingProfile={profile}
        onSubmit={handleProfileSubmit}
        submitError={submitError}
      />

      {profile
        ? activeRole === 'customer'
          ? <HomeCustomerScreen />
          : <HomeMitraScreen />
        : null}
    </AppScreen>
  );
}
