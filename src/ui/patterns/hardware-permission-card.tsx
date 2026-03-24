import React from 'react';

import { AppButton } from '../primitives/app-button';
import { AppText } from '../primitives/app-text';
import { SectionCard } from './section-card';

type HardwarePermissionCardProps = {
  locationStatus: 'idle' | 'granted' | 'denied';
  notificationStatus: 'idle' | 'granted' | 'denied';
  onRequestLocation: () => void;
  onRequestNotifications: () => void;
};

export function HardwarePermissionCard({
  locationStatus,
  notificationStatus,
  onRequestLocation,
  onRequestNotifications,
}: HardwarePermissionCardProps): React.JSX.Element {
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
    </SectionCard>
  );
}
