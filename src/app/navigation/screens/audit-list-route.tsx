import React from 'react';

import { AuditScreen } from '../../../features/audit/screens/audit-screen';
import { prepareAuditExportPreview } from '../../../state/export/export-actions';
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

  return (
    <AuditScreen
      events={auditEvents}
      onBack={onBack}
      onPreviewExport={events => {
        prepareAuditExportPreview(events);
        onOpenExportPreview();
      }}
    />
  );
}
