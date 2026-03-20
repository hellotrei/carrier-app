import React from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { tokens } from '../theme/tokens';
import { AppText } from './app-text';

type AppInputProps = TextInputProps & {
  label: string;
};

export function AppInput({
  label,
  style,
  ...props
}: AppInputProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <AppText tone="muted">{label}</AppText>
      <TextInput
        placeholderTextColor={tokens.color.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: tokens.spacing.xs,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.surface,
    color: tokens.color.text,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
});
