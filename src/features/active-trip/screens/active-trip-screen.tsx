import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { AppRole } from '../../../core/types/app-role';
import type {
  Order,
  OrderCancelReason,
  OrderStatus,
} from '../../../domain/order/order';
import { canCancelOrderWithReason } from '../../../domain/order/order';
import {
  getActiveTripHandoffNote,
  getActiveTripRoleSummary,
  getBackHint,
  getCustomerCancelLabel,
  getPartnerCancelLabels,
  getSecondaryActionTitle,
} from '../../order/order-status-copy';
import { OrderSummaryBlock } from '../../../ui/patterns/order-summary-block';
import { SectionCard } from '../../../ui/patterns/section-card';
import { AppButton } from '../../../ui/primitives/app-button';
import { AppText } from '../../../ui/primitives/app-text';
import { tokens } from '../../../ui/theme/tokens';

type ActiveTripScreenProps = {
  activeRole: AppRole;
  onAdvance: (nextStatus: OrderStatus) => void;
  onBack: () => void;
  onCancel: (reason: OrderCancelReason) => void;
  order: Order;
};

function getPrimaryAction(
  activeRole: AppRole,
  status: OrderStatus,
): { label: string; nextStatus: OrderStatus } | null {
  if (activeRole === 'customer') {
    if (status === 'Draft') {
      return {
        label: 'Submit draft',
        nextStatus: 'Requested',
      };
    }

    return null;
  }

  switch (status) {
    case 'Requested':
      return {
        label: 'Accept request',
        nextStatus: 'Accepted',
      };
    case 'Accepted':
      return {
        label: 'Head to pickup',
        nextStatus: 'OnTheWay',
      };
    case 'OnTheWay':
      return {
        label: 'Arrived at pickup',
        nextStatus: 'ArrivedAtPickup',
      };
    case 'ArrivedAtPickup':
      return {
        label: 'Start trip',
        nextStatus: 'OnTrip',
      };
    case 'OnTrip':
      return {
        label: 'Complete trip',
        nextStatus: 'Completed',
      };
    default:
      return null;
  }
}

export function ActiveTripScreen({
  activeRole,
  onAdvance,
  onBack,
  onCancel,
  order,
}: ActiveTripScreenProps): React.JSX.Element {
  const isDraft = order.status === 'Draft';
  const primaryAction = getPrimaryAction(activeRole, order.status);
  const partnerCancelLabels = getPartnerCancelLabels(order.status);
  const canCustomerReportPickupMismatch = canCancelOrderWithReason(
    order.status,
    'pickup_mismatch',
  );
  const canPartnerReportNoShow = canCancelOrderWithReason(order.status, 'no_show');
  const canPartnerReportIdentityMismatch = canCancelOrderWithReason(
    order.status,
    'identity_mismatch',
  );
  const canPartnerReportUnsafe = canCancelOrderWithReason(
    order.status,
    'unsafe_or_suspicious',
  );

  return (
    <SectionCard
      eyebrow="Active Trip"
      title="Recovered local order"
      description="This screen is the minimal recovery target for non-terminal orders restored from local persistence."
    >
      <AppText tone="muted">Order ID: {order.orderId}</AppText>
      <AppText tone="muted">Status: {order.status}</AppText>
      <AppText tone="muted">
        Cancel reason: {order.cancelReason ?? 'Not canceled'}
      </AppText>
      <AppText tone="muted">Rider: {order.riderDeclaredName}</AppText>
      <OrderSummaryBlock
        context={isDraft ? 'draft_review' : 'handoff'}
        destinationLabel={order.destination.label ?? ''}
        estimatedPrice={order.estimatedPrice}
        pickupLabel={order.pickup.label ?? ''}
      />
      <AppText tone="muted">
        Last status update: {order.statusUpdatedAt}
      </AppText>
      {order.requestedAt ? (
        <AppText tone="muted">Requested at: {order.requestedAt}</AppText>
      ) : null}
      <AppText tone="muted">
        Active actor: {activeRole === 'customer' ? 'Customer' : 'Mitra'}
      </AppText>
      <AppText tone="muted">
        {getActiveTripRoleSummary(activeRole, order.status)}
      </AppText>
      {isDraft ? (
        <View style={styles.reviewCard}>
          <AppText variant="eyebrow">Draft Notes</AppText>
          <AppText tone="muted">
            Submitting this draft moves it to Requested and locks the current booking summary for recovery.
          </AppText>
        </View>
      ) : (
        <View style={styles.reviewCard}>
          <AppText variant="eyebrow">Handoff Notes</AppText>
          <AppText tone="muted">
            {getActiveTripHandoffNote(activeRole, order.status)}
          </AppText>
        </View>
      )}
      {primaryAction ? (
        <AppButton
          label={primaryAction.label}
          onPress={() => onAdvance(primaryAction.nextStatus)}
        />
      ) : null}
      <View style={styles.secondaryActions}>
        <AppText variant="eyebrow">
          {getSecondaryActionTitle(activeRole, order.status)}
        </AppText>
        {activeRole === 'customer' ? (
          canCustomerReportPickupMismatch ? (
            <AppButton
              label={getCustomerCancelLabel(order.status)}
              kind="secondary"
              onPress={() => onCancel('pickup_mismatch')}
            />
          ) : null
        ) : (
          <>
            {canPartnerReportNoShow ? (
              <AppButton
                label={partnerCancelLabels.noShow}
                kind="secondary"
                onPress={() => onCancel('no_show')}
              />
            ) : null}
            {canPartnerReportIdentityMismatch ? (
              <AppButton
                label={partnerCancelLabels.identityMismatch}
                kind="secondary"
                onPress={() => onCancel('identity_mismatch')}
              />
            ) : null}
            {canPartnerReportUnsafe ? (
              <AppButton
                label={partnerCancelLabels.unsafe}
                kind="secondary"
                onPress={() => onCancel('unsafe_or_suspicious')}
              />
            ) : null}
          </>
        )}
      </View>
      <AppText tone="muted">{getBackHint(activeRole, order.status)}</AppText>
      <AppButton label="Back to shell" kind="secondary" onPress={onBack} />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  reviewCard: {
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.surfaceStrong,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  secondaryActions: {
    gap: tokens.spacing.xs,
  },
});
