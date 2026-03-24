import React from 'react';
import { AppState, View } from 'react-native';

import { sanitizeErrorMessage } from '../../core/errors/sanitize-error-message';
import { AppButton } from '../../ui/primitives/app-button';
import { AppScreen } from '../../ui/primitives/app-screen';
import { AppText } from '../../ui/primitives/app-text';
import { SectionCard } from '../../ui/patterns/section-card';
import { UiStateCard } from '../../ui/patterns/ui-state-card';
import type { Order, OrderCancelReason } from '../../domain/order/order';
import { bootstrapDeps } from '../config/bootstrap-deps';
import { saveProfile } from '../../application/user/save-profile';
import { advanceOrderStatus } from '../../application/order/advance-order-status';
import { cancelOrder } from '../../application/order/cancel-order';
import { createOrderDraft } from '../../application/order/create-order-draft';
import { guardExportWithDeviceAuth } from '../../application/order/guard-export-with-device-auth';
import { savePostTripFeedback } from '../../application/order/save-post-trip-feedback';
import { submitOrderDraft } from '../../application/order/submit-order-draft';
import { syncNotificationToken } from '../../application/user/sync-notification-token';
import {
  openExportedFile,
  shareExportedFile,
} from '../../integrations/file-export/file-export-actions';
import { openHardwarePermissionSettings } from '../../integrations/hardware-permission/hardware-permission-actions';
import { ActiveTripScreen } from '../../features/active-trip/screens/active-trip-screen';
import { AuditExportPreviewScreen } from '../../features/audit/screens/audit-export-preview-screen';
import { HomeCustomerScreen } from '../../features/home-customer/screens/home-customer-screen';
import { HomeMitraScreen } from '../../features/home-mitra/screens/home-mitra-screen';
import { getExportStateErrorCopy } from '../../features/order/export-state-copy';
import { BasicProfileScreen } from '../../features/profile/screens/basic-profile-screen';
import { getHasRecoverableOrder } from '../../state/app-shell/app-shell-selectors';
import { useAppShellStore } from '../../state/app-shell/app-shell-store';
import { useExportStore } from '../../state/export/export-store';
import { loadHistorySnapshot } from '../../state/history/history-actions';
import { useHistoryStore } from '../../state/history/history-store';
import { usePermissionStore } from '../../state/permission/permission-store';
import { HardwarePermissionCard } from '../../ui/patterns/hardware-permission-card';
import { RecoveryBanner } from '../../ui/patterns/recovery-banner';
import { AuditListRoute } from './screens/audit-list-route';
import { HistoryDetailRoute } from './screens/history-detail-route';
import { HistoryListRoute } from './screens/history-list-route';
import { PostTripFeedbackRoute } from './screens/post-trip-feedback-route';
import { TransactionCsvRoute } from './screens/transaction-csv-route';

