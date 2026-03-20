import React from 'react';

import { useAppBootstrap } from './bootstrap/use-app-bootstrap';
import { RootNavigation } from './navigation/root-navigation';
import { AppScreen } from '../ui/primitives/app-screen';
import { AppText } from '../ui/primitives/app-text';

export function RootApp(): React.JSX.Element {
  const bootstrap = useAppBootstrap();

  if (bootstrap.status === 'failed') {
    return (
      <AppScreen>
        <AppText variant="eyebrow">Carrier</AppText>
        <AppText variant="title">Bootstrap failed safely</AppText>
        <AppText tone="muted">
          The shell stopped before wiring storage or relay state into the app.
        </AppText>
        {bootstrap.reason ? <AppText tone="muted">{bootstrap.reason}</AppText> : null}
      </AppScreen>
    );
  }

  if (bootstrap.status !== 'ready') {
    return (
      <AppScreen>
        <AppText variant="eyebrow">Carrier</AppText>
        <AppText variant="title">Preparing local-first shell</AppText>
        <AppText tone="muted">
          Bootstrap is intentionally thin. Storage, relay, and secure bindings
          will be wired behind repositories and gateways.
        </AppText>
      </AppScreen>
    );
  }

  return <RootNavigation />;
}
