export type BootstrapState = {
  status: 'ready' | 'booting' | 'failed';
  reason?: string;
};

import { useEffect, useState } from 'react';

import { sanitizeErrorMessage } from '../../core/errors/sanitize-error-message';
import { useAppShellStore } from '../../state/app-shell/app-shell-store';
import { bootstrapDeps } from '../config/bootstrap-deps';
import { bootstrapApp } from '../../application/user/bootstrap-app';

export function useAppBootstrap(): BootstrapState {
  const setBootstrapSnapshot = useAppShellStore(
    state => state.setBootstrapSnapshot,
  );
  const [status, setStatus] = useState<BootstrapState>({ status: 'booting' });

  useEffect(() => {
    let cancelled = false;

    async function runBootstrap() {
      try {
        const snapshot = await bootstrapApp(bootstrapDeps);

        if (cancelled) {
          return;
        }

        setBootstrapSnapshot(snapshot);
        setStatus({ status: 'ready' });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus({
          status: 'failed',
          reason: sanitizeErrorMessage(
            error,
            'Bootstrap could not restore local data safely.',
          ),
        });
      }
    }

    void runBootstrap();

    return () => {
      cancelled = true;
    };
  }, [setBootstrapSnapshot]);

  return status;
}
