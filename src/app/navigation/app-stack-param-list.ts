export type AppStackParamList = {
  ActiveTrip: undefined;
  AuditExportPreview: undefined;
  AuditList: undefined;
  HistoryDetail: { orderId: string };
  HistoryList: undefined;
  Home: undefined;
  PostTripFeedback: { orderId: string };
  TransactionCsv: undefined;
};

export type RootScreen =
  | 'home'
  | 'active_trip'
  | 'history_list'
  | 'history_detail'
  | 'post_trip_feedback'
  | 'audit_list'
  | 'transaction_csv'
  | 'audit_export_preview';
