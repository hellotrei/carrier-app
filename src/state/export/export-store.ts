import { create } from 'zustand';

type ExportStore = {
  auditBundleFiles: Record<string, string>;
  auditExportError: string | null;
  auditExportPath: string | null;
  auditExportPreview: string;
  resetAuditExportState: () => void;
  resetTransactionCsvState: () => void;
  setAuditBundleFiles: (files: Record<string, string>) => void;
  setAuditExportError: (error: string | null) => void;
  setAuditExportPath: (path: string | null) => void;
  setAuditExportPreview: (preview: string) => void;
  setTransactionCsvExportError: (error: string | null) => void;
  setTransactionCsvExportPath: (path: string | null) => void;
  setTransactionCsvPreview: (preview: string) => void;
  transactionCsvExportError: string | null;
  transactionCsvExportPath: string | null;
  transactionCsvPreview: string;
};

export const useExportStore = create<ExportStore>(set => ({
  auditBundleFiles: {},
  auditExportError: null,
  auditExportPath: null,
  auditExportPreview: '',
  resetAuditExportState: () =>
    set({
      auditBundleFiles: {},
      auditExportError: null,
      auditExportPath: null,
      auditExportPreview: '',
    }),
  resetTransactionCsvState: () =>
    set({
      transactionCsvExportError: null,
      transactionCsvExportPath: null,
      transactionCsvPreview: '',
    }),
  setAuditBundleFiles: auditBundleFiles => set({ auditBundleFiles }),
  setAuditExportError: auditExportError => set({ auditExportError }),
  setAuditExportPath: auditExportPath => set({ auditExportPath }),
  setAuditExportPreview: auditExportPreview => set({ auditExportPreview }),
  setTransactionCsvExportError: transactionCsvExportError =>
    set({ transactionCsvExportError }),
  setTransactionCsvExportPath: transactionCsvExportPath =>
    set({ transactionCsvExportPath }),
  setTransactionCsvPreview: transactionCsvPreview =>
    set({ transactionCsvPreview }),
  transactionCsvExportError: null,
  transactionCsvExportPath: null,
  transactionCsvPreview: '',
}));
