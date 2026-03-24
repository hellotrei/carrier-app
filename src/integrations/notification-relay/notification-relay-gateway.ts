export type SyncNotificationTokenParams = {
  token: string;
};

export type NotificationRelayGateway = {
  syncNotificationToken: (params: SyncNotificationTokenParams) => Promise<void>;
};

export function createNoopNotificationRelayGateway(): NotificationRelayGateway {
  return {
    async syncNotificationToken() {
      // Relay sync is wired later; keep current app flow safe and local-first.
    },
  };
}
