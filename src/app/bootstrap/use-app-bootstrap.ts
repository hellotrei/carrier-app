export type BootstrapState = {
  status: 'ready' | 'booting' | 'failed';
  reason?: string;
};

import { useEffect, useState } from 'react';

import { bootstrapDeps } from '../config/bootstrap-deps';
import { bootstrapApp } from '../../application/user/bootstrap-app';
import { useAppStore } from '../../state/store/app-store';

export function useAppBootstrap(): BootstrapState {
  const setBootstrapSnapshot = useAppStore(state => state.setBootstrapSnapshot);
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

        const reason =
          error instanceof Error ? error.message : 'bootstrap_failed';

        setStatus({
          status: 'failed',
          reason,
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
