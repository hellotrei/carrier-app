import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

type AppScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function AppScreen({
  children,
  scrollable = false,
}: AppScreenProps): React.JSX.Element {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.color.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
});
