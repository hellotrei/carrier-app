import React from 'react';

import { SectionCard } from '../../../ui/patterns/section-card';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type TransactionLogCsvScreenProps = {
  csvContent: string;
  exportError?: string | null;
  exportedFilePath?: string | null;
  onBack: () => void;
  onExport: () => Promise<void>;
  onOpenExportedFile: () => Promise<void>;
  onShareExportedFile: () => Promise<void>;
};

export function TransactionLogCsvScreen({
  csvContent,
  exportError,
  exportedFilePath,
  onBack,
  onExport,
  onOpenExportedFile,
  onShareExportedFile,
}: TransactionLogCsvScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="CSV Preview"
      title="Transaction log export preview"
      description="CSV columns are stabilized here before the log is written as a device file export."
    >
      {csvContent ? <AppText tone="muted">{csvContent}</AppText> : (
        <UiStateCard
          title="No CSV rows yet"
          description="Exportable rows will appear here after at least one completed trip writes a transaction log."
        />
      )}
      {exportedFilePath ? (
        <AppText tone="muted">Exported file: {exportedFilePath}</AppText>
      ) : null}
      {exportError ? (
        <UiStateCard
          title="CSV export failed"
          description={exportError}
          tone="warning"
        />
      ) : null}
      <AppButton label="Export CSV file" onPress={() => {
        void onExport();
      }} />
      {exportedFilePath ? (
        <AppButton
          label="Open exported file"
          kind="secondary"
          onPress={() => {
            void onOpenExportedFile();
          }}
        />
      ) : null}
      {exportedFilePath ? (
        <AppButton
          label="Share exported file"
          kind="secondary"
          onPress={() => {
            void onShareExportedFile();
          }}
        />
      ) : null}
      <AppButton label="Back to history" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
