import React from 'react';

import type { NotificationEvent } from '../../state/permission/notification-event';
import { AppButton } from '../primitives/app-button';
import { AppText } from '../primitives/app-text';
import { SectionCard } from './section-card';

type HardwarePermissionCardProps = {
  lastNotificationEvent?: NotificationEvent | null;
  locationStatus: 'idle' | 'granted' | 'denied';
  notificationTokenPreview?: string | null;
  notificationStatus: 'idle' | 'granted' | 'denied';
  onRequestLocation: () => void;
  onRequestNotifications: () => void;
  onOpenSettings: () => void;
};

export function HardwarePermissionCard({
  lastNotificationEvent,
  locationStatus,
  notificationTokenPreview,
  notificationStatus,
  onOpenSettings,
  onRequestLocation,
  onRequestNotifications,
}: HardwarePermissionCardProps): React.JSX.Element {
  const showSettingsAction =
    locationStatus === 'denied' || notificationStatus === 'denied';

  return (
    <SectionCard
      eyebrow="Pilot Ops"
      title="Hardware permission controls"
      description="This shell keeps permission prompts available for pilot setup without mixing them into the core trip flow."
    >
      <AppText tone="muted">Location permission: {locationStatus}</AppText>
      <AppText tone="muted">
        Notification permission: {notificationStatus}
      </AppText>
      {notificationTokenPreview ? (
        <AppText tone="muted">
          Notification token: {notificationTokenPreview}
        </AppText>
      ) : null}
      {lastNotificationEvent ? (
        <>
          <AppText tone="muted">
            Last push event: {lastNotificationEvent.preview}
          </AppText>
          <AppText tone="muted">
            Push type: {lastNotificationEvent.type}
          </AppText>
          {lastNotificationEvent.orderId ? (
            <AppText tone="muted">
              Push order ID: {lastNotificationEvent.orderId}
            </AppText>
          ) : null}
        </>
      ) : null}
      <AppButton
        label="Request location permission"
        kind="secondary"
        onPress={onRequestLocation}
      />
      <AppButton
        label="Request notification permission"
        kind="secondary"
        onPress={onRequestNotifications}
      />
      {showSettingsAction ? (
        <AppButton
          label="Open app settings"
          kind="secondary"
          onPress={onOpenSettings}
        />
      ) : null}
    </SectionCard>
  );
}
