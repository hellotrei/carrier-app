type ExportAsset = 'audit_bundle' | 'transaction_csv';
type ExportAction = 'export' | 'open' | 'share';

export function getExportStateErrorCopy(
  asset: ExportAsset,
  action: ExportAction,
): string {
  const assetLabel =
    asset === 'audit_bundle' ? 'audit bundle' : 'transaction log CSV';

  if (action === 'export') {
    return `Unable to export ${assetLabel}. Keep the current preview and try again.`;
  }

  if (action === 'open') {
    return `Unable to open the exported ${assetLabel}. The saved file path is still available for tracing.`;
  }

  return `Unable to share the exported ${assetLabel}. The saved file remains available on this device.`;
}
