import React from 'react';

import {
  sanitizeFilePathPreview,
  sanitizeJsonPreview,
} from '../../../core/errors/sanitize-display-value';
import { SectionCard } from '../../../ui/patterns/section-card';
import { UiStateCard } from '../../../ui/patterns/ui-state-card';
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
      description="This preview shows the bundle payload that will be written into the exported .carrieraudit archive."
    >
      {previewContent ? <AppText tone="muted">{sanitizeJsonPreview(previewContent)}</AppText> : (
        <UiStateCard
          title="No audit payload yet"
          description="The export bundle preview will appear here after at least one audit event is available."
        />
      )}
      {exportedFilePath ? (
        <AppText tone="muted">
          Exported file: {sanitizeFilePathPreview(exportedFilePath)}
        </AppText>
      ) : null}
      {exportError ? (
        <UiStateCard
          title="Audit export failed"
          description={exportError}
          tone="warning"
        />
      ) : null}
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
