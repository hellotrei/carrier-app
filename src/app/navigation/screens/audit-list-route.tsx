import React from 'react';

import {
  buildAuditBundleFiles,
  exportAuditBundlePreview,
} from '../../../application/order/export-audit-bundle-preview';
import { AuditScreen } from '../../../features/audit/screens/audit-screen';
import { useExportStore } from '../../../state/export/export-store';
import { useHistoryStore } from '../../../state/history/history-store';

type AuditListRouteProps = {
  onBack: () => void;
  onOpenExportPreview: () => void;
};

export function AuditListRoute({
  onBack,
  onOpenExportPreview,
}: AuditListRouteProps): React.JSX.Element {
  const auditEvents = useHistoryStore(state => state.auditEvents);
  const resetAuditExportState = useExportStore(
    state => state.resetAuditExportState,
  );
  const setAuditBundleFiles = useExportStore(state => state.setAuditBundleFiles);
  const setAuditExportPreview = useExportStore(
    state => state.setAuditExportPreview,
  );

  return (
    <AuditScreen
      events={auditEvents}
      onBack={onBack}
      onPreviewExport={events => {
        resetAuditExportState();
        setAuditBundleFiles(buildAuditBundleFiles(events));
        setAuditExportPreview(exportAuditBundlePreview(events));
        onOpenExportPreview();
      }}
    />
  );
}
