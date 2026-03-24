import React from 'react';

import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type TransactionLogCsvScreenProps = {
  csvContent: string;
  onBack: () => void;
};

export function TransactionLogCsvScreen({
  csvContent,
  onBack,
}: TransactionLogCsvScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="CSV Preview"
      title="Transaction log export preview"
      description="CSV columns are stabilized here before file export is wired to a device filesystem flow."
    >
      <AppText tone="muted">{csvContent || 'No CSV rows available yet.'}</AppText>
      <AppButton label="Back to history" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
