import React from 'react';
import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';
import { AppText } from '../primitives/app-text';

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: SectionCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <AppText variant="eyebrow">{eyebrow}</AppText>
      <AppText variant="title">{title}</AppText>
      <AppText tone="muted">{description}</AppText>
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  children: {
    marginTop: tokens.spacing.xs,
    gap: tokens.spacing.sm,
  },
});
