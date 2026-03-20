import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { AppRole } from '../../../core/types/app-role';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppInput } from '../../../ui/primitives/app-input';
import { AppText } from '../../../ui/primitives/app-text';

type BasicProfileScreenProps = {
  activeRole: AppRole;
  onSubmit: (params: { displayName: string; phoneInput: string }) => Promise<void>;
  submitError?: string | null;
};

export function BasicProfileScreen({
  activeRole,
  onSubmit,
  submitError,
}: BasicProfileScreenProps): React.JSX.Element {
  const [displayName, setDisplayName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    setIsSaving(true);

    try {
      await onSubmit({ displayName, phoneInput });
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
});
