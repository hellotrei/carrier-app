import React from 'react';

import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type AuditExportPreviewScreenProps = {
  exportError?: string | null;
  exportedFilePath?: string | null;
  onBack: () => void;
  onExport: () => Promise<void>;
  onOpenExportedFile: () => Promise<void>;
  onShareExportedFile: () => Promise<void>;
  previewContent: string;
};

export function AuditExportPreviewScreen({
  exportError,
  exportedFilePath,
  onBack,
  onExport,
  onOpenExportedFile,
  onShareExportedFile,
  previewContent,
}: AuditExportPreviewScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="Audit Export"
      title="Audit bundle preview"
      description="This preview shows the manifest payload that will back a future .carrieraudit bundle export."
    >
      <AppText tone="muted">{previewContent || 'No audit payload available.'}</AppText>
      {exportedFilePath ? (
        <AppText tone="muted">Exported file: {exportedFilePath}</AppText>
      ) : null}
      {exportError ? <AppText>{exportError}</AppText> : null}
      <AppButton label="Export audit bundle" onPress={() => {
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
      <AppButton label="Back to audit" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
