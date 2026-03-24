import type { AppStackParamList, RootScreen } from './app-stack-param-list';

type StackRouteName = keyof AppStackParamList;

export function resolveStackRouteName(screen: RootScreen): StackRouteName {
  switch (screen) {
    case 'active_trip':
      return 'ActiveTrip';
    case 'audit_export_preview':
      return 'AuditExportPreview';
    case 'audit_list':
      return 'AuditList';
    case 'history_detail':
      return 'HistoryDetail';
    case 'history_list':
      return 'HistoryList';
    case 'post_trip_feedback':
      return 'PostTripFeedback';
    case 'transaction_csv':
      return 'TransactionCsv';
    case 'home':
    default:
      return 'Home';
  }
}
