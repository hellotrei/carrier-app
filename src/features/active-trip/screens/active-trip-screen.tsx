import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { AppRole } from '../../../core/types/app-role';
import type {
  Order,
  OrderCancelReason,
  OrderStatus,
} from '../../../domain/order/order';
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

function getRoleSummary(activeRole: AppRole, status: OrderStatus): string {
  if (activeRole === 'customer') {
    if (status === 'Draft') {
      return 'Customer can still review and submit this draft.';
    }

    return `Customer view is read-only while the order is ${status}. Switch to mitra to continue the operational flow.`;
  }

  if (status === 'Requested') {
    return 'Mitra can now accept the recovered request.';
  }

  if (status === 'Draft') {
    return 'Mitra cannot act until the customer submits the booking draft.';
  }

  return `Mitra controls the operational transition while the order is ${status}.`;
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
      <AppText tone="muted">
        Route: {order.pickup.label ?? 'Pickup'} to {order.destination.label ?? 'Destination'}
      </AppText>
      <AppText tone="muted">
        Estimated price: Rp {order.estimatedPrice.toLocaleString('id-ID')}
      </AppText>
      <AppText tone="muted">
        Status updated: {order.statusUpdatedAt}
      </AppText>
      {order.requestedAt ? (
        <AppText tone="muted">Requested at: {order.requestedAt}</AppText>
      ) : null}
      <AppText tone="muted">
        Active actor: {activeRole === 'customer' ? 'Customer' : 'Mitra'}
      </AppText>
      <AppText tone="muted">{getRoleSummary(activeRole, order.status)}</AppText>
      {isDraft ? (
        <View style={styles.reviewCard}>
          <AppText variant="eyebrow">Review</AppText>
          <AppText>Pickup: {order.pickup.label ?? 'Pickup'}</AppText>
          <AppText>Destination: {order.destination.label ?? 'Destination'}</AppText>
          <AppText>
            Fare lock preview: Rp {order.estimatedPrice.toLocaleString('id-ID')}
          </AppText>
          <AppText tone="muted">
            Submitting this draft moves it to Requested and locks the current booking summary for recovery.
          </AppText>
        </View>
      ) : null}
      {primaryAction ? (
        <AppButton
          label={primaryAction.label}
          onPress={() => onAdvance(primaryAction.nextStatus)}
        />
      ) : null}
      {activeRole === 'customer' ? (
        <AppButton
          label="Cancel: pickup mismatch"
          kind="secondary"
          onPress={() => onCancel('pickup_mismatch')}
        />
      ) : (
        <>
          <AppButton
            label="Cancel: no show"
            kind="secondary"
            onPress={() => onCancel('no_show')}
          />
          <AppButton
            label="Cancel: identity mismatch"
            kind="secondary"
            onPress={() => onCancel('identity_mismatch')}
          />
          <AppButton
            label="Cancel: unsafe"
            kind="secondary"
            onPress={() => onCancel('unsafe_or_suspicious')}
          />
        </>
      )}
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
});
