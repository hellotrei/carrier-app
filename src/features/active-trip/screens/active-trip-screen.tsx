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

function getHandoffNote(activeRole: AppRole, status: OrderStatus): string {
  if (activeRole === 'customer') {
    if (status === 'Requested') {
      return 'Customer has already handed this request to mitra and now waits for acceptance or the next operational update.';
    }

    if (status === 'Accepted' || status === 'OnTheWay') {
      return 'Customer should monitor progress while mitra handles pickup execution from the active flow.';
    }

    if (status === 'OnTrip') {
      return 'Customer is now in the trip phase and should treat this summary as the locked reference for the ongoing ride.';
    }
  }

  if (status === 'Requested') {
    return 'Mitra is now responsible for reviewing and accepting the saved request before any pickup progress begins.';
  }

  if (status === 'Accepted' || status === 'OnTheWay') {
    return 'Mitra owns the next operational step and should keep the saved booking summary aligned with on-road execution.';
  }

  if (status === 'OnTrip') {
    return 'Mitra is in the live trip phase and should treat this summary as the local recovery reference until completion.';
  }

  return 'This saved booking summary remains the local recovery reference while the active flow continues.';
}

function getCustomerCancelLabel(status: OrderStatus): string {
  if (status === 'Draft') {
    return 'Cancel draft: pickup mismatch';
  }

  return 'Report issue: pickup mismatch';
}

function getPartnerCancelLabels(status: OrderStatus): {
  identityMismatch: string;
  noShow: string;
  unsafe: string;
} {
  if (status === 'Requested') {
    return {
      identityMismatch: 'Decline request: identity mismatch',
      noShow: 'Decline request: no show',
      unsafe: 'Decline request: unsafe',
    };
  }

  if (status === 'Accepted' || status === 'OnTheWay') {
    return {
      identityMismatch: 'Cancel pickup: identity mismatch',
      noShow: 'Cancel pickup: no show',
      unsafe: 'Cancel pickup: unsafe',
    };
  }

  return {
    identityMismatch: 'Stop trip: identity mismatch',
    noShow: 'Stop trip: no show',
    unsafe: 'Stop trip: unsafe',
  };
}

function getSecondaryActionTitle(
  activeRole: AppRole,
  status: OrderStatus,
): string {
  if (activeRole === 'customer') {
    return status === 'Draft' ? 'Draft Actions' : 'Customer Issue Actions';
  }

  if (status === 'Requested') {
    return 'Request Review Actions';
  }

  if (status === 'Accepted' || status === 'OnTheWay') {
    return 'Pickup Actions';
  }

  return 'Trip Actions';
}

function getBackHint(activeRole: AppRole, status: OrderStatus): string {
  if (status === 'Draft') {
    return 'Back to shell returns you to the draft form with the current local booking values.';
  }

  if (activeRole === 'customer') {
    return 'Back to shell returns you to the customer home summary for this active order.';
  }

  if (status === 'Requested') {
    return 'Back to shell returns you to the mitra inbox with this request still waiting for review.';
  }

  return 'Back to shell returns you to the home view while keeping this active order ready to resume.';
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
        Last status update: {order.statusUpdatedAt}
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
      ) : (
        <View style={styles.reviewCard}>
          <AppText variant="eyebrow">Handoff Summary</AppText>
          <AppText>Pickup: {order.pickup.label ?? 'Pickup'}</AppText>
          <AppText>Destination: {order.destination.label ?? 'Destination'}</AppText>
          <AppText>
            Estimated price: Rp {order.estimatedPrice.toLocaleString('id-ID')}
          </AppText>
          <AppText tone="muted">
            {getHandoffNote(activeRole, order.status)}
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
          <AppButton
            label={getCustomerCancelLabel(order.status)}
            kind="secondary"
            onPress={() => onCancel('pickup_mismatch')}
          />
        ) : (
          <>
            <AppButton
              label={partnerCancelLabels.noShow}
              kind="secondary"
              onPress={() => onCancel('no_show')}
            />
            <AppButton
              label={partnerCancelLabels.identityMismatch}
              kind="secondary"
              onPress={() => onCancel('identity_mismatch')}
            />
            <AppButton
              label={partnerCancelLabels.unsafe}
              kind="secondary"
              onPress={() => onCancel('unsafe_or_suspicious')}
            />
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
