import React from 'react';
import { View } from 'react-native';

import { AppButton } from '../../ui/primitives/app-button';
import { AppScreen } from '../../ui/primitives/app-screen';
import { AppText } from '../../ui/primitives/app-text';
import { SectionCard } from '../../ui/patterns/section-card';
import type { OrderCancelReason } from '../../domain/order/order';
import { bootstrapDeps } from '../config/bootstrap-deps';
import { saveProfile } from '../../application/user/save-profile';
import { advanceOrderStatus } from '../../application/order/advance-order-status';
import { cancelOrder } from '../../application/order/cancel-order';
import { createOrderDraft } from '../../application/order/create-order-draft';
import { submitOrderDraft } from '../../application/order/submit-order-draft';
import { ActiveTripScreen } from '../../features/active-trip/screens/active-trip-screen';
import { HomeCustomerScreen } from '../../features/home-customer/screens/home-customer-screen';
import { HomeMitraScreen } from '../../features/home-mitra/screens/home-mitra-screen';
import { BasicProfileScreen } from '../../features/profile/screens/basic-profile-screen';
import { useAppStore } from '../../state/store/app-store';
import { RecoveryBanner } from '../../ui/patterns/recovery-banner';

export function RootNavigation(): React.JSX.Element {
  const activeOrder = useAppStore(state => state.activeOrder);
  const activeRole = useAppStore(state => state.activeRole);
  const bootstrapDone = useAppStore(state => state.bootstrapDone);
  const deviceBindingPresent = useAppStore(state => state.deviceBindingPresent);
  const profile = useAppStore(state => state.profile);
  const setDeviceBindingPresent = useAppStore(
    state => state.setDeviceBindingPresent,
  );
  const setActiveOrder = useAppStore(state => state.setActiveOrder);
  const setActiveRole = useAppStore(state => state.setActiveRole);
  const setProfile = useAppStore(state => state.setProfile);
  const [activeScreen, setActiveScreen] = React.useState<'home' | 'active_trip'>(
    'home',
  );
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  async function handleRoleChange(role: 'customer' | 'mitra') {
    setActiveRole(role);
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
    setActiveRole(result.value.profile.currentRole);
    setProfile(result.value.profile);
    setDeviceBindingPresent(Boolean(result.value.deviceBindingId));
  }

  async function handleCreateDraft(params: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  }) {
    if (!profile || (activeOrder && activeOrder.status !== 'Draft')) {
      return;
    }

    const result = await createOrderDraft(bootstrapDeps, {
      destination: {
        label: params.destinationLabel,
        latitude: -6.2,
        longitude: 106.816666,
        source: 'manual',
      },
      estimatedPrice: Number(params.estimatedPrice),
      pickup: {
        label: params.pickupLabel,
        latitude: -6.175392,
        longitude: 106.827153,
        source: 'manual',
      },
      profile,
    });

    if (!result.ok) {
      const errorMap: Record<typeof result.error.code, string> = {
        INVALID_DESTINATION: 'Destination is required.',
        INVALID_ESTIMATED_PRICE: 'Estimated price must be greater than zero.',
        INVALID_PICKUP: 'Pickup is required.',
        PROFILE_NOT_FOUND: 'Profile is required before creating a draft.',
      };

      setDraftError(errorMap[result.error.code]);
      return;
    }

    setDraftError(null);
    setActiveOrder(result.value);
    setActiveScreen('active_trip');
  }

  async function handleAdvanceOrder(nextStatus: Parameters<
    typeof advanceOrderStatus
  >[2]) {
    if (!activeOrder) {
      return;
    }

    if (activeOrder.status === 'Draft' && nextStatus === 'Requested') {
      const submitResult = await submitOrderDraft(bootstrapDeps, activeOrder);

      if (!submitResult.ok) {
        return;
      }

      setActiveOrder(submitResult.value);
      return;
    }

    const result = await advanceOrderStatus(bootstrapDeps, activeOrder, nextStatus);

    if (!result.ok) {
      return;
    }

    if (result.value.isTerminal) {
      setActiveOrder(null);
      setActiveScreen('home');
      return;
    }

    setActiveOrder(result.value.order);
  }

  async function handleCancelOrder(reason: OrderCancelReason) {
    if (!activeOrder) {
      return;
    }

    const result = await cancelOrder(bootstrapDeps, activeOrder, reason);

    if (!result.ok) {
      return;
    }

    if (result.value.isTerminal) {
      setActiveOrder(null);
      setActiveScreen('home');
      return;
    }

    setActiveOrder(result.value.order);
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

      {activeOrder ? (
        <RecoveryBanner
          onResume={() => {
            setActiveScreen('active_trip');
          }}
          order={activeOrder}
        />
      ) : null}

      <BasicProfileScreen
        activeRole={activeRole}
        existingProfile={profile}
        onSubmit={handleProfileSubmit}
        submitError={submitError}
      />

      {profile && activeScreen === 'active_trip' && activeOrder ? (
        <ActiveTripScreen
          activeRole={activeRole}
          onAdvance={nextStatus => {
            void handleAdvanceOrder(nextStatus);
          }}
          onBack={() => {
            setActiveScreen('home');
          }}
          onCancel={reason => {
            void handleCancelOrder(reason);
          }}
          order={activeOrder}
        />
      ) : null}

      {profile && activeScreen === 'home'
        ? activeRole === 'customer'
          ? (
              <HomeCustomerScreen
                activeOrderStatus={
                  activeOrder && activeOrder.status !== 'Canceled' &&
                  activeOrder.status !== 'Completed' &&
                  activeOrder.status !== 'Rejected' &&
                  activeOrder.status !== 'Expired'
                    ? activeOrder.status
                    : undefined
                }
                onCreateDraft={handleCreateDraft}
                submitError={draftError}
              />
            )
          : (
              <HomeMitraScreen
                onOpenRequest={
                  activeOrder?.status === 'Requested'
                    ? () => {
                        setActiveScreen('active_trip');
                      }
                    : undefined
                }
                onReviewProfile={() => {
                  setActiveScreen('home');
                }}
                profile={profile}
                requestedOrder={
                  activeOrder?.status === 'Requested' ? activeOrder : undefined
                }
              />
            )
        : null}
    </AppScreen>
  );
}
