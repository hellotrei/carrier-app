import React from 'react';
import { View } from 'react-native';

import { AppButton } from '../../ui/primitives/app-button';
import { AppScreen } from '../../ui/primitives/app-screen';
import { AppText } from '../../ui/primitives/app-text';
import { SectionCard } from '../../ui/patterns/section-card';
import type { Order, OrderCancelReason } from '../../domain/order/order';
import { bootstrapDeps } from '../config/bootstrap-deps';
import { saveProfile } from '../../application/user/save-profile';
import { advanceOrderStatus } from '../../application/order/advance-order-status';
import { cancelOrder } from '../../application/order/cancel-order';
import { createOrderDraft } from '../../application/order/create-order-draft';
import { exportAuditBundlePreview } from '../../application/order/export-audit-bundle-preview';
import { exportTransactionLogCsv } from '../../application/order/export-transaction-log-csv';
import { guardExportWithDeviceAuth } from '../../application/order/guard-export-with-device-auth';
import { savePostTripFeedback } from '../../application/order/save-post-trip-feedback';
import { submitOrderDraft } from '../../application/order/submit-order-draft';
import { ActiveTripScreen } from '../../features/active-trip/screens/active-trip-screen';
import { AuditExportPreviewScreen } from '../../features/audit/screens/audit-export-preview-screen';
import { AuditScreen } from '../../features/audit/screens/audit-screen';
import { PostTripFeedbackScreen } from '../../features/feedback/screens/post-trip-feedback-screen';
import { HomeCustomerScreen } from '../../features/home-customer/screens/home-customer-screen';
import { HistoryDetailScreen } from '../../features/history/screens/history-detail-screen';
import { HistoryScreen } from '../../features/history/screens/history-screen';
import { TransactionLogCsvScreen } from '../../features/history/screens/transaction-log-csv-screen';
import { HomeMitraScreen } from '../../features/home-mitra/screens/home-mitra-screen';
import { BasicProfileScreen } from '../../features/profile/screens/basic-profile-screen';
import { useAppStore } from '../../state/store/app-store';
import { RecoveryBanner } from '../../ui/patterns/recovery-banner';

