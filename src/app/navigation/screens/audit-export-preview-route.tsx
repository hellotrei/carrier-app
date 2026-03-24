import React from 'react';

import { AuditExportPreviewScreen } from '../../../features/audit/screens/audit-export-preview-screen';
import { useExportStore } from '../../../state/export/export-store';

type AuditExportPreviewRouteProps = {
  onBack: () => void;
  onExport: () => Promise<void>;
  onOpenExportedFile: () => Promise<void>;
  onShareExportedFile: () => Promise<void>;
};

export function AuditExportPreviewRoute({
  onBack,
  onExport,
  onOpenExportedFile,
  onShareExportedFile,
}: AuditExportPreviewRouteProps): React.JSX.Element {
  const auditExportPreview = useExportStore(state => state.auditExportPreview);
  const auditExportError = useExportStore(state => state.auditExportError);
  const auditExportPath = useExportStore(state => state.auditExportPath);

  return (
    <AuditExportPreviewScreen
      exportError={auditExportError}
      exportedFilePath={auditExportPath}
      onBack={onBack}
      onExport={onExport}
      onOpenExportedFile={onOpenExportedFile}
      onShareExportedFile={onShareExportedFile}
      previewContent={auditExportPreview}
    />
  );
}
