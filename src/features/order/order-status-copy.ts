import type { AppRole } from '../../core/types/app-role';
import type { OrderStatus } from '../../domain/order/order';

export function getCustomerHomeStatusDescription(
  status: Exclude<OrderStatus, 'Draft' | 'Completed' | 'Canceled' | 'Rejected' | 'Expired'>,
): string {
  if (status === 'Requested') {
    return 'Order has already been submitted and is now waiting for mitra handling in the active flow.';
  }

  if (status === 'Accepted') {
    return 'Mitra has accepted this order. Follow the active flow for the next pickup and trip updates.';
  }

  if (status === 'OnTheWay') {
    return 'Mitra is already heading to pickup. Resume the active flow to track the next step.';
  }

  if (status === 'ArrivedAtPickup') {
    return 'Mitra has arrived at pickup. Resume the active flow to continue pickup handling before the trip starts.';
  }

  if (status === 'OnTrip') {
    return 'Trip is already in progress. Resume the active flow for the latest trip state.';
  }

  return `Order ${status} is already active. Resume that flow before starting a new booking.`;
}

export function getRecoveryResumeHint(status: OrderStatus): string {
  if (status === 'Draft') {
    return 'Resume returns you to the saved draft flow with the current local booking values.';
  }

  if (status === 'Requested') {
    return 'Resume returns you to the active handoff flow so the next actor can continue from the saved request.';
  }

  if (
    status === 'Accepted' ||
    status === 'OnTheWay' ||
    status === 'ArrivedAtPickup'
  ) {
    return 'Resume returns you to the active pickup flow with the latest saved booking summary.';
  }

  return 'Resume returns you to the active trip flow with the latest saved recovery state.';
}

export function getRecoveryResumeLabel(status: OrderStatus): string {
  if (status === 'Draft') {
    return 'Resume draft';
  }

  if (status === 'Requested') {
    return 'Resume handoff';
  }

  if (
    status === 'Accepted' ||
    status === 'OnTheWay' ||
    status === 'ArrivedAtPickup'
  ) {
    return 'Resume pickup flow';
  }

  return 'Resume trip';
}

export function getRecoveryActiveActorHint(status: OrderStatus): string {
  if (status === 'Draft') {
    return 'Primary actor on resume: Customer';
  }

  if (status === 'Requested') {
    return 'Primary actor on resume: Mitra review';
  }

  if (
    status === 'Accepted' ||
    status === 'OnTheWay' ||
    status === 'ArrivedAtPickup'
  ) {
    return 'Primary actor on resume: Mitra pickup flow';
  }

  return 'Primary actor on resume: Active trip flow';
}

export function getActiveTripRoleSummary(
  activeRole: AppRole,
  status: OrderStatus,
): string {
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

export function getActiveTripHandoffNote(
  activeRole: AppRole,
  status: OrderStatus,
): string {
  if (activeRole === 'customer') {
    if (status === 'Requested') {
      return 'Customer has already handed this request to mitra and now waits for acceptance or the next operational update.';
    }

    if (
      status === 'Accepted' ||
      status === 'OnTheWay' ||
      status === 'ArrivedAtPickup'
    ) {
      return 'Customer should monitor progress while mitra handles pickup execution from the active flow.';
    }

    if (status === 'OnTrip') {
      return 'Customer is now in the trip phase and should treat this summary as the locked reference for the ongoing ride.';
    }
  }

  if (status === 'Requested') {
    return 'Mitra is now responsible for reviewing and accepting the saved request before any pickup progress begins.';
  }

  if (
    status === 'Accepted' ||
    status === 'OnTheWay' ||
    status === 'ArrivedAtPickup'
  ) {
    return 'Mitra owns the next operational step and should keep the saved booking summary aligned with on-road execution.';
  }

  if (status === 'OnTrip') {
    return 'Mitra is in the live trip phase and should treat this summary as the local recovery reference until completion.';
  }

  return 'This saved booking summary remains the local recovery reference while the active flow continues.';
}

export function getCustomerCancelLabel(status: OrderStatus): string {
  if (status === 'Draft') {
    return 'Cancel draft: pickup mismatch';
  }

  return 'Report issue: pickup mismatch';
}

export function getPartnerCancelLabels(status: OrderStatus): {
  identityMismatch: string;
  noShow: string;
  unsafe: string;
} {
  if (status === 'Requested') {
    return {
      identityMismatch: 'Decline request: identity mismatch',
      noShow: 'No-show becomes available after arrival',
      unsafe: 'Decline request: unsafe',
    };
  }

  if (status === 'Accepted' || status === 'OnTheWay') {
    return {
      identityMismatch: 'Cancel pickup: identity mismatch',
      noShow: 'No-show becomes available after arrival',
      unsafe: 'Cancel pickup: unsafe',
    };
  }

  if (status === 'ArrivedAtPickup') {
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

export function getSecondaryActionTitle(
  activeRole: AppRole,
  status: OrderStatus,
): string {
  if (activeRole === 'customer') {
    return status === 'Draft' ? 'Draft Actions' : 'Customer Issue Actions';
  }

  if (status === 'Requested') {
    return 'Request Review Actions';
  }

  if (
    status === 'Accepted' ||
    status === 'OnTheWay' ||
    status === 'ArrivedAtPickup'
  ) {
    return 'Pickup Actions';
  }

  return 'Trip Actions';
}

export function getBackHint(activeRole: AppRole, status: OrderStatus): string {
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
