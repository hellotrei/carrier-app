import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../primitives/app-button';
import { AppText } from '../primitives/app-text';
import { tokens } from '../theme/tokens';

type UiStateCardProps = {
  description: string;
  eyebrow?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  title: string;
  tone?: 'default' | 'warning';
};

export function UiStateCard({
  description,
  eyebrow,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  title,
  tone = 'default',
}: UiStateCardProps): React.JSX.Element {
  return (
    <View style={[styles.card, tone === 'warning' ? styles.warningCard : null]}>
      <AppText variant="eyebrow">
        {eyebrow ?? (tone === 'warning' ? 'Action Needed' : 'Nothing Saved Yet')}
      </AppText>
      <AppText style={styles.title}>{title}</AppText>
      <AppText tone="muted">{description}</AppText>
      {primaryActionLabel && onPrimaryAction ? (
        <AppButton label={primaryActionLabel} onPress={onPrimaryAction} />
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <AppButton
          kind="secondary"
          label={secondaryActionLabel}
          onPress={onSecondaryAction}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surfaceStrong,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  warningCard: {
    backgroundColor: tokens.color.surface,
  },
});
