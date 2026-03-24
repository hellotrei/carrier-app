import React from 'react';

import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';

type AuditExportPreviewScreenProps = {
  onBack: () => void;
  previewContent: string;
};

export function AuditExportPreviewScreen({
  onBack,
  previewContent,
}: AuditExportPreviewScreenProps): React.JSX.Element {
  return (
    <SectionCard
      eyebrow="Audit Export"
      title="Audit bundle preview"
      description="This preview shows the manifest payload that will back a future .carrieraudit bundle export."
    >
      <AppText tone="muted">{previewContent || 'No audit payload available.'}</AppText>
      <AppButton label="Back to audit" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}