export function RootNavigation(): React.JSX.Element {
  const activeOrder = useAppShellStore(state => state.activeOrder);
  const activeRole = useAppShellStore(state => state.activeRole);
  const bootstrapDone = useAppShellStore(state => state.bootstrapDone);
  const deviceBindingPresent = useAppShellStore(state => state.deviceBindingPresent);
  const profile = useAppShellStore(state => state.profile);
  const resumeTarget = useAppShellStore(state => state.resumeTarget);
  const setDeviceBindingPresent = useAppShellStore(
    state => state.setDeviceBindingPresent,
  );
  const setActiveOrder = useAppShellStore(state => state.setActiveOrder);
  const setActiveRole = useAppShellStore(state => state.setActiveRole);
  const setProfile = useAppShellStore(state => state.setProfile);
  const setSelectedHistoryOrderId = useHistoryStore(
    state => state.setSelectedHistoryOrderId,
  );
  const historyFilter = useHistoryStore(state => state.historyFilter);
  const auditExportPreview = useExportStore(state => state.auditExportPreview);
  const auditExportError = useExportStore(state => state.auditExportError);
  const auditExportPath = useExportStore(state => state.auditExportPath);
  const auditBundleFiles = useExportStore(state => state.auditBundleFiles);
  const setTransactionCsvExportError = useExportStore(
    state => state.setTransactionCsvExportError,
  );
  const setTransactionCsvExportPath = useExportStore(
    state => state.setTransactionCsvExportPath,
  );
  const setAuditExportError = useExportStore(state => state.setAuditExportError);
  const setAuditExportPath = useExportStore(state => state.setAuditExportPath);
  const locationPermissionStatus = usePermissionStore(
    state => state.locationPermissionStatus,
  );
  const notificationPermissionStatus = usePermissionStore(
    state => state.notificationPermissionStatus,
  );
  const notificationTokenPreview = usePermissionStore(
    state => state.notificationTokenPreview,
  );
  const setLocationPermissionStatus = usePermissionStore(
    state => state.setLocationPermissionStatus,
  );
  const setNotificationPermissionStatus = usePermissionStore(
    state => state.setNotificationPermissionStatus,
  );
  const setNotificationTokenPreview = usePermissionStore(
    state => state.setNotificationTokenPreview,
  );
  const [activeScreen, setActiveScreen] = React.useState<
    'home' | 'active_trip' | 'history_list' | 'history_detail' | 'post_trip_feedback' | 'audit_list' | 'transaction_csv' | 'audit_export_preview'
  >('home');
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [selectedCompletedOrder, setSelectedCompletedOrder] = React.useState<Order | null>(null);

  const loadHardwarePermissionState = React.useCallback(async () => {
    try {
      const [locationStatus, notificationStatus, notificationToken] =
        await Promise.all([
          bootstrapDeps.hardwarePermissionGateway.getLocationWhenInUseStatus(),
          bootstrapDeps.hardwarePermissionGateway.getNotificationStatus(),
          syncNotificationToken(bootstrapDeps),
        ]);

      setLocationPermissionStatus(locationStatus);
      setNotificationPermissionStatus(notificationStatus);
      setNotificationTokenPreview(
        notificationToken
          ? `${notificationToken.slice(0, 6)}...${notificationToken.slice(-4)}`
          : null,
      );
    } catch {
      setNotificationTokenPreview(null);
    }
  }, []);

  React.useEffect(() => {
    void loadHardwarePermissionState();
  }, [loadHardwarePermissionState]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void loadHardwarePermissionState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadHardwarePermissionState]);

  async function handleRoleChange(role: 'customer' | 'mitra') {
    setActiveRole(role);
  }

  async function refreshHistorySnapshot(filter: 'all' | 'completed' | 'canceled') {
    const { historyOrders, transactionLogs, auditEvents } =
      await loadHistorySnapshot(bootstrapDeps, filter);

    useHistoryStore.setState({
      auditEvents,
      historyOrders,
      transactionLogs,
    });
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
        DISPLAY_NAME_REQUIRED: 'Display name is required before this local profile can be saved.',
        PHONE_REQUIRED: 'Phone number is required before this local profile can be saved.',
        VEHICLE_TYPE_REQUIRED: 'Choose one active vehicle type before enabling mitra readiness.',
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
        INVALID_DESTINATION: 'Destination location is required before this draft can be saved.',
        INVALID_ESTIMATED_PRICE: 'Estimated price must be greater than zero before this draft can be saved.',
        INVALID_PICKUP: 'Pickup location is required before this draft can be saved.',
        PROFILE_NOT_FOUND: 'Save the local profile first before creating a customer draft.',
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
      await refreshHistorySnapshot('all');
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
      await refreshHistorySnapshot('all');
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
    setActiveScreen('history_list');
  }

  async function handleRequestLocationPermission() {
    try {
      const granted =
        await bootstrapDeps.hardwarePermissionGateway.requestLocationWhenInUse();
      setLocationPermissionStatus(granted ? 'granted' : 'denied');
    } catch {
      setLocationPermissionStatus('denied');
    }
  }

  async function handleRequestNotificationPermission() {
    try {
      const granted =
        await bootstrapDeps.hardwarePermissionGateway.requestNotifications();
      setNotificationPermissionStatus(granted ? 'granted' : 'denied');
      if (granted) {
        const token = await syncNotificationToken(bootstrapDeps);
        setNotificationTokenPreview(
          token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null,
        );
      } else {
        setNotificationTokenPreview(null);
      }
    } catch {
      setNotificationPermissionStatus('denied');
      setNotificationTokenPreview(null);
    }
  }

  async function handleExportTransactionCsv() {
    const { transactionCsvPreview } = useExportStore.getState();

    if (!transactionCsvPreview) {
      return;
    }

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
        sanitizeErrorMessage(
          error,
          getExportStateErrorCopy('transaction_csv', 'export'),
        ),
      );
    }
  }

  async function handleOpenTransactionCsvFile() {
    const { transactionCsvExportPath } = useExportStore.getState();

    if (!transactionCsvExportPath) {
      return;
    }

    try {
      await openExportedFile(transactionCsvExportPath);
      setTransactionCsvExportError(null);
    } catch (error) {
      setTransactionCsvExportError(
        sanitizeErrorMessage(
          error,
          getExportStateErrorCopy('transaction_csv', 'open'),
        ),
      );
    }
  }

  async function handleShareTransactionCsvFile() {
    const { transactionCsvExportPath } = useExportStore.getState();

    if (!transactionCsvExportPath) {
      return;
    }

    try {
      await shareExportedFile(transactionCsvExportPath);
      setTransactionCsvExportError(null);
    } catch (error) {
      setTransactionCsvExportError(
        sanitizeErrorMessage(
          error,
          getExportStateErrorCopy('transaction_csv', 'share'),
        ),
      );
    }
  }

  async function handleExportAuditBundle() {
    try {
      await guardExportWithDeviceAuth(
        bootstrapDeps,
        'Authenticate to export audit bundle',
      );

      const path = await bootstrapDeps.fileExportGateway.writeBundleExportFile({
        entries: auditBundleFiles,
        extension: 'carrieraudit',
        prefix: 'audit-export',
      });

      setAuditExportError(null);
      setAuditExportPath(path);
    } catch (error) {
      setAuditExportError(
        sanitizeErrorMessage(
          error,
          getExportStateErrorCopy('audit_bundle', 'export'),
        ),
      );
    }
  }

  async function handleOpenAuditBundleFile() {
    if (!auditExportPath) {
      return;
    }

    try {
      await openExportedFile(auditExportPath);
      setAuditExportError(null);
    } catch (error) {
      setAuditExportError(
        sanitizeErrorMessage(
          error,
          getExportStateErrorCopy('audit_bundle', 'open'),
        ),
      );
    }
  }

  async function handleShareAuditBundleFile() {
    if (!auditExportPath) {
      return;
    }

    try {
      await shareExportedFile(auditExportPath);
      setAuditExportError(null);
    } catch (error) {
      setAuditExportError(
        sanitizeErrorMessage(
          error,
          getExportStateErrorCopy('audit_bundle', 'share'),
        ),
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
    await refreshHistorySnapshot(historyFilter);
    setActiveScreen('history_detail');
  }

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

      <HardwarePermissionCard
        locationStatus={locationPermissionStatus}
        notificationTokenPreview={notificationTokenPreview}
        notificationStatus={notificationPermissionStatus}
        onOpenSettings={() => {
          void openHardwarePermissionSettings();
        }}
        onRequestLocation={() => {
          void handleRequestLocationPermission();
        }}
        onRequestNotifications={() => {
          void handleRequestNotificationPermission();
        }}
      />

      {activeOrder && getHasRecoverableOrder(activeOrder) ? (
        <RecoveryBanner
          onResume={() => {
            setActiveScreen(resumeTarget);
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
        <HistoryListRoute
          onBack={() => {
            setActiveScreen('home');
          }}
          onOpenAudit={() => {
            setActiveScreen('audit_list');
          }}
          onOpenTransactionCsv={() => {
            setActiveScreen('transaction_csv');
          }}
          onOpenOrder={() => {
            setActiveScreen('history_detail');
          }}
        />
      ) : null}

      {activeScreen === 'transaction_csv' ? (
        <TransactionCsvRoute
          onBack={() => {
            setActiveScreen('history_list');
          }}
          onExport={handleExportTransactionCsv}
          onOpenExportedFile={handleOpenTransactionCsvFile}
          onShareExportedFile={handleShareTransactionCsvFile}
        />
      ) : null}

      {activeScreen === 'audit_list' ? (
        <AuditListRoute
          onBack={() => {
            setActiveScreen('history_list');
          }}
          onOpenExportPreview={() => {
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
          onOpenExportedFile={handleOpenAuditBundleFile}
          onShareExportedFile={handleShareAuditBundleFile}
          previewContent={auditExportPreview}
        />
      ) : null}

      {activeScreen === 'post_trip_feedback' ? (
        <PostTripFeedbackRoute
          onBack={() => {
            setActiveScreen('history_detail');
          }}
          onSubmit={handleSaveFeedback}
          selectedCompletedOrder={selectedCompletedOrder}
        />
      ) : null}

      {activeScreen === 'history_detail' ? (
        <HistoryDetailRoute
          onBack={() => {
            setActiveScreen('history_list');
          }}
          onOpenFeedback={order => {
            setSelectedCompletedOrder(order);
            setActiveScreen('post_trip_feedback');
          }}
          selectedCompletedOrder={selectedCompletedOrder}
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
