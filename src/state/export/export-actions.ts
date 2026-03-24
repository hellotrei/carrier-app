import {
  buildAuditBundleFiles,
  exportAuditBundlePreview,
} from '../../application/order/export-audit-bundle-preview';
import { exportTransactionLogCsv } from '../../application/order/export-transaction-log-csv';
import type { AuditManifestEntry } from '../../data/repositories/audit-repository-port';
import type { TransactionLogEntry } from '../../data/repositories/transaction-log-repository-port';
import { useExportStore } from './export-store';

export function prepareTransactionCsvPreview(
  transactionLogs: TransactionLogEntry[],
) {
  useExportStore.setState({
    transactionCsvExportError: null,
    transactionCsvExportPath: null,
    transactionCsvPreview: exportTransactionLogCsv(transactionLogs),
  });
}

export function applyTransactionCsvExportSuccess(path: string) {
  useExportStore.setState({
    transactionCsvExportError: null,
    transactionCsvExportPath: path,
  });
}

export function applyTransactionCsvExportError(error: string) {
  useExportStore.setState({
    transactionCsvExportError: error,
  });
}

export function prepareAuditExportPreview(events: AuditManifestEntry[]) {
  useExportStore.setState({
    auditBundleFiles: buildAuditBundleFiles(events),
    auditExportError: null,
    auditExportPath: null,
    auditExportPreview: exportAuditBundlePreview(events),
  });
}

export function applyAuditExportSuccess(path: string) {
  useExportStore.setState({
    auditExportError: null,
    auditExportPath: path,
  });
}

export function applyAuditExportError(error: string) {
  useExportStore.setState({
    auditExportError: error,
  });
}
