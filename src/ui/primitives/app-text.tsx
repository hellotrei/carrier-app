import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { tokens } from '../theme/tokens';

type AppTextProps = TextProps & {
  children: React.ReactNode;
  tone?: 'default' | 'muted';
  variant?: 'body' | 'eyebrow' | 'title';
};

export function AppText({
  children,
  style,
  tone = 'default',
  variant = 'body',
  ...props
}: AppTextProps): React.JSX.Element {
  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], styles[tone], style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: tokens.color.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: tokens.color.primary,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  default: {
    color: tokens.color.text,
  },
  muted: {
    color: tokens.color.textMuted,
  },
});