export function RootNavigation(): React.JSX.Element {
  const activeOrder = useAppStore(state => state.activeOrder);
  const activeRole = useAppStore(state => state.activeRole);
  const bootstrapDone = useAppStore(state => state.bootstrapDone);
  const deviceBindingPresent = useAppStore(state => state.deviceBindingPresent);
  const profile = useAppStore(state => state.profile);
  const setDeviceBindingPresent = useAppStore(
    state => state.setDeviceBindingPresent,
  );
  const setActiveOrder = useAppStore(state => state.setActiveOrder);
  const setActiveRole = useAppStore(state => state.setActiveRole);
  const setProfile = useAppStore(state => state.setProfile);
  const [activeScreen, setActiveScreen] = React.useState<
    'home' | 'active_trip' | 'history_list' | 'history_detail' | 'post_trip_feedback' | 'audit_list' | 'transaction_csv' | 'audit_export_preview'
  >('home');
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = React.useState<'all' | 'completed' | 'canceled'>('all');
  const [historyOrders, setHistoryOrders] = React.useState<Awaited<
    ReturnType<typeof bootstrapDeps.orderRepository.listHistory>
  >>([]);
  const [selectedHistoryOrderId, setSelectedHistoryOrderId] = React.useState<string | null>(null);
  const [selectedCompletedOrder, setSelectedCompletedOrder] = React.useState<Order | null>(null);
  const [transactionLogs, setTransactionLogs] = React.useState<Awaited<
    ReturnType<typeof bootstrapDeps.transactionLogRepository.listLogs>
  >>([]);
  const [auditEvents, setAuditEvents] = React.useState<Awaited<
    ReturnType<typeof bootstrapDeps.auditRepository.listEvents>
  >>([]);
  const [transactionCsvPreview, setTransactionCsvPreview] = React.useState('');
  const [transactionCsvExportError, setTransactionCsvExportError] = React.useState<string | null>(null);
  const [transactionCsvExportPath, setTransactionCsvExportPath] = React.useState<string | null>(null);
  const [auditExportPreview, setAuditExportPreview] = React.useState('');
  const [auditExportError, setAuditExportError] = React.useState<string | null>(null);
  const [auditExportPath, setAuditExportPath] = React.useState<string | null>(null);

  async function handleRoleChange(role: 'customer' | 'mitra') {
    setActiveRole(role);
  }

  async function loadHistory(filter: 'all' | 'completed' | 'canceled') {
    const [orders, logs, events] = await Promise.all([
      bootstrapDeps.orderRepository.listHistory(filter),
      bootstrapDeps.transactionLogRepository.listLogs(),
      bootstrapDeps.auditRepository.listEvents(),
    ]);

    setHistoryOrders(orders);
    setTransactionLogs(logs);
    setAuditEvents(events);
  }

  async function handleProfileSubmit(params: {
    displayName: string;
    hasSpareHelmet?: boolean;
    phoneInput: string;
    plateNumber?: string;
    vehicleType?: 'motor' | 'mobil' | 'bajaj' | 'angkot';
  }) {
    const payload: {
      currentRole: typeof activeRole;
      displayName: string;
      hasSpareHelmet?: boolean;
      phoneInput: string;
      plateNumber?: string;
      vehicleType?: 'motor' | 'mobil' | 'bajaj' | 'angkot';
    } = {
      currentRole: activeRole,
      displayName: params.displayName,
      phoneInput: params.phoneInput,
    };

    if (params.hasSpareHelmet !== undefined) {
      payload.hasSpareHelmet = params.hasSpareHelmet;
    }

    if (params.plateNumber) {
      payload.plateNumber = params.plateNumber;
    }

    if (params.vehicleType) {
      payload.vehicleType = params.vehicleType;
    }

    const result = await saveProfile(bootstrapDeps, payload);

    if (!result.ok) {
      const errorMap: Record<typeof result.error.code, string> = {
        DISPLAY_NAME_REQUIRED: 'Display name is required.',
        PHONE_REQUIRED: 'Phone number is required.',
        VEHICLE_TYPE_REQUIRED: 'Vehicle type is required for mitra.',
      };

      setSubmitError(errorMap[result.error.code]);
      return;
    }

    setSubmitError(null);
    setActiveRole(result.value.profile.currentRole);
    setProfile(result.value.profile);
    setDeviceBindingPresent(Boolean(result.value.deviceBindingId));
  }

  async function handleCreateDraft(params: {
    destinationLabel: string;
    estimatedPrice: string;
    pickupLabel: string;
  }) {
    if (!profile || (activeOrder && activeOrder.status !== 'Draft')) {
      return;
    }

    const result = await createOrderDraft(bootstrapDeps, {
      destination: {
        label: params.destinationLabel,
        latitude: -6.2,
        longitude: 106.816666,
        source: 'manual',
      },
      estimatedPrice: Number(params.estimatedPrice),
      pickup: {
        label: params.pickupLabel,
        latitude: -6.175392,
        longitude: 106.827153,
        source: 'manual',
      },
      profile,
    });

    if (!result.ok) {
      const errorMap: Record<typeof result.error.code, string> = {
        INVALID_DESTINATION: 'Destination is required.',
        INVALID_ESTIMATED_PRICE: 'Estimated price must be greater than zero.',
        INVALID_PICKUP: 'Pickup is required.',
        PROFILE_NOT_FOUND: 'Profile is required before creating a draft.',
      };

      setDraftError(errorMap[result.error.code]);
      return;
    }

    setDraftError(null);
    setActiveOrder(result.value);
    setActiveScreen('active_trip');
  }

  async function handleAdvanceOrder(nextStatus: Parameters<
    typeof advanceOrderStatus
  >[2]) {
    if (!activeOrder) {
      return;
    }

    if (activeOrder.status === 'Draft' && nextStatus === 'Requested') {
      const submitResult = await submitOrderDraft(bootstrapDeps, activeOrder);

      if (!submitResult.ok) {
        return;
      }

      setDraftError(null);
      setActiveOrder(submitResult.value);
      return;
    }

    const result = await advanceOrderStatus(bootstrapDeps, activeOrder, nextStatus);

    if (!result.ok) {
      return;
    }

    setDraftError(null);
    if (result.value.isTerminal) {
      setActiveOrder(null);
      setHistoryFilter('all');
      if (result.value.order.status === 'Completed') {
        setSelectedCompletedOrder(result.value.order);
        setActiveScreen(
          activeRole === 'customer' ? 'post_trip_feedback' : 'history_detail',
        );
        setSelectedHistoryOrderId(result.value.order.orderId);
        await loadHistory('all');
        return;
      }

      setSelectedCompletedOrder(null);
      setSelectedHistoryOrderId(result.value.order.orderId);
      await loadHistory('all');
      setActiveScreen('history_detail');
      return;
    }

    setActiveOrder(result.value.order);
  }

  async function handleCancelOrder(reason: OrderCancelReason) {
    if (!activeOrder) {
      return;
    }

    const result = await cancelOrder(bootstrapDeps, activeOrder, reason);

    if (!result.ok) {
      return;
    }

    if (result.value.isTerminal) {
      setActiveOrder(null);
      setSelectedCompletedOrder(null);
      setHistoryFilter('all');
      setSelectedHistoryOrderId(result.value.order.orderId);
      await loadHistory('all');
      setActiveScreen('history_detail');
      return;
    }

    setActiveOrder(result.value.order);
  }

  async function handleClearDraft() {
    if (!activeOrder || activeOrder.status !== 'Draft') {
      return;
    }

    const result = await cancelOrder(bootstrapDeps, activeOrder, 'other');

    if (!result.ok) {
      return;
    }

    setDraftError(null);
    setActiveOrder(null);
    setActiveScreen('home');
  }

  async function handleOpenHistory() {
    await loadHistory(historyFilter);
    setActiveScreen('history_list');
  }

  async function handleExportTransactionCsv() {
    try {
      await guardExportWithDeviceAuth(
        bootstrapDeps,
        'Authenticate to export transaction log CSV',
      );

      const path = await bootstrapDeps.fileExportGateway.writeExportFile({
        content: transactionCsvPreview,
        extension: 'csv',
        prefix: 'transaction-log-export',
      });

      setTransactionCsvExportError(null);
      setTransactionCsvExportPath(path);
    } catch (error) {
      setTransactionCsvExportError(
        error instanceof Error ? error.message : 'CSV export failed.',
      );
    }
  }

  async function handleExportAuditBundle() {
    try {
      await guardExportWithDeviceAuth(
        bootstrapDeps,
        'Authenticate to export audit bundle',
      );

      const path = await bootstrapDeps.fileExportGateway.writeExportFile({
        content: auditExportPreview,
        extension: 'carrieraudit',
        prefix: 'audit-export',
      });

      setAuditExportError(null);
      setAuditExportPath(path);
    } catch (error) {
      setAuditExportError(
        error instanceof Error ? error.message : 'Audit export failed.',
      );
    }
  }

  async function handleSaveFeedback(params: {
    manualRating?: number;
    reviewText?: string;
  }) {
    if (!selectedCompletedOrder) {
      return;
    }

    const result = await savePostTripFeedback(bootstrapDeps, selectedCompletedOrder, params);

    if (!result.ok) {
      return;
    }

    setSelectedCompletedOrder(result.value);
    setSelectedHistoryOrderId(result.value.orderId);
    await loadHistory(historyFilter);
    setActiveScreen('history_detail');
  }

  const selectedHistoryOrder = historyOrders.find(
    order => order.orderId === selectedHistoryOrderId,
  ) ??
    (selectedCompletedOrder && selectedCompletedOrder.orderId === selectedHistoryOrderId
      ? selectedCompletedOrder
      : null);
  const selectedHistoryTransactionLog = transactionLogs.find(
    log => log.orderId === selectedHistoryOrderId,
  );

  return (
    <AppScreen scrollable>
      <SectionCard
        eyebrow="Carrier"
        title="Scaffold baseline is ready"
        description="This shell keeps the boundary between UI, feature flow, domain logic, and data IO explicit from day one."
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <AppButton
            label="Customer"
            onPress={() => {
              void handleRoleChange('customer');
            }}
            kind={activeRole === 'customer' ? 'primary' : 'secondary'}
          />
          <AppButton
            label="Mitra"
            onPress={() => {
              void handleRoleChange('mitra');
            }}
            kind={activeRole === 'mitra' ? 'primary' : 'secondary'}
          />
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Architecture"
        title="Current active shell"
        description="Role switching lives in the app layer, while feature surfaces stay isolated."
      >
        <AppText tone="muted">
          Active role: {activeRole === 'customer' ? 'Customer' : 'Mitra'}
        </AppText>
        <AppText tone="muted">
          Bootstrap: {bootstrapDone ? 'Done' : 'Pending'}
        </AppText>
        <AppText tone="muted">
          Device binding: {deviceBindingPresent ? 'Present' : 'Missing'}
        </AppText>
        <AppText tone="muted">
          Profile: {profile ? profile.displayName : 'Not created yet'}
        </AppText>
        <AppText tone="muted">
          Driver readiness:{' '}
          {profile?.driverReadinessStatus ?? 'Not evaluated yet'}
        </AppText>
        <AppText tone="muted">
          Active order: {activeOrder ? activeOrder.status : 'None'}
        </AppText>
        <AppButton label="Open history" kind="secondary" onPress={() => {
          void handleOpenHistory();
        }} />
      </SectionCard>

      {activeOrder ? (
        <RecoveryBanner
          onResume={() => {
            setActiveScreen('active_trip');
          }}
          order={activeOrder}
        />
      ) : null}

      <BasicProfileScreen
        activeRole={activeRole}
        existingProfile={profile}
        onSubmit={handleProfileSubmit}
        submitError={submitError}
      />

      {activeScreen === 'history_list' ? (
        <HistoryScreen
          filter={historyFilter}
          onBack={() => {
            setActiveScreen('home');
          }}
          onChangeFilter={nextFilter => {
            setHistoryFilter(nextFilter);
            void loadHistory(nextFilter);
          }}
          onOpenAudit={() => {
            setActiveScreen('audit_list');
          }}
          onOpenTransactionCsv={() => {
            setTransactionCsvPreview(exportTransactionLogCsv(transactionLogs));
            setTransactionCsvExportError(null);
            setTransactionCsvExportPath(null);
            setActiveScreen('transaction_csv');
          }}
          onOpenOrder={orderId => {
            setSelectedHistoryOrderId(orderId);
            setActiveScreen('history_detail');
          }}
          orders={historyOrders}
          transactionLogs={transactionLogs}
        />
      ) : null}

      {activeScreen === 'transaction_csv' ? (
        <TransactionLogCsvScreen
          csvContent={transactionCsvPreview}
          exportError={transactionCsvExportError}
          exportedFilePath={transactionCsvExportPath}
          onBack={() => {
            setActiveScreen('history_list');
          }}
          onExport={handleExportTransactionCsv}
        />
      ) : null}

      {activeScreen === 'audit_list' ? (
        <AuditScreen
          events={auditEvents}
          onBack={() => {
            setActiveScreen('history_list');
          }}
          onPreviewExport={events => {
            setAuditExportPreview(exportAuditBundlePreview(events));
            setAuditExportError(null);
            setAuditExportPath(null);
            setActiveScreen('audit_export_preview');
          }}
        />
      ) : null}

      {activeScreen === 'audit_export_preview' ? (
        <AuditExportPreviewScreen
          exportError={auditExportError}
          exportedFilePath={auditExportPath}
          onBack={() => {
            setActiveScreen('audit_list');
          }}
          onExport={handleExportAuditBundle}
          previewContent={auditExportPreview}
        />
      ) : null}

      {activeScreen === 'post_trip_feedback' && selectedCompletedOrder ? (
        <PostTripFeedbackScreen
          onSkip={() => {
            setSelectedHistoryOrderId(selectedCompletedOrder.orderId);
            setActiveScreen('history_detail');
          }}
          onSubmit={handleSaveFeedback}
          order={selectedCompletedOrder}
        />
      ) : null}

      {activeScreen === 'history_detail' && selectedHistoryOrder ? (
        <HistoryDetailScreen
          onBack={() => {
            setActiveScreen('history_list');
          }}
          onOpenFeedback={
            selectedHistoryOrder.status === 'Completed'
              ? () => {
                  setSelectedCompletedOrder(selectedHistoryOrder);
                  setActiveScreen('post_trip_feedback');
                }
              : undefined
          }
          order={selectedHistoryOrder}
          transactionLog={selectedHistoryTransactionLog}
        />
      ) : null}

      {profile && activeScreen === 'active_trip' && activeOrder ? (
        <ActiveTripScreen
          activeRole={activeRole}
          onAdvance={nextStatus => {
            void handleAdvanceOrder(nextStatus);
          }}
          onBack={() => {
            setActiveScreen('home');
          }}
          onCancel={reason => {
            void handleCancelOrder(reason);
          }}
          order={activeOrder}
        />
      ) : null}

      {profile && activeScreen === 'home'
        ? activeRole === 'customer'
          ? (
              <HomeCustomerScreen
                activeOrderStatus={
                  activeOrder && activeOrder.status !== 'Canceled' &&
                  activeOrder.status !== 'Completed' &&
                  activeOrder.status !== 'Rejected' &&
                  activeOrder.status !== 'Expired'
                    ? activeOrder.status
                    : undefined
                }
                activeOrderSummary={
                  activeOrder
                    ? {
                        destinationLabel: activeOrder.destination.label ?? '',
                        estimatedPrice: String(activeOrder.estimatedPrice),
                        pickupLabel: activeOrder.pickup.label ?? '',
                      }
                    : undefined
                }
                initialDraftValues={
                  activeOrder?.status === 'Draft'
                    ? {
                        destinationLabel: activeOrder.destination.label ?? '',
                        estimatedPrice: String(activeOrder.estimatedPrice),
                        pickupLabel: activeOrder.pickup.label ?? '',
                      }
                    : undefined
                }
                lastUpdatedHint={
                  activeOrder
                    ? activeOrder.status === 'Draft'
                      ? `Draft last updated: ${activeOrder.updatedAt}.`
                      : `Last status update: ${activeOrder.statusUpdatedAt}.`
                    : undefined
                }
                onClearDraft={
                  activeOrder?.status === 'Draft'
                    ? () => {
                        void handleClearDraft();
                      }
                    : undefined
                }
                onCreateDraft={handleCreateDraft}
                submitError={draftError}
              />
            )
          : (
              <HomeMitraScreen
                onOpenRequest={
                  activeOrder?.status === 'Requested'
                    ? () => {
                        setActiveScreen('active_trip');
                      }
                    : undefined
                }
                onReviewProfile={() => {
                  setActiveScreen('home');
                }}
                profile={profile}
                requestedOrder={
                  activeOrder?.status === 'Requested' ? activeOrder : undefined
                }
              />
            )
        : null}
    </AppScreen>
  );
}
