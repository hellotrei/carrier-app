import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AppRole } from '../../../core/types/app-role';
import type {
  DriverReadinessStatus,
  UserProfile,
  VehicleType,
} from '../../../domain/user/user-profile';
import { tokens } from '../../../ui/theme/tokens';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppInput } from '../../../ui/primitives/app-input';
import { AppText } from '../../../ui/primitives/app-text';

type BasicProfileScreenProps = {
  activeRole: AppRole;
  existingProfile?: UserProfile | null;
  onSubmit: (params: {
    displayName: string;
    hasSpareHelmet?: boolean;
    phoneInput: string;
    plateNumber?: string;
    vehicleType?: VehicleType;
  }) => Promise<void>;
  submitError?: string | null;
};

function getReadinessLabel(status: DriverReadinessStatus | undefined): string {
  switch (status) {
    case 'minimum_valid':
      return 'Ready for incoming requests';
    case 'declared':
      return 'Almost ready';
    case 'blocked':
      return 'Blocked';
    case 'flagged':
      return 'Needs review';
    default:
      return 'Setup incomplete';
  }
}

function getReadinessHints(params: {
  hasSpareHelmet: boolean;
  plateNumber: string;
  vehicleType: VehicleType | null;
}): string[] {
  const hints: string[] = [];

  if (!params.vehicleType) {
    hints.push('Choose an active vehicle type.');
  }

  if (!params.plateNumber.trim()) {
    hints.push('Fill in the active vehicle plate number.');
  }

  if (params.vehicleType === 'motor' && !params.hasSpareHelmet) {
    hints.push('Mark spare helmet as ready for motor bookings.');
  }

  return hints;
}

function getActiveVehicle(profile: UserProfile | null | undefined) {
  return profile?.vehicles?.find(vehicle => vehicle.isActiveForBooking);
}

export function BasicProfileScreen({
  activeRole,
  existingProfile,
  onSubmit,
  submitError,
}: BasicProfileScreenProps): React.JSX.Element {
  const [displayName, setDisplayName] = useState(existingProfile?.displayName ?? '');
  const [hasSpareHelmet, setHasSpareHelmet] = useState(
    existingProfile?.hasSpareHelmet ?? false,
  );
  const [phoneInput, setPhoneInput] = useState('');
  const [plateNumber, setPlateNumber] = useState(
    getActiveVehicle(existingProfile)?.plateNumber ?? '',
  );
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(
    getActiveVehicle(existingProfile)?.vehicleType ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const readinessHints = getReadinessHints({
    hasSpareHelmet,
    plateNumber,
    vehicleType,
  });

  useEffect(() => {
    const activeVehicle = getActiveVehicle(existingProfile);

    setDisplayName(existingProfile?.displayName ?? '');
    setHasSpareHelmet(existingProfile?.hasSpareHelmet ?? false);
    setPhoneInput('');
    setPlateNumber(activeVehicle?.plateNumber ?? '');
    setVehicleType(activeVehicle?.vehicleType ?? null);
  }, [existingProfile?.updatedAt]);

  useEffect(() => {
    if (activeRole !== 'mitra' || !existingProfile) {
      setSaveFeedback(null);
      return;
    }

    setSaveFeedback(
      `Last saved readiness: ${getReadinessLabel(
        existingProfile.driverReadinessStatus,
      )}.`,
    );
  }, [
    activeRole,
    existingProfile?.driverReadinessStatus,
    existingProfile?.updatedAt,
  ]);

  async function handleSubmit() {
    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const payload: {
        displayName: string;
        hasSpareHelmet?: boolean;
        phoneInput: string;
        plateNumber?: string;
        vehicleType?: VehicleType;
      } = {
        displayName,
        phoneInput,
      };

      if (activeRole === 'mitra') {
        payload.hasSpareHelmet = hasSpareHelmet;

        if (plateNumber.trim()) {
          payload.plateNumber = plateNumber;
        }

        if (vehicleType) {
          payload.vehicleType = vehicleType;
        }
      }

      await onSubmit(payload);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard
      eyebrow="Profile"
      title={existingProfile ? 'Edit local identity' : 'Create your local identity'}
      description="Carrier stores the minimum profile locally first. Full phone number stays in secure storage and only masked data reaches operational storage."
    >
      <View style={styles.form}>
        <AppText tone="muted">
          Active role for this setup: {activeRole === 'customer' ? 'Customer' : 'Mitra'}
        </AppText>
        <AppInput
          autoCapitalize="words"
          label="Display name"
          onChangeText={setDisplayName}
          placeholder="Nama yang tampil di aplikasi"
          value={displayName}
        />
        <AppInput
          keyboardType="phone-pad"
          label="Phone number"
          onChangeText={setPhoneInput}
          placeholder={
            existingProfile ? 'Leave blank to keep the current number' : '08xxxxxxxxxx'
          }
          value={phoneInput}
        />
        {activeRole === 'mitra' ? (
          <>
            <AppText tone="muted">
              Driver readiness:{' '}
              {getReadinessLabel(existingProfile?.driverReadinessStatus)}
            </AppText>
            {readinessHints.length ? (
              <View style={styles.hintList}>
                {readinessHints.map(item => (
                  <AppText key={item} tone="muted">
                    - {item}
                  </AppText>
                ))}
              </View>
            ) : (
              <AppText tone="muted">
                Current setup meets the minimum readiness inputs for mitra flow.
              </AppText>
            )}
            {saveFeedback ? <AppText>{saveFeedback}</AppText> : null}
            <AppText tone="muted">Active vehicle</AppText>
            <View style={styles.optionRow}>
              {(['motor', 'mobil', 'bajaj', 'angkot'] as VehicleType[]).map(
                option => (
                  <Pressable
                    key={option}
                    onPress={() => setVehicleType(option)}
                    style={[
                      styles.optionChip,
                      vehicleType === option ? styles.optionChipActive : null,
                    ]}
                  >
                    <AppText
                      style={
                        vehicleType === option ? styles.optionChipTextActive : undefined
                      }
                    >
                      {option}
                    </AppText>
                  </Pressable>
                ),
              )}
            </View>
            <AppInput
              autoCapitalize="characters"
              label="Plate number"
              onChangeText={setPlateNumber}
              placeholder="B 1234 XYZ"
              value={plateNumber}
            />
            <Pressable
              onPress={() => setHasSpareHelmet(value => !value)}
              style={[
                styles.optionChip,
                hasSpareHelmet ? styles.optionChipActive : null,
              ]}
            >
              <AppText
                style={hasSpareHelmet ? styles.optionChipTextActive : undefined}
              >
                {hasSpareHelmet ? 'Spare helmet ready' : 'Needs spare helmet'}
              </AppText>
            </Pressable>
          </>
        ) : null}
        {submitError ? <AppText>{submitError}</AppText> : null}
        <AppButton
          label={
            isSaving
              ? 'Saving...'
              : existingProfile
                ? 'Update profile'
                : 'Save profile'
          }
          onPress={() => {
            void handleSubmit();
          }}
        />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  hintList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.color.surface,
  },
  optionChipActive: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  optionChipTextActive: {
    color: tokens.color.primaryForeground,
  },
});
