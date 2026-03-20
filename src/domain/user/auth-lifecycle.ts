export type AuthLifecycleStage =
  | 'first_install'
  | 'profile_draft'
  | 'profile_validated'
  | 'identity_active'
  | 'ready_to_online'
  | 'online'
  | 'accepted_contact_revealed'
  | 'blocked';
