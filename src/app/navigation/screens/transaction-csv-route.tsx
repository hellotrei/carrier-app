import React from 'react';

import { TransactionLogCsvScreen } from '../../../features/history/screens/transaction-log-csv-screen';
import { useExportStore } from '../../../state/export/export-store';

type TransactionCsvRouteProps = {
  onBack: () => void;
  onExport: () => Promise<void>;
  onOpenExportedFile: () => Promise<void>;
  onShareExportedFile: () => Promise<void>;
};

export function TransactionCsvRoute({
  onBack,
  onExport,
  onOpenExportedFile,
  onShareExportedFile,
}: TransactionCsvRouteProps): React.JSX.Element {
  const transactionCsvPreview = useExportStore(
    state => state.transactionCsvPreview,
  );
  const transactionCsvExportError = useExportStore(
    state => state.transactionCsvExportError,
  );
  const transactionCsvExportPath = useExportStore(
    state => state.transactionCsvExportPath,
  );

  return (
    <TransactionLogCsvScreen
      csvContent={transactionCsvPreview}
      exportError={transactionCsvExportError}
      exportedFilePath={transactionCsvExportPath}
      onBack={onBack}
      onExport={onExport}
      onOpenExportedFile={onOpenExportedFile}
      onShareExportedFile={onShareExportedFile}
    />
  );
}
