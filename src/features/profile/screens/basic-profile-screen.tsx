import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AppRole } from '../../../core/types/app-role';
import type { VehicleType } from '../../../domain/user/user-profile';
import { tokens } from '../../../ui/theme/tokens';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppInput } from '../../../ui/primitives/app-input';
import { AppText } from '../../../ui/primitives/app-text';

type BasicProfileScreenProps = {
  activeRole: AppRole;
  onSubmit: (params: {
    displayName: string;
    hasSpareHelmet?: boolean;
    phoneInput: string;
    plateNumber?: string;
    vehicleType?: VehicleType;
  }) => Promise<void>;
  submitError?: string | null;
};

export function BasicProfileScreen({
  activeRole,
  onSubmit,
  submitError,
}: BasicProfileScreenProps): React.JSX.Element {
  const [displayName, setDisplayName] = useState('');
  const [hasSpareHelmet, setHasSpareHelmet] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    setIsSaving(true);

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
      title="Create your local identity"
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
          placeholder="08xxxxxxxxxx"
          value={phoneInput}
        />
        {activeRole === 'mitra' ? (
          <>
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
          label={isSaving ? 'Saving...' : 'Save profile'}
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
