import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { tokens } from '../theme/tokens';
import { AppText } from './app-text';

type AppButtonProps = {
  kind?: 'primary' | 'secondary';
  label: string;
  onPress: () => void;
};

export function AppButton({
  kind = 'primary',
  label,
  onPress,
}: AppButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        kind === 'primary' ? styles.primary : styles.secondary,
        pressed ? styles.pressed : null,
      ]}
    >
      <AppText
        style={kind === 'primary' ? styles.primaryText : styles.secondaryText}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  secondary: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
  },
  pressed: {
    opacity: 0.85,
  },
  primaryText: {
    color: tokens.color.primaryForeground,
    fontWeight: '700',
  },
  secondaryText: {
    color: tokens.color.text,
    fontWeight: '700',
  },
});
