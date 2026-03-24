import type { AppStackParamList } from './app-stack-param-list';

type ScreenOptionsConfig = {
  gestureEnabled: boolean;
  title: string;
};

export const appScreenOptions: Record<
  keyof AppStackParamList,
  ScreenOptionsConfig
> = {
  ActiveTrip: {
    gestureEnabled: false,
    title: 'Active Trip',
  },
  AuditExportPreview: {
    gestureEnabled: true,
    title: 'Audit Export',
  },
  AuditList: {
    gestureEnabled: true,
    title: 'Audit Manifest',
  },
  HistoryDetail: {
    gestureEnabled: true,
    title: 'Trip Detail',
  },
  HistoryList: {
    gestureEnabled: true,
    title: 'History',
  },
  Home: {
    gestureEnabled: false,
    title: 'Carrier',
  },
  PostTripFeedback: {
    gestureEnabled: true,
    title: 'Post-Trip Feedback',
  },
  TransactionCsv: {
    gestureEnabled: true,
    title: 'Transaction CSV',
  },
};
