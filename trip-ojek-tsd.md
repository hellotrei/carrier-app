# TSD — Technical Specification Document
## Carrier App Project

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CTO / Engineering Direction
**Project:** Carrier App Project
**Motto:** Just Fair
**Previous Working Name:** TRIP
**Document Type:** Technical Specification Document (TSD)
**Status:** Approved for engineering execution
**Source Reference:** SDD — Carrier App Project v1.0

---

## Catatan CEO

> TSD versi awal sudah sangat detail dan bisa dieksekusi. Revisi ini menambahkan spesifikasi yang hilang: anti-abuse technical spec, transaction log schema, relay technology specifics (Supabase), dan beberapa penyempurnaan pada contract yang kurang lengkap.
>
> Pesan untuk tim engineering: **TSD ini adalah kontrak, bukan guideline**. Jika perlu deviation dari spec ini selama implementasi, dokumentasikan alasannya dan update dokumen ini. Jangan silent-break the spec.

---

## 1. Ringkasan

TSD ini menjabarkan spesifikasi implementasi teknis untuk **Carrier App Project** — single app dual role, local-first, thin relay. Dokumen ini menurunkan SDD ke level yang langsung bisa dieksekusi oleh engineer: module contracts, payload schemas, SQLite schema lengkap, audit binary format, lifecycle specs, error model, dan testing requirements.

**Prinsip utama yang tidak boleh dilanggar:**
1. Source of truth data user ada di local storage device
2. Presence dan signaling bersifat ephemeral dan TTL-based
3. Semua aksi bisnis penting wajib menghasilkan audit event
4. Anti-abuse validation wajib berjalan sebelum presence publish
5. Semua perubahan status order wajib lewat state machine domain
6. UI tidak boleh menyimpan business rules kritikal
7. Data sensitif tidak boleh ditulis utuh ke debug log
8. Desain harus toleran terhadap app kill, resume, dan koneksi buruk

**Klarifikasi terminologi implementasi:**
- "End-to-end" pada TSD ini berarti alur request → relay signaling → update lokal kedua pihak → completion/recovery
- "Decentralised" pada MVP ini berarti penyimpanan data inti tersebar di device user, bukan arsitektur pure peer-to-peer tanpa relay
- Binary audit adalah format penyimpanan lokal dan export, bukan format pertukaran data antar user

---

## 2. Out of Scope Teknis MVP

| Fitur | Alasan |
|-------|--------|
| In-app payment gateway | Kompleksitas tinggi, belum perlu |
| In-app navigation engine | Google Maps cukup |
| In-app VoIP/call stack | WhatsApp/dialer cukup |
| In-app real-time chat socket | WhatsApp cukup |
| Histori lokasi sentral | Melanggar prinsip local-first |
| Admin dashboard kompleks | Belum ada operator yang butuh |
| ML matching engine | Terlalu dini |
| Auto payment settlement | Phase 3 |

---

## 3. Stack Teknis

### 3.1 Core Stack
```
Mobile Framework:   React Native + TypeScript
Navigation:         React Navigation v6+
Local DB:           op-sqlite (SQLite wrapper untuk RN)
                    atau react-native-quick-sqlite
Secure Storage:     react-native-keychain
File System:        react-native-fs
Serialization:      @msgpack/msgpack
State Management:   Zustand (recommended) atau Redux Toolkit
```

### 3.2 Relay Stack
```
Relay Service:      Supabase (hosted)
                    - Realtime channels untuk presence
                    - Realtime channels untuk order signaling
                    - PostgreSQL sebagai backing store (ephemeral data)
Supabase SDK:       @supabase/supabase-js
Push Notification:  Firebase Cloud Messaging
Temp Chat/Files:    Firebase Realtime Database / Firebase Storage (opsional, non-source-of-truth)
```

### 3.3 Integration Libraries
```
Location:           @react-native-community/geolocation
                    atau expo-location
Biometrics:         react-native-biometrics
Maps:               custom deep link builder (tidak perlu library)
Dialer:             Linking.openURL('tel:...')
WhatsApp:           Linking.openURL('whatsapp://...')
Firebase:           @react-native-firebase/app
                    @react-native-firebase/messaging
```

Firebase rules:
- FCM dipakai hanya untuk push notifikasi penting
- Firebase Realtime Database/Storage hanya untuk temporary chat/file yang non-source-of-truth
- Jika Firebase down, order core flow tidak boleh ikut gagal

### 3.4 Dependency Principles
- Hindari SDK berbayar
- Pilih library dengan maintainer aktif dan stars > 1000
- Setiap dependency baru harus justify kebutuhan konkret
- Prefer smaller, focused libraries over monolithic SDKs

---

## 4. Arsitektur Teknis

```
UI / Feature Screens
  → Feature Controllers / ViewModel Hooks
    → Use Cases / Application Services
      → Domain Policies / State Machine
        → Repositories / Gateways
          → SQLite / Secure Storage / File Audit / Supabase Relay / Platform APIs
```

### 4.1 Dependency Direction Rules
- UI → Application only
- Application → Domain interfaces + Repository/Gateway interfaces
- Data layer → implements Repository/Gateway interfaces
- Domain → NO dependency ke UI, library platform, atau data layer
- Integration layer → wraps platform APIs only

---

## 5. Struktur Folder (Final)

```
src/
  app/
    bootstrap/
      AppBootstrap.ts        # initialization sequence
    navigation/
      RootNavigator.tsx
      CustomerStack.tsx
      MitraStack.tsx
    providers/
      AppProviders.tsx       # Supabase, store, etc
  core/
    constants/
      pricing.ts             # min/max price per km
      presence.ts            # TTL, radius defaults
      order.ts               # timeout, commission rate
    errors/
      AppError.ts
      ErrorCode.ts
    logger/
      AppLogger.ts           # debug logger (≠ audit)
    result/
      Result.ts              # Result<T, E> type
    time/
      Clock.ts               # testable time abstraction
    utils/
      uuid.ts
      haversine.ts
      rounding.ts
    validation/
      coordinates.ts         # Indonesia range validation
      pricing.ts
  domain/
    user/
      entities/UserProfile.ts
      policies/RolePolicy.ts
      value-objects/PhoneNumber.ts
    pricing/
      entities/PricingProfile.ts
      policies/PricingPolicy.ts  # min/max, rounding
    presence/
      entities/PresenceSnapshot.ts
      policies/PresencePolicy.ts # TTL check, staleness
      policies/AntiAbusePolicy.ts  # velocity, rate limit, coord range
    order/
      entities/Order.ts
      entities/TransactionLog.ts
      policies/OrderPolicy.ts
      state-machine/OrderStateMachine.ts
      state-machine/transitions.ts
    audit/
      entities/AuditEvent.ts
      serializers/AuditSerializer.ts  # MessagePack
      policies/AuditPolicy.ts
  application/
    user/
      BootstrapApp.ts
      SetActiveRole.ts
      UpdateProfile.ts
    pricing/
      UpdatePartnerPrice.ts
      UpdateCustomerOfferPrice.ts
    presence/
      GoOnline.ts
      GoOffline.ts
      PublishPresence.ts
      DiscoverNearby.ts
    order/
      CreateOrderDraft.ts
      SubmitOrder.ts
      AcceptOrder.ts
      RejectOrder.ts
      AdvanceOrderStatus.ts
      CancelOrder.ts
      RecoverActiveOrder.ts
      CompleteOrder.ts         # includes transaction recording
    audit/
      AppendAuditEvent.ts
      ExportAuditBundle.ts
    external/
      OpenMaps.ts
      OpenDialer.ts
      OpenWhatsApp.ts
    transaction/
      RecordCompletedTrip.ts
      GetTransactionSummary.ts
      ExportTransactionsCsv.ts
  data/
    db/
      sqlite/
        TripDatabase.ts        # connection + pool
      migrations/
        001_initial_schema.ts
        002_add_transaction_log.ts
      mappers/
        UserProfileMapper.ts
        PricingProfileMapper.ts
        OrderMapper.ts
        AuditManifestMapper.ts
        TransactionLogMapper.ts
    repositories/
      SqliteUserRepository.ts
      SqlitePricingRepository.ts
      SqliteOrderRepository.ts
      SqliteAuditRepository.ts
      SqliteTransactionRepository.ts
    gateways/
      SupabasePresenceGateway.ts
      SupabaseOrderSignalGateway.ts
    relay/
      SupabaseClient.ts        # singleton client setup
      PresenceChannel.ts
      OrderSignalChannel.ts
    storage/
      SecureStorageService.ts
    serializers/
      MsgPackSerializer.ts
      AuditBinaryWriter.ts
  integrations/
    location/
      LocationService.ts
    maps/
      MapsDeepLink.ts
    dialer/
      DialerService.ts
    whatsapp/
      WhatsAppDeepLink.ts
    biometrics/
      BiometricService.ts
    filesystem/
      AuditFileSystem.ts
  features/
    onboarding/
    role-switch/
    permission-location/
    home-customer/
    home-mitra/
    pricing-settings/
    booking/
    incoming-order/
    active-trip/
    history/
    audit-export/
    transaction-log/           # operator view
    profile/
  state/
    store/
      useStore.ts              # Zustand store
    slices/
      sessionSlice.ts
      userSlice.ts
      discoverySlice.ts
      orderSlice.ts
      connectivitySlice.ts
    selectors/
    effects/
```

---

## 6. Type Definitions

### 6.1 Core Types
```ts
export type AppRole = 'customer' | 'mitra'

export type IdentityStatus = 'draft' | 'active' | 'blocked'

export type BookingIntent = 'self' | 'for_other'

export type BookingMode = 'manual' | 'auto'

export type PaymentMethod = 'cash' | 'manual_transfer' | 'gateway'

export type OrderRejectReasonCode =
  | 'busy'
  | 'pickup_too_far'
  | 'price_not_suitable'
  | 'suspicious_order'
  | 'undeclared_rider'
  | 'payload_invalid'
  | 'expired'

export type UserProfile = {
  userId: string
  displayName: string
  legalFullName?: string
  identityNumberMasked?: string
  profilePhotoUri?: string
  driverReadinessStatus?: 'draft' | 'declared' | 'minimum_valid' | 'flagged' | 'blocked'
  genderDeclaration?: 'female' | 'male' | 'unspecified'
  phoneMasked?: string
  phoneHash?: string
  activeRoles: AppRole[]
  currentRole: AppRole
  deviceAuthEnabled: boolean
  vehicles?: VehicleProfile[]
  bankAccounts?: BankAccount[]
  favoritePickupAddresses?: SavedAddress[]
  ratingAverage?: number
  reviewCount?: number
  totalTrips?: number
  hasSpareHelmet?: boolean
  hasRaincoatSpare?: boolean
  prefersFemaleDriver?: boolean
  identityStatus: IdentityStatus
  profileValidatedAt?: string
  createdAt: string
  updatedAt: string
}

export type VehicleProfile = {
  vehicleId: string
  vehicleType: 'motor' | 'mobil' | 'bajaj' | 'angkot'
  plateNumber?: string
  driverLicenseClass?: string
  seatCapacity?: number
  pricingMode: 'per_vehicle' | 'per_seat' | 'fixed_price'
  basePricePerKm?: number
  additionalPassengerPricePerKm?: number
  verificationStatus?: 'draft' | 'declared' | 'minimum_valid' | 'flagged' | 'blocked'
  isActiveForBooking: boolean
}

export type BankAccount = {
  bankAccountId: string
  bankName: string
  accountHolderName: string
  accountNumberMasked: string
}

export type SavedAddress = {
  savedAddressId: string
  label: string
  latitude: number
  longitude: number
}

export type PricingProfile = {
  userId: string
  partnerPricePerKm?: number
  customerOfferPerKm?: number
  currency: 'IDR'
  updatedAt: string
}

export type LocationPoint = {
  label?: string
  latitude: number
  longitude: number
  source: 'gps' | 'manual'
}

export type PresenceSnapshot = {
  userId: string
  role: AppRole
  isOnline: boolean
  latitude: number
  longitude: number
  visiblePricePerKm: number
  timestamp: string
  ttlSeconds: number
}

export type OrderStatus =
  | 'Draft'
  | 'Requested'
  | 'Accepted'
  | 'OnTheWay'
  | 'OnTrip'
  | 'Completed'
  | 'Canceled'
  | 'Rejected'
  | 'Expired'

export type Order = {
  orderId: string
  bookingSessionId: string
  customerId: string
  partnerId: string
  serviceType?: VehicleProfile['vehicleType']
  pricingMode?: VehicleProfile['pricingMode']
  passengerCount?: number
  bookingMode: BookingMode
  bookingIntent: BookingIntent
  riderDeclaredName: string
  riderPhoneMasked?: string
  pickup: LocationPoint
  destination: LocationPoint
  distanceEstimateKm: number
  pickupDistanceFromPartnerKm: number
  pricePerKmApplied: number
  baseTripEstimatedPrice: number
  pickupSurchargeAmount: number
  waitingChargeAmount?: number
  driverDelayDeductionAmount?: number
  gearDiscountAmount?: number
  arrivedAtPickupAt?: string
  estimatedPrice: number
  paymentMethod?: PaymentMethod
  paymentAdminFeeTotal?: number
  customerAdminFeeShare?: number
  partnerAdminFeeShare?: number
  status: OrderStatus
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export type AuditEvent = {
  eventId: string
  eventType: AuditEventType
  actorUserId: string
  actorRole: AppRole | 'system'
  orderId?: string
  payloadCompact: Uint8Array | string
  checksum?: string
  createdAt: string
}

export type TransactionLog = {
  logId: string
  orderId: string
  serviceType: VehicleProfile['vehicleType']
  customerId: string
  partnerId: string
  estimatedPrice: number
  paymentMethod?: PaymentMethod
  paymentAdminFeeTotal?: number
  customerAdminFeeShare?: number
  partnerAdminFeeShare?: number
  pricePerKm: number
  distanceKm: number
  commissionBaseAmount: number
  commissionRate: number
  commissionAmount: number
  completedAt: string
}
```

### 6.2 Payload Types
```ts
export type OrderRequestPayload = {
  orderId: string
  bookingSessionId: string
  customerId: string
  customerDisplayName: string
  bookingMode: BookingMode
  bookingIntent: BookingIntent
  riderDeclaredName: string
  riderPhoneMasked?: string
  partnerId: string
  pickup: LocationPoint
  destination: LocationPoint
  distanceEstimateKm: number
  pickupDistanceFromPartnerKm: number
  pricePerKmApplied: number
  baseTripEstimatedPrice: number
  pickupSurchargeAmount: number
  paymentMethod?: PaymentMethod
  paymentAdminFeeTotal?: number
  customerAdminFeeShare?: number
  partnerAdminFeeShare?: number
  estimatedPrice: number
  expiresAt: string           // ISO 8601, createdAt + 60s
  createdAt: string
}

export type OrderResponsePayload = {
  orderId: string
  partnerId: string
  response: 'accept' | 'reject'
  responseReasonCode?: OrderRejectReasonCode
  respondedAt: string
}

export type OrderContactRevealPayload = {
  orderId: string
  customerId: string
  partnerId: string
  customerPhoneE164: string
  partnerPhoneE164: string
  availableHandoffActions: Array<'call' | 'whatsapp' | 'temporary_chat'>
  revealedAt: string
  expiresAt: string
}

export type OrderSyncState = {
  orderId: string
  status: OrderStatus
  updatedAt: string
  version: number
}

export type OrderCancelReason =
  | 'user_changed_mind'
  | 'identity_mismatch'
  | 'undeclared_rider'
  | 'contact_mismatch'
  | 'unsafe_or_suspicious'
  | 'pickup_mismatch'
  | 'other'

export type UserTrustLevel =
  | 'clear'
  | 'warned'
  | 'delegated_booking_restricted'
  | 'restricted'
  | 'suspended'

export type UserTrustStatus = {
  userId: string
  trustLevel: UserTrustLevel
  warningCount: number
  restrictedUntil?: string
  updatedAt: string
}

export type MismatchReport = {
  reportId: string
  orderId: string
  reportedUserId: string
  reporterUserId: string
  reporterRole: 'mitra' | 'customer'
  reason: OrderCancelReason
  notes?: string
  createdAt: string
}

export type DiscoverParams = {
  roleToFind: AppRole
  latitude: number
  longitude: number
  radiusKm: number
  limit?: number
}

export type ExportParams = {
  fromDate?: string
  toDate?: string
  includeAllEvents?: boolean
}

export type HistoryListItemViewModel = {
  orderId: string
  shortOrderId: string
  serviceType: VehicleProfile['vehicleType']
  status: OrderStatus
  paymentMethod?: PaymentMethod
  totalAmount: number
  counterpartyDisplayName: string
  happenedAt: string
}

export type HistoryDetailViewModel = {
  orderId: string
  serviceType: VehicleProfile['vehicleType']
  status: OrderStatus
  pickupLabel: string
  destinationLabel: string
  paymentMethod?: PaymentMethod
  baseTripEstimatedPrice: number
  pickupSurchargeAmount: number
  gearDiscountAmount?: number
  waitingChargeAmount?: number
  driverDelayDeductionAmount?: number
  paymentAdminFeeTotal?: number
  estimatedPrice: number
  cancelReason?: string
  updatedAt: string
}

export type TransactionLogListItemViewModel = {
  logId: string
  shortOrderId: string
  serviceType: VehicleProfile['vehicleType']
  paymentMethod?: PaymentMethod
  estimatedPrice: number
  commissionBaseAmount: number
  commissionAmount: number
  paymentAdminFeeTotal?: number
  completedAt: string
}

export type AuditExportViewModel = {
  fromDate?: string
  toDate?: string
  includeAllEvents: boolean
  exportInProgress: boolean
  exportedFilePath?: string
  errorMessage?: string
}

export type TemporaryChatMessage = {
  messageId: string
  orderId: string
  senderUserId: string
  messageType: 'text' | 'image'
  text?: string
  fileUrl?: string
  createdAt: string
  expiresAt: string
}

export type PostTripFeedback = {
  orderId: string
  customerId: string
  partnerId: string
  rating: number
  reviewText?: string
  createdAt: string
  source: 'default_auto' | 'manual'
}

export type CustomerHomeViewModel = {
  currentRole: AppRole
  displayName: string
  hasActiveOrder: boolean
  activeOrderId?: string
  recoveryMode: boolean
  selectedServiceType?: VehicleProfile['vehicleType']
  womenPreferenceEnabled: boolean
  discoveryCount: number
  topRecommendationPartnerId?: string
  topRecommendationReason?: string
  discoveryState: 'ready' | 'empty' | 'location_required' | 'offline'
}

export type DriverHomeViewModel = {
  currentRole: AppRole
  displayName: string
  hasActiveOrder: boolean
  activeOrderId?: string
  recoveryMode: boolean
  isOnline: boolean
  identityStatus?: UserProfile['identityStatus']
  driverReadinessStatus?: DriverReadinessStatus
  activeVehicleType?: VehicleProfile['vehicleType']
  activePricePerKm?: number
  onlineGateReason?: string
  nearbyDemandCount: number
}

export type ProfileEditorViewModel = {
  displayName: string
  legalFullName?: string
  profilePhotoUri?: string
  genderDeclaration?: UserProfile['genderDeclaration']
  driverReadinessStatus?: DriverReadinessStatus
  editableWhileActiveOrder: boolean
  blockedFields?: string[]
}

export type PricingSettingsViewModel = {
  partnerPricePerKm?: number
  customerOfferPerKm?: number
  currency: 'IDR'
  editableWhileActiveOrder: boolean
  affectsCurrentOrder: false
  helperText: string
}
```

---

## 7. Repository Interfaces

```ts
export interface UserRepository {
  getProfile(): Promise<UserProfile | null>
  saveProfile(profile: UserProfile): Promise<void>
  updateCurrentRole(role: AppRole): Promise<void>
}

export interface PricingRepository {
  getPricing(userId: string): Promise<PricingProfile | null>
  savePricing(data: PricingProfile): Promise<void>
}

export interface OrderRepository {
  getActiveOrder(): Promise<Order | null>
  getOrderById(orderId: string): Promise<Order | null>
  saveOrder(order: Order): Promise<void>
  updateOrder(order: Order): Promise<void>
  setActiveOrderPointer(orderId: string): Promise<void>
  clearActiveOrderPointer(): Promise<void>
  listHistory(status?: OrderStatus, limit?: number, offset?: number): Promise<Order[]>
}

export interface AuditRepository {
  append(event: AuditEvent): Promise<void>
  listManifest(limit?: number, offset?: number): Promise<AuditManifestItem[]>
  exportBundle(params: ExportParams): Promise<string>   // returns file path
}

export interface TransactionRepository {
  recordTransaction(log: TransactionLog): Promise<void>
  listTransactions(fromDate?: string, toDate?: string): Promise<TransactionLog[]>
  exportToCsv(fromDate?: string, toDate?: string): Promise<string>   // returns file path
}
```

---

## 8. Gateway Interfaces

```ts
export interface PresenceGateway {
  publish(snapshot: PresenceSnapshot): Promise<void>
  unpublish(userId: string, role: AppRole): Promise<void>
  discover(params: DiscoverParams): Promise<PresenceSnapshot[]>
  subscribe(
    role: AppRole,
    callback: (snapshots: PresenceSnapshot[]) => void
  ): () => void   // returns unsubscribe function
}

export interface OrderSignalGateway {
  sendOrderRequest(payload: OrderRequestPayload): Promise<void>
  sendOrderResponse(orderId: string, response: 'accept' | 'reject'): Promise<void>
  sendContactReveal(payload: OrderContactRevealPayload): Promise<void>
  subscribeToIncomingOrders(
    userId: string,
    callback: (payload: OrderRequestPayload) => void
  ): () => void
  subscribeToOrderResponse(
    orderId: string,
    callback: (payload: OrderResponsePayload) => void
  ): () => void
  subscribeToContactReveal(
    orderId: string,
    callback: (payload: OrderContactRevealPayload) => void
  ): () => void
  syncActiveOrder(orderId: string): Promise<OrderSyncState | null>
}

export interface LocationGateway {
  getCurrentLocation(): Promise<LocationPoint>
  checkPermission(): Promise<'granted' | 'denied' | 'blocked'>
}

export interface MapsGateway {
  openRoute(params: { origin?: LocationPoint; destination: LocationPoint }): Promise<void>
}

export interface DialerGateway {
  call(phoneNumber: string): Promise<void>
}

export interface WhatsAppGateway {
  openChat(phoneNumber: string, text?: string): Promise<void>
}

export interface DeviceAuthGateway {
  isAvailable(): Promise<boolean>
  authenticate(reason: string): Promise<boolean>
}
```

---

## 9. Error Model

```ts
export type AppErrorCode =
  | 'LOCATION_PERMISSION_DENIED'
  | 'LOCATION_UNAVAILABLE'
  | 'INVALID_PRICE_PER_KM'
  | 'PROFILE_NOT_FOUND'
  | 'PROFILE_NOT_READY'
  | 'IDENTITY_BLOCKED'
  | 'ACCOUNT_RESTRICTED'
  | 'DELEGATED_BOOKING_REQUIRES_DECLARATION'
  | 'ROLE_NOT_ALLOWED'
  | 'DISCOVERY_UNAVAILABLE'
  | 'RELAY_UNAVAILABLE'          // BARU: relay offline / timeout
  | 'ORDER_ALREADY_ACTIVE'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_REQUEST_EXPIRED'
  | 'INVALID_ORDER_TRANSITION'
  | 'EXTERNAL_APP_NOT_AVAILABLE'
  | 'AUDIT_WRITE_FAILED'
  | 'AUDIT_EXPORT_FAILED'
  | 'DEVICE_AUTH_FAILED'
  | 'SYNC_FAILED'
  | 'ANTI_ABUSE_RATE_LIMIT'      // BARU
  | 'ANTI_ABUSE_INVALID_COORDS'  // BARU
  | 'ANTI_ABUSE_VELOCITY'        // BARU
  | 'TRANSACTION_RECORD_FAILED'  // BARU

export type AppError = {
  code: AppErrorCode
  message?: string
  context?: Record<string, unknown>
}

// Result pattern — tidak lempar exception untuk flow normal
export type Result<T, E = AppError> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error }
}
```

**Rules:**
- Jangan lempar raw string error ke UI
- UI hanya menerima `AppError.code` + mapped user-friendly message
- Internal error boleh lebih verbose tapi tidak log data sensitif

---

## 10. SQLite Schema Lengkap

### 10.1 Database Name dan Versioning
```
Database: trip_local.db
Version management: SQLite PRAGMA user_version
Migration strategy: incremental, numbered files
```

### 10.2 Schema Lengkap

```sql
-- Migration 001: initial schema

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_profile (
  user_id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  phone_masked TEXT,
  phone_hash TEXT,
  current_role TEXT NOT NULL CHECK(current_role IN ('customer', 'mitra')),
  active_roles TEXT NOT NULL DEFAULT '[]',   -- JSON array
  device_auth_enabled INTEGER NOT NULL DEFAULT 0,
  identity_status TEXT NOT NULL DEFAULT 'draft' CHECK(identity_status IN ('draft', 'active', 'blocked')),
  profile_validated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_profile (
  user_id TEXT PRIMARY KEY NOT NULL,
  partner_price_per_km REAL,
  customer_offer_per_km REAL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_table (
  order_id TEXT PRIMARY KEY NOT NULL,
  booking_session_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  booking_mode TEXT NOT NULL DEFAULT 'manual' CHECK(booking_mode IN ('manual', 'auto')),
  booking_intent TEXT NOT NULL DEFAULT 'self' CHECK(booking_intent IN ('self', 'for_other')),
  rider_declared_name TEXT NOT NULL,
  rider_phone_masked TEXT,
  pickup_json TEXT NOT NULL,             -- JSON: LocationPoint
  destination_json TEXT NOT NULL,        -- JSON: LocationPoint
  distance_estimate_km REAL NOT NULL,
  pickup_distance_from_partner_km REAL NOT NULL,
  price_per_km_applied REAL NOT NULL,
  base_trip_estimated_price REAL NOT NULL,
  pickup_surcharge_amount REAL NOT NULL DEFAULT 0,
  estimated_price REAL NOT NULL,
  status TEXT NOT NULL,
  cancel_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_manifest (
  event_id TEXT PRIMARY KEY NOT NULL,
  event_type TEXT NOT NULL,
  order_id TEXT,
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  file_name TEXT NOT NULL,
  checksum TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Migration 002: transaction log

CREATE TABLE IF NOT EXISTS transaction_log (
  log_id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  estimated_price REAL NOT NULL,
  price_per_km REAL NOT NULL,
  distance_km REAL NOT NULL,
  commission_rate REAL NOT NULL DEFAULT 0.10,
  commission_amount REAL NOT NULL,
  completed_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_status ON order_table(status);
CREATE INDEX IF NOT EXISTS idx_order_updated_at ON order_table(updated_at);
CREATE INDEX IF NOT EXISTS idx_audit_manifest_order_id ON audit_manifest(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_manifest_created_at ON audit_manifest(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_log_completed_at ON transaction_log(completed_at);
CREATE INDEX IF NOT EXISTS idx_transaction_log_partner_id ON transaction_log(partner_id);
```

### 10.3 App Settings Keys
```ts
const APP_SETTINGS_KEYS = {
  ACTIVE_ORDER_ID: 'active_order_id',           // string | null
  LAST_KNOWN_ROLE: 'last_known_role',           // AppRole
  AUDIT_FOLDER_PATH: 'audit_folder_path',       // string
  LAST_PRESENCE_PUBLISH_AT: 'last_presence_publish_at', // ISO string
  RELAY_ENABLED: 'relay_enabled',               // '0' | '1'
  ANTI_ABUSE_ENABLED: 'anti_abuse_enabled',     // '0' | '1' — default '1'
  FEMALE_DRIVER_PREFERENCE_ENABLED: 'female_driver_preference_enabled', // '0' | '1'
  ACTIVE_VEHICLE_ID: 'active_vehicle_id',       // string | null
  ACTIVE_PAYMENT_METHOD: 'active_payment_method', // cash | manual_transfer | gateway
}
```

### 10.4 Secure Storage Keys
```ts
const SECURE_STORAGE_KEYS = {
  USER_PHONE_E164: 'trip.user_phone_e164',
  DEVICE_BINDING_ID: 'trip.device_binding_id',
  AUDIT_EXPORT_GUARD_ENABLED: 'trip.audit_export_guard_enabled',
  LAST_AUTHENTICATED_AT: 'trip.last_authenticated_at',
  USER_IDENTITY_NUMBER_RAW: 'trip.user_identity_number_raw',
}
```

### 10.5 Identity Storage Rules
- Nomor telepon penuh (`phoneE164`) hanya boleh disimpan di Secure Storage
- SQLite hanya menyimpan `phone_masked`, `phone_hash`, dan `identity_status`
- `deviceBindingId` dibuat saat first launch dan wajib ada sebelum user boleh online
- `identity_status = active` hanya boleh diberikan setelah display name dan phone number lolos normalisasi dan validasi
- `identity_status = blocked` mencegah publish presence dan submit order baru sampai data diperbaiki

Driver readiness tambahan:
- jika role yang hendak online adalah `mitra`, harus ada `activeVehicle`
- jika `activeVehicle.vehicleType = motor`, `hasSpareHelmet` wajib `true`
- vehicle pricing mode dan legalitas minimum harus tersedia sebelum publish presence

Verification boundary:
- MVP memakai `minimum_valid` verification, bukan KYC legal penuh
- `flagged` dan `blocked` tidak boleh publish presence sebagai driver
- `minimum_valid` berarti format data dan konsistensi minimum lolos, bukan bukti legal yang kuat

### 10.6 Online Readiness Contract
```ts
async function validateOnlineReadiness(userId: string, role: AppRole): Promise<Result<void>> {
  const profile = await UserRepository.getProfile()
  if (!profile) return err({ code: 'PROFILE_NOT_FOUND' })

  if (profile.identityStatus === 'blocked') {
    return err({ code: 'IDENTITY_BLOCKED' })
  }

  if (profile.identityStatus !== 'active' || !profile.profileValidatedAt) {
    return err({ code: 'PROFILE_NOT_READY' })
  }

  const deviceBindingId = await SecureStorage.get(SECURE_STORAGE_KEYS.DEVICE_BINDING_ID)
  if (!deviceBindingId) {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'missing_device_binding' } })
  }

  if (role === 'mitra') {
    const readiness = await validateDriverReadiness(profile)
    if (!readiness.ok) return readiness

    const pricing = await PricingRepository.getPricing(userId)
    if (!pricing?.partnerPricePerKm) {
      return err({ code: 'INVALID_PRICE_PER_KM' })
    }
  }

  return ok(undefined)
}
```

### 10.6A Driver Readiness Extension
```ts
async function validateDriverReadiness(profile: UserProfile): Promise<Result<void>> {
  if (profile.driverReadinessStatus && profile.driverReadinessStatus !== 'minimum_valid') {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'driver_verification_not_ready', status: profile.driverReadinessStatus } })
  }

  const activeVehicle = profile.vehicles?.find(vehicle => vehicle.isActiveForBooking)
  if (!activeVehicle) return err({ code: 'PROFILE_NOT_READY', context: { reason: 'active_vehicle_missing' } })

  if (activeVehicle.verificationStatus && activeVehicle.verificationStatus !== 'minimum_valid') {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'vehicle_verification_not_ready', status: activeVehicle.verificationStatus } })
  }

  if (activeVehicle.vehicleType === 'motor' && !profile.hasSpareHelmet) {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'spare_helmet_required' } })
  }

  if (!activeVehicle.pricingMode) {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'pricing_mode_missing' } })
  }

  return ok(undefined)
}
```

### 10.6B Driver Verification Decision Matrix
| Status | Meaning | Online Driver Eligibility |
|---|---|---|
| `draft` | data belum lengkap | deny |
| `declared` | data sudah diisi tapi belum minimum-valid | deny |
| `minimum_valid` | lolos validasi format dan konsistensi minimum | allow |
| `flagged` | data janggal dan perlu ditahan | deny |
| `blocked` | data ditolak atau pola abuse berat | deny |

### 10.7 Auth Lifecycle Operational Spec
```ts
type AuthLifecycleStage =
  | 'first_install'
  | 'profile_draft'
  | 'profile_validated'
  | 'identity_active'
  | 'ready_to_online'
  | 'online'
  | 'accepted_contact_revealed'
  | 'blocked'
```

Rules:
- `first_install` → generate `userId` + `deviceBindingId`
- `profile_draft` → data masih lokal, belum boleh dipublish ke relay
- `profile_validated` → display name dan phone sudah dinormalisasi + lolos format minimum
- `identity_active` → profile boleh dipakai untuk fitur inti, tetapi exposure tetap minimum
- `ready_to_online` → identity aktif + binding device tersedia + validasi role-specific lolos
- `online` → presence publish boleh dilakukan
- `accepted_contact_revealed` → nomor telepon penuh baru boleh dibuka ke pasangan order aktif
- `blocked` → publish presence, submit order baru, dan contact reveal harus ditolak

Reality boundary:
- MVP ini membuktikan user **terdaftar dan tervalidasi minimum di device**, bukan membuktikan identitas legal secara kuat
- Untuk memastikan user benar-benar pemilik nomor/data secara kuat dibutuhkan OTP, KYC, atau operator review di fase berikutnya

### 10.8 Trust Enforcement Boundary
- Warning/punishment yang hanya lokal **tidak cukup**
- Enforcement yang survive reinstall/ganti device memerlukan metadata trust minimum di relay/backing store
- Metadata minimum yang boleh sentral:
  - `userId`
  - `warningCount`
  - `trustLevel`
  - `restrictedUntil`
- Metadata ini bukan source of truth trip, tetapi source of truth untuk **status enforcement auth**
- Jika `trustLevel = delegated_booking_restricted`, app harus menolak `bookingIntent = for_other`
- Jika `trustLevel = restricted|suspended`, app harus menolak submit order baru

### 10.9 Trust Enforcement Decision Table
Preconditions agar report layak diproses:
- `reporterRole = 'mitra'`
- reporter memang adalah `partnerId` pada order tersebut
- order minimal berstatus `Accepted`
- reason code masuk daftar resmi
- report tidak duplikat untuk kombinasi `orderId + reporterUserId + reason`

Cases yang **tidak boleh** menaikkan punishment:
- `bookingIntent = for_other` dan `riderDeclaredName` sesuai dengan rider aktual
- delegated booking sah tetapi hanya terjadi kebingungan komunikasi biasa
- report tanpa konteks minimum atau report duplikat

Decision table:

| Input condition | Enforcement result |
|----------------|--------------------|
| `bookingIntent=self` dan tidak ada mismatch nyata | ignore punishment |
| `bookingIntent=for_other` dan rider sesuai deklarasi | ignore punishment |
| `undeclared_rider` pada order aktif | issue warning |
| `contact_mismatch` pada order aktif | issue warning |
| `undeclared_rider` berulang 2x dalam rolling window | `trustLevel = delegated_booking_restricted` |
| `contact_mismatch` berulang lintas mitra | `trustLevel = restricted` |
| `unsafe_or_suspicious` dari beberapa mitra berbeda | `trustLevel = suspended` |
| report tunggal yang ambiguous | audit only, no automatic punishment |

Escalation rules:
- Warning pertama → tulis `AUTH_WARNING_ISSUED`
- Restriction/suspension → tulis `ACCOUNT_RESTRICTED`
- Restriction tidak menghapus histori lokal; hanya mengubah status enforcement auth

### 10.10 Trust Enforcement State Machine
```ts
const TRUST_TRANSITIONS: Record<UserTrustLevel, UserTrustLevel[]> = {
  clear: ['warned'],
  warned: ['clear', 'delegated_booking_restricted', 'restricted'],
  delegated_booking_restricted: ['warned', 'clear', 'restricted'],
  restricted: ['warned', 'clear', 'suspended'],
  suspended: ['restricted', 'warned', 'clear'],
}
```

Transition rules:
- `clear -> warned` saat mismatch valid pertama
- `warned -> delegated_booking_restricted` saat ada `undeclared_rider` atau `contact_mismatch` berulang
- `warned -> restricted` saat ada mismatch berat lintas mitra
- `delegated_booking_restricted -> restricted` saat abuse tetap berulang setelah pembatasan
- `restricted -> suspended` saat ada pola abuse kuat atau `unsafe_or_suspicious` yang tervalidasi
- `warned|delegated_booking_restricted|restricted -> clear` hanya lewat cooldown policy atau review manual

Enforcement mapping:
- `clear` → semua fitur normal
- `warned` → fitur normal, tetapi warning tampil dan audit wajib ditulis
- `delegated_booking_restricted` → `bookingIntent = for_other` harus ditolak
- `restricted` → submit order baru harus ditolak
- `suspended` → fitur transaksi utama harus ditolak

---

## 11. Audit Binary Specification

### 11.1 File Structure
```
/AUDIT/
  manifest → stored in audit_manifest SQLite table
  events/
    YYYY-MM/
      evt_<eventId>.bin
  exports/
    audit-export-<YYYYMMDD-HHmmss>.tripaudit   (ZIP bundle)
```

### 11.2 Binary Record Format
```
Byte layout (little-endian):

[0..1]    version       : uint16  = 1
[2..3]    eventTypeCode : uint16  (see enum below)
[4..11]   timestampMs   : uint64  (Unix epoch milliseconds)
[12]      actorRoleCode : uint8   (0=customer, 1=mitra, 2=system)
[13..28]  actorUserId   : 16 bytes UUID (binary)
[29..44]  orderId       : 16 bytes UUID (binary), zeros if not applicable
[45..48]  payloadLength : uint32
[49..N]   payload       : MessagePack-encoded dict
[N+1..N+4] checksum     : uint32 CRC32 over bytes [0..N]
```

### 11.2A Peran Binary Audit
- File binary audit ditulis ke file system device saat event terjadi
- File ini tidak menjadi bagian dari app binary yang di-install
- File ini tidak digunakan untuk presence, order signaling, atau komunikasi live antar user
- Tujuannya adalah audit trail lokal yang compact, durable, dan mudah diexport

### 11.3 Event Type Codes
```ts
const AUDIT_EVENT_CODES: Record<AuditEventType, number> = {
  BOOTSTRAP_COMPLETE:              0x0001,
  ROLE_SELECTED:                   0x0010,
  ROLE_SWITCHED:                   0x0011,
  PROFILE_VALIDATED:               0x0012,
  IDENTITY_BLOCKED:                0x0013,
  LOCATION_PERMISSION_GRANTED:     0x0020,
  LOCATION_PERMISSION_DENIED:      0x0021,
  USER_WENT_ONLINE:                0x0030,
  USER_WENT_OFFLINE:               0x0031,
  PRICING_UPDATED:                 0x0040,
  ORDER_DRAFT_CREATED:             0x0100,
  ORDER_REQUESTED:                 0x0101,
  ORDER_ACCEPTED:                  0x0102,
  ORDER_REJECTED:                  0x0103,
  ORDER_EXPIRED:                   0x0104,
  ORDER_ON_THE_WAY:                0x0105,
  ORDER_ON_TRIP:                   0x0106,
  ORDER_COMPLETED:                 0x0107,
  ORDER_CANCELED:                  0x0108,
  CONTACT_REVEALED:                0x0109,
  TRIP_IDENTITY_MISMATCH_REPORTED: 0x0110,
  AUTH_WARNING_ISSUED:             0x0111,
  ACCOUNT_RESTRICTED:              0x0112,
  HANDOFF_MAPS_ATTEMPTED:          0x0200,
  HANDOFF_MAPS_OPENED:             0x0201,
  HANDOFF_MAPS_FAILED:             0x0202,
  HANDOFF_CALL_ATTEMPTED:          0x0210,
  HANDOFF_CALL_OPENED:             0x0211,
  HANDOFF_WHATSAPP_ATTEMPTED:      0x0220,
  HANDOFF_WHATSAPP_OPENED:         0x0221,
  HANDOFF_WHATSAPP_FAILED:         0x0222,
  AUDIT_EXPORTED:                  0x0300,
  RECOVERY_TRIGGERED:              0x0400,
  ANTI_ABUSE_VIOLATION:            0x0500,
  TRANSACTION_RECORDED:            0x0600,
}
```

### 11.4 Write Process
```ts
async function appendAuditEvent(event: AuditEvent): Promise<void> {
  // 1. Validate event not null
  // 2. Encode payload dengan MessagePack
  // 3. Build binary record (header + payload + placeholder checksum)
  // 4. Hitung CRC32 atas bytes 0..N
  // 5. Tulis CRC32 ke posisi akhir
  // 6. Tentukan path: AUDIT/events/YYYY-MM/evt_<eventId>.bin
  // 7. Tulis ke temp file: evt_<eventId>.bin.tmp
  // 8. Rename atomik ke final path
  // 9. Insert ke audit_manifest SQLite
  // 10. Jika langkah 8 atau 9 gagal → log error, tulis ke fallback queue
}
```

### 11.5 Export Bundle
```
.tripaudit file adalah ZIP yang berisi:
  manifest.json         — export dari audit_manifest untuk range yang dipilih
  events/               — semua .bin file yang di-include
  export_meta.json      — {exportedAt, deviceId, tripVersion, eventCount}
```

---

## 12. Presence Specification

### 12.1 Supabase Realtime Implementation
```ts
// Channel naming
const PRESENCE_CHANNEL_MITRA = 'presence:mitra'
const PRESENCE_CHANNEL_CUSTOMER = 'presence:customer'

// Publish cadence
const PRESENCE_REFRESH_INTERVAL_MS = 20_000   // 20 detik
const PRESENCE_TTL_SECONDS = 90               // 1.5 menit

// Filter
const DISCOVERY_DEFAULT_RADIUS_KM = 3
const DISCOVERY_MAX_RESULTS = 50
```

### 12.2 Publish Sequence
```ts
async function goOnline(): Promise<Result<void>> {
  // 0. Validate identity dan readiness
  const readiness = await validateOnlineReadiness(userId, currentRole)
  if (!readiness.ok) return readiness

  // 1. Dapatkan lokasi terkini
  const location = await LocationGateway.getCurrentLocation()
  if (!location) return err({ code: 'LOCATION_UNAVAILABLE' })

  // 2. Anti-abuse: validate coordinates
  if (!isValidIndonesiaCoords(location)) {
    await auditGateway.append(buildEvent('ANTI_ABUSE_VIOLATION', { reason: 'invalid_coords' }))
    return err({ code: 'ANTI_ABUSE_INVALID_COORDS' })
  }

  // 3. Anti-abuse: rate limit check
  const lastPublish = await getLastPresencePublishAt()
  if (lastPublish && msSince(lastPublish) < 10_000) {
    return err({ code: 'ANTI_ABUSE_RATE_LIMIT' })
  }

  // 4. Validate pricing
  const pricing = await PricingRepository.getPricing(userId)
  if (!pricing?.partnerPricePerKm && currentRole === 'mitra') {
    return err({ code: 'INVALID_PRICE_PER_KM' })
  }

  // 5. Build snapshot
  const snapshot: PresenceSnapshot = {
    userId, role: currentRole,
    isOnline: true,
    latitude: location.latitude,
    longitude: location.longitude,
    visiblePricePerKm: resolveVisiblePrice(pricing, currentRole),
    timestamp: now(),
    ttlSeconds: PRESENCE_TTL_SECONDS,
  }

  // 6. Publish ke Supabase channel
  await PresenceGateway.publish(snapshot)

  // 7. Update state dan audit
  setIsOnline(true)
  await saveLastPresencePublishAt(now())
  await appendAuditEvent(buildEvent('USER_WENT_ONLINE', snapshot))
  
  // 8. Mulai refresh loop
  startPresenceRefreshLoop()
  
  return ok(undefined)
}
```

### 12.3 Anti-Abuse: Coordinate Validation
```ts
function isValidIndonesiaCoords(point: LocationPoint): boolean {
  return (
    point.latitude >= -11 &&
    point.latitude <= 6 &&
    point.longitude >= 95 &&
    point.longitude <= 141 &&
    isFinite(point.latitude) &&
    isFinite(point.longitude)
  )
}
```

### 12.4 Anti-Abuse: Velocity Check
```ts
const MAX_SPEED_KMH = 150  // 150 km/h = batas wajar untuk kendaraan bermotor

function isVelocityValid(
  prevSnapshot: PresenceSnapshot,
  newLocation: LocationPoint,
  currentTimeMs: number
): boolean {
  const prevTimeMs = new Date(prevSnapshot.timestamp).getTime()
  const elapsedHours = (currentTimeMs - prevTimeMs) / 3_600_000
  if (elapsedHours <= 0) return false

  const distKm = haversineDistanceKm(
    prevSnapshot.latitude, prevSnapshot.longitude,
    newLocation.latitude, newLocation.longitude
  )

  const speedKmh = distKm / elapsedHours
  return speedKmh <= MAX_SPEED_KMH
}
```

### 12.5 Discovery Filtering dan Sorting
```ts
function filterAndSortDiscovery(
  snapshots: PresenceSnapshot[],
  viewerLocation: LocationPoint,
  radiusKm: number,
  now: number
): PresenceSnapshot[] {
  return snapshots
    .filter(s => s.isOnline)
    .filter(s => {
      const ageMs = now - new Date(s.timestamp).getTime()
      return ageMs < s.ttlSeconds * 1000
    })
    .filter(s => s.visiblePricePerKm > 0)
    .map(s => ({
      ...s,
      _distKm: haversineDistanceKm(
        viewerLocation.latitude, viewerLocation.longitude,
        s.latitude, s.longitude
      )
    }))
    .filter(s => s._distKm <= radiusKm)
    .sort((a, b) => {
      if (a._distKm !== b._distKm) return a._distKm - b._distKm
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    .slice(0, DISCOVERY_MAX_RESULTS)
}
```

---

## 13. Order Signaling Specification

### 13.1 Supabase Channel Setup
```ts
// Mitra subscribe ke incoming order channel
const INCOMING_ORDER_CHANNEL = (partnerId: string) => `order:incoming:${partnerId}`

// Customer subscribe ke response channel
const ORDER_RESPONSE_CHANNEL = (orderId: string) => `order:response:${orderId}`
```

### 13.2 Order Request Timeout
```ts
const ORDER_REQUEST_TIMEOUT_SECONDS = 60

async function submitOrder(draftId: string): Promise<Result<Order>> {
  // ... build payload ...
  
  const expiresAt = new Date(Date.now() + ORDER_REQUEST_TIMEOUT_SECONDS * 1000).toISOString()
  const payload: OrderRequestPayload = {
    ...orderData,
    expiresAt,
    createdAt: now()
  }
  
  // Simpan lokal dulu sebelum kirim
  await OrderRepository.saveOrder(updatedOrder)
  await OrderRepository.setActiveOrderPointer(draftId)
  
  // Kirim ke relay
  await OrderSignalGateway.sendOrderRequest(payload)
  await appendAuditEvent(buildEvent('ORDER_REQUESTED', payload))
  
  // Mulai timeout timer di client
  startOrderTimeout(draftId, ORDER_REQUEST_TIMEOUT_SECONDS, () => {
    handleOrderExpired(draftId)
  })
  
  return ok(updatedOrder)
}
```

### 13.2B Booking Mode Resolution Contract
```ts
function resolveBookingTarget(params: {
  bookingMode: BookingMode
  discoveryItems: PresenceSnapshot[]
  selectedPartnerId?: string
  pickup: LocationPoint
  now: number
}): Result<PresenceSnapshot> {
  const freshCandidates = filterAndSortDiscovery(
    params.discoveryItems,
    params.pickup,
    DISCOVERY_DEFAULT_RADIUS_KM,
    params.now
  )

  if (params.bookingMode === 'manual') {
    const selected = freshCandidates.find(item => item.userId === params.selectedPartnerId)
    return selected
      ? ok(selected)
      : err({ code: 'DISCOVERY_UNAVAILABLE', context: { reason: 'selected_partner_not_available' } })
  }

  const ranked = rankAutoBookingCandidates(freshCandidates, params.pickup)
  const best = ranked[0]
  return best
    ? ok(best)
    : err({ code: 'DISCOVERY_UNAVAILABLE', context: { reason: 'no_eligible_partner' } })
}
```

### 13.2B.1 Candidate Filtering Contract
```ts
function filterEligibleBookingCandidates(params: {
  discoveryItems: PresenceSnapshot[]
  candidateProfiles: UserProfile[]
  serviceType: VehicleProfile['vehicleType']
  passengerCount?: number
  prefersFemaleDriver: boolean
  pickup: LocationPoint
  now: number
}): PresenceSnapshot[] {
  const freshCandidates = filterAndSortDiscovery(
    params.discoveryItems,
    params.pickup,
    DISCOVERY_DEFAULT_RADIUS_KM,
    params.now
  )

  return freshCandidates.filter(snapshot => {
    const profile = params.candidateProfiles.find(candidate => candidate.userId === snapshot.userId)
    const activeVehicle = profile?.vehicles?.find(vehicle => vehicle.isActiveForBooking)
    if (!profile || !activeVehicle) return false
    if (profile.driverReadinessStatus !== 'minimum_valid') return false
    if (activeVehicle.verificationStatus && activeVehicle.verificationStatus !== 'minimum_valid') return false
    if (activeVehicle.vehicleType !== params.serviceType) return false
    if (params.prefersFemaleDriver && profile.genderDeclaration !== 'female') return false
    if (activeVehicle.pricingMode === 'per_seat' && params.passengerCount && activeVehicle.seatCapacity && activeVehicle.seatCapacity < params.passengerCount) return false
    return true
  })
}
```

### 13.2C Auto Booking Ranking Contract
```ts
function rankAutoBookingCandidates(
  candidates: PresenceSnapshot[],
  pickup: LocationPoint
): PresenceSnapshot[] {
  return candidates
    .filter(candidate => candidate.role === 'mitra')
    .filter(candidate => candidate.isOnline)
    .sort((a, b) => {
      const distA = haversineDistanceKm(pickup.latitude, pickup.longitude, a.latitude, a.longitude)
      const distB = haversineDistanceKm(pickup.latitude, pickup.longitude, b.latitude, b.longitude)
      const surchargeA = calculatePickupSurcharge(distA, a.visiblePricePerKm)
      const surchargeB = calculatePickupSurcharge(distB, b.visiblePricePerKm)

      if (surchargeA !== surchargeB) return surchargeA - surchargeB
      if (distA !== distB) return distA - distB
      if (a.visiblePricePerKm !== b.visiblePricePerKm) return a.visiblePricePerKm - b.visiblePricePerKm
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
}
```

Rules:
- `manual` → customer memilih satu mitra spesifik
- `auto` → target dipilih oleh ranking lokal di device customer
- Tidak boleh fanout ke banyak mitra sekaligus dalam satu attempt
- Jika ingin retry kandidat berikutnya setelah reject/timeout, lakukan **sequential retry** dengan attempt baru yang masih membawa `bookingSessionId` yang sama
- Rating/review publik dan kualitas kendaraan **tidak** dipakai untuk ranking MVP karena source of truth belum cukup kuat
- Ranking auto booking harus memperhitungkan pickup surcharge agar kandidat yang dipilih tetap masuk akal dari sisi total biaya customer

### 13.2C.1 Safety Preference Filter dan Recommendation Contract
```ts
function filterCandidatesBySafetyPreference(params: {
  candidates: UserProfile[]
  prefersFemaleDriver: boolean
}): UserProfile[] {
  if (!params.prefersFemaleDriver) return params.candidates
  return params.candidates.filter(candidate => candidate.genderDeclaration === 'female')
}

function buildRecommendationReason(params: {
  matchedFemalePreference: boolean
  cheaperTotal: boolean
  closerPickup: boolean
}): string[] {
  const reasons: string[] = []
  if (params.matchedFemalePreference) reasons.push('sesuai preferensi driver perempuan')
  if (params.closerPickup) reasons.push('lebih dekat ke pickup')
  if (params.cheaperTotal) reasons.push('estimasi total lebih ringan')
  return reasons
}
```

Rules:
- `prefersFemaleDriver` default `false`
- `genderDeclaration` driver pada MVP bersifat deklaratif
- Jika preference aktif dan hasil filter kosong, UI harus mengembalikan state `no_matching_driver_for_preference`
- Recommendation tidak boleh menjadi black box; minimal satu alasan rekomendasi harus ditampilkan ke customer
- Recommendation tidak boleh menghilangkan akses ke daftar kandidat lain yang masih eligible bila preference tidak aktif

### 13.2A Booking Validation dan Freeze Contract
```ts
function validateBookingDraft(params: {
  customerId: string
  currentRole: AppRole
  serviceType: VehicleProfile['vehicleType']
  pickup: LocationPoint
  destination: LocationPoint
  bookingMode: BookingMode
  selectedPartnerSnapshot: PresenceSnapshot
  bookingIntent: BookingIntent
  riderDeclaredName: string
  riderPhoneMasked?: string
  passengerCount?: number
  paymentMethod?: PaymentMethod
  bringsOwnHelmet?: boolean
  bringsOwnRaincoat?: boolean
  activeOrder: Order | null
}): Result<void> {
  if (params.currentRole !== 'customer') {
    return err({ code: 'ROLE_NOT_ALLOWED' })
  }

  if (params.activeOrder && !isTerminal(params.activeOrder.status)) {
    return err({ code: 'ORDER_ALREADY_ACTIVE' })
  }

  if (params.customerId === params.selectedPartnerSnapshot.userId) {
    return err({ code: 'ROLE_NOT_ALLOWED', context: { reason: 'self_booking_not_allowed' } })
  }

  if (!isValidIndonesiaCoords(params.pickup) || !isValidIndonesiaCoords(params.destination)) {
    return err({ code: 'ANTI_ABUSE_INVALID_COORDS' })
  }

  if (!params.paymentMethod) {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'payment_method_missing' } })
  }

  if (params.selectedPartnerSnapshot.role !== 'mitra' || !params.selectedPartnerSnapshot.isOnline) {
    return err({ code: 'DISCOVERY_UNAVAILABLE', context: { reason: 'partner_not_available' } })
  }

  const snapshotAgeMs = Date.now() - new Date(params.selectedPartnerSnapshot.timestamp).getTime()
  if (snapshotAgeMs >= params.selectedPartnerSnapshot.ttlSeconds * 1000) {
    return err({ code: 'DISCOVERY_UNAVAILABLE', context: { reason: 'partner_snapshot_stale' } })
  }

  if (params.bookingIntent === 'self' && params.riderDeclaredName.trim() === '') {
    return err({ code: 'DELEGATED_BOOKING_REQUIRES_DECLARATION', context: { reason: 'missing_rider_name' } })
  }

  if (params.bookingIntent === 'for_other' && (!params.riderDeclaredName.trim() || !params.riderPhoneMasked)) {
    return err({ code: 'DELEGATED_BOOKING_REQUIRES_DECLARATION' })
  }

  if (params.serviceType === 'mobil' && (!params.passengerCount || params.passengerCount <= 0)) {
    return err({ code: 'PROFILE_NOT_READY', context: { reason: 'passenger_count_required' } })
  }

  return ok(undefined)
}
```

Freeze rules:
- `Draft` masih editable
- Saat submit berhasil dibuat, field berikut menjadi immutable untuk order tersebut:
  - `bookingMode`
  - `partnerId`
  - `pickup`
  - `destination`
  - `bookingIntent`
  - `riderDeclaredName`
  - `riderPhoneMasked`
  - `pickupDistanceFromPartnerKm`
  - `pricePerKmApplied`
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `estimatedPrice`
- Jika customer ingin mengubah salah satu field immutable setelah `Requested`, flow yang benar adalah cancel lalu buat order baru

Booking intent rules:
- `bookingIntent = self` → `riderDeclaredName` harus sama dengan `customerDisplayName`
- `bookingIntent = for_other` → `riderDeclaredName` wajib diisi dan `riderPhoneMasked` wajib tersedia
- Jika `bookingIntent = for_other` tapi declaration tidak lengkap, return `DELEGATED_BOOKING_REQUIRES_DECLARATION`
- Jika `trustLevel = delegated_booking_restricted|restricted|suspended`, submit order untuk `for_other` harus ditolak dengan `ACCOUNT_RESTRICTED`

Booking mode rules:
- `bookingMode = manual` → `selectedPartnerSnapshot` wajib berasal dari pilihan eksplisit user
- `bookingMode = auto` → `selectedPartnerSnapshot` wajib berasal dari hasil `resolveBookingTarget()`
- `bookingMode = auto` tidak boleh mengirim request paralel ke banyak mitra

### 13.2A.1 Final Quote Builder Contract
```ts
function buildFinalBookingQuote(params: {
  serviceType: VehicleProfile['vehicleType']
  tripDistanceKm: number
  pickupDistanceFromPartnerKm: number
  pricePerKm: number
  paymentMethod: PaymentMethod
  passengerCount?: number
  additionalPassengerPricePerKm?: number
  bringsOwnHelmet?: boolean
  bringsOwnRaincoat?: boolean
  isRaining?: boolean
  paymentAdminFeeTotal?: number
}) {
  const baseTripEstimatedPrice =
    params.serviceType === 'mobil' && params.passengerCount && params.passengerCount > 1
      ? calculateSeatBasedEstimatedPrice({
          distanceKm: params.tripDistanceKm,
          basePricePerKm: params.pricePerKm,
          additionalPassengerPricePerKm: params.additionalPassengerPricePerKm ?? 0,
          passengerCount: params.passengerCount,
        })
      : calculateEstimatedPrice(params.tripDistanceKm, params.pricePerKm)

  const pickupSurchargeAmount = calculatePickupSurcharge(params.pickupDistanceFromPartnerKm, params.pricePerKm)
  const gearDiscountAmount = calculateRiderGearDiscount({
    vehicleType: params.serviceType,
    bringsOwnHelmet: !!params.bringsOwnHelmet,
    bringsOwnRaincoat: !!params.bringsOwnRaincoat,
    isRaining: !!params.isRaining,
    distanceKm: params.tripDistanceKm,
  })

  const estimatedPrice = Math.max(0, baseTripEstimatedPrice + pickupSurchargeAmount - gearDiscountAmount)
  const paymentQuote = buildPaymentQuote({
    estimatedPrice,
    paymentMethod: params.paymentMethod,
    paymentAdminFeeTotal: params.paymentAdminFeeTotal,
  })

  return {
    baseTripEstimatedPrice,
    pickupSurchargeAmount,
    gearDiscountAmount,
    estimatedPrice,
    ...paymentQuote,
  }
}
```

### 13.2A.2 Failure State Contract
```ts
export type BookingFailureState =
  | 'booking_form_incomplete'
  | 'payment_method_not_ready'
  | 'no_eligible_driver'
  | 'no_matching_driver_for_preference'
  | 'selected_driver_stale'
  | 'auto_booking_candidates_exhausted'
```

### 13.3 Idempotency Rules
- `orderId` dibuat UUID v4 di client, dijamin unik
- Response accept/reject yang diterima kedua kali untuk orderId yang sama → ignored
- Status update dengan `version <= knownVersion` → ignored
- Order yang sudah terminal state → semua signal untuk orderId ini di-ignore

### 13.4 Payload Expiry Validation (di sisi mitra)
```ts
function isOrderPayloadValid(payload: OrderRequestPayload): boolean {
  const expiresAt = new Date(payload.expiresAt).getTime()
  const now = Date.now()
  
  // Reject jika sudah expired
  if (now > expiresAt) return false
  
  // Reject jika terlalu jauh di masa depan (> 70 detik dari createdAt)
  const createdAt = new Date(payload.createdAt).getTime()
  if (now < createdAt - 5000) return false  // allow 5s clock skew

  if (payload.distanceEstimateKm <= 0) return false
  if (payload.pickupDistanceFromPartnerKm < 0) return false
  if (payload.pricePerKmApplied <= 0) return false
  if (payload.baseTripEstimatedPrice < 0) return false
  if (payload.pickupSurchargeAmount < 0) return false
  if (payload.estimatedPrice !== payload.baseTripEstimatedPrice + payload.pickupSurchargeAmount) return false
  
  return true
}
```

### 13.4A Incoming Order Decision Contract
```ts
function validateIncomingOrderDecision(params: {
  payload: OrderRequestPayload
  localPartnerId: string
  activeOrder: Order | null
  currentTrustLevel: UserTrustLevel
  localOrderStatus?: OrderStatus
}): Result<void> {
  if (params.payload.partnerId !== params.localPartnerId) {
    return err({ code: 'ROLE_NOT_ALLOWED', context: { reason: 'wrong_target_partner' } })
  }

  if (!isOrderPayloadValid(params.payload)) {
    return err({ code: 'ORDER_REQUEST_EXPIRED', context: { reason: 'payload_invalid_or_expired' } })
  }

  if (params.activeOrder && !isTerminal(params.activeOrder.status)) {
    return err({ code: 'ORDER_ALREADY_ACTIVE' })
  }

  if (params.currentTrustLevel === 'restricted' || params.currentTrustLevel === 'suspended') {
    return err({ code: 'ACCOUNT_RESTRICTED' })
  }

  if (params.localOrderStatus && params.localOrderStatus !== 'Requested') {
    return err({ code: 'INVALID_ORDER_TRANSITION', context: { current: params.localOrderStatus, attempted: 'Accepted' } })
  }

  return ok(undefined)
}
```

Rules:
- `Accept` hanya boleh dilakukan jika `validateIncomingOrderDecision()` lolos
- `Reject` oleh user harus mengirim `responseReasonCode`
- Reject sistem karena payload rusak memakai `payload_invalid`
- Reject sistem karena timer habis memakai `expired`
- `bookingMode = manual` → reject/expired mengakhiri flow dan customer harus memilih mitra lagi
- `bookingMode = auto` → reject/expired boleh memicu candidate berikutnya secara berurutan dalam `bookingSessionId` yang sama
- Response kedua atau response terlambat untuk `orderId` yang sama harus di-ignore
- `for_other` tanpa declaration lengkap harus diperlakukan sebagai order invalid dan boleh direject dengan `undeclared_rider`

---

## 14. Order State Machine Specification

### 14.1 Transition Map
```ts
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Draft:      ['Requested', 'Canceled'],
  Requested:  ['Accepted', 'Rejected', 'Expired', 'Canceled'],
  Accepted:   ['OnTheWay', 'Canceled'],
  OnTheWay:   ['OnTrip', 'Canceled'],
  OnTrip:     ['Completed', 'Canceled'],
  Completed:  [],
  Canceled:   [],
  Rejected:   [],
  Expired:    [],
}

const TERMINAL_STATUSES: OrderStatus[] = [
  'Completed', 'Canceled', 'Rejected', 'Expired'
]
```

### 14.2 State Machine Function
```ts
export function transitionOrder(
  order: Order,
  nextStatus: OrderStatus,
  reason?: string
): Result<Order> {
  if (TERMINAL_STATUSES.includes(order.status)) {
    return err({
      code: 'INVALID_ORDER_TRANSITION',
      context: { current: order.status, attempted: nextStatus }
    })
  }
  
  const allowed = ALLOWED_TRANSITIONS[order.status]
  if (!allowed.includes(nextStatus)) {
    return err({
      code: 'INVALID_ORDER_TRANSITION',
      context: { current: order.status, attempted: nextStatus, allowed }
    })
  }
  
  return ok({
    ...order,
    status: nextStatus,
    cancelReason: nextStatus === 'Canceled' ? (reason ?? 'unspecified') : undefined,
    updatedAt: now(),
  })
}
```

### 14.3 Cancel Rules
```ts
// Customer dapat cancel saat:
const CUSTOMER_CAN_CANCEL: OrderStatus[] = ['Requested', 'Accepted', 'OnTheWay', 'OnTrip']

// Mitra dapat cancel saat:
const PARTNER_CAN_CANCEL: OrderStatus[] = ['Accepted', 'OnTheWay', 'OnTrip']
```

Allowed cancel reason codes:
- `user_changed_mind`
- `no_show`
- `identity_mismatch`
- `undeclared_rider`
- `contact_mismatch`
- `unsafe_or_suspicious`
- `pickup_mismatch`
- `other`

Rules:
- Cancel dengan reason `identity_mismatch`, `undeclared_rider`, `contact_mismatch`, atau `unsafe_or_suspicious` harus memicu audit event `TRIP_IDENTITY_MISMATCH_REPORTED`
- Sistem tidak boleh memaksa trip lanjut jika salah satu pihak menyatakan mismatch serius setelah contact reveal atau pertemuan fisik
- Mismatch report tidak otomatis membuktikan fraud, tetapi harus menjadi bukti operasional untuk dispute dan tindak lanjut
- `no_show` hanya valid setelah milestone `arrived_at_pickup`
- `user_changed_mind` tidak boleh memicu punishment otomatis
- Setelah `OnTrip`, `no_show` tidak lagi valid dan cancel harus diperlakukan sebagai cancel darurat

Enforcement escalation:
- Mismatch report valid dari mitra → minimal warning ke customer
- Repeated `undeclared_rider` atau `contact_mismatch` → `trustLevel = delegated_booking_restricted`
- Repeated mismatch lintas mitra atau `unsafe_or_suspicious` → `trustLevel = restricted|suspended`
- Setiap kenaikan enforcement level wajib menulis audit event `AUTH_WARNING_ISSUED` atau `ACCOUNT_RESTRICTED`

---

## 15. Pricing Specification

### 15.1 Constants
```ts
export const PRICING_CONSTRAINTS = {
  minPartnerPricePerKm: 2000,     // Rp 2.000 (configurable)
  maxPartnerPricePerKm: 8000,     // Rp 8.000 (configurable)
  roundingUnit: 500,              // Pembulatan ke Rp 500 terdekat
  freePickupRadiusKm: 3,          // Jarak penjemputan gratis sampai 3 km
  freeWaitingSeconds: 300,        // 5 menit gratis
  waitingStepSeconds: 300,        // kelipatan 5 menit
  helmetDiscountPerKm: 500,
  rainGearDiscountPerKm: 500,
  currency: 'IDR' as const,
}
```

### 15.2 Validation
```ts
export function validatePartnerPrice(value: number): Result<number> {
  if (!isFinite(value) || isNaN(value)) {
    return err({ code: 'INVALID_PRICE_PER_KM', context: { value } })
  }
  if (value < PRICING_CONSTRAINTS.minPartnerPricePerKm) {
    return err({ code: 'INVALID_PRICE_PER_KM', context: { value, min: PRICING_CONSTRAINTS.minPartnerPricePerKm } })
  }
  if (value > PRICING_CONSTRAINTS.maxPartnerPricePerKm) {
    return err({ code: 'INVALID_PRICE_PER_KM', context: { value, max: PRICING_CONSTRAINTS.maxPartnerPricePerKm } })
  }
  return ok(Math.round(value))
}
```

### 15.3 Price Calculation
```ts
export function calculateEstimatedPrice(
  distanceKm: number,
  pricePerKm: number
): number {
  const raw = distanceKm * pricePerKm
  // Round up ke unit Rp 500
  return Math.ceil(raw / PRICING_CONSTRAINTS.roundingUnit) * PRICING_CONSTRAINTS.roundingUnit
}

export function calculatePickupSurcharge(
  pickupDistanceFromPartnerKm: number,
  pricePerKm: number
): number {
  const chargeableKm = Math.max(0, pickupDistanceFromPartnerKm - PRICING_CONSTRAINTS.freePickupRadiusKm)
  return Math.round(chargeableKm * pricePerKm)
}

export function calculateTotalEstimatedPrice(
  tripDistanceKm: number,
  pickupDistanceFromPartnerKm: number,
  pricePerKm: number
): {
  baseTripEstimatedPrice: number
  pickupSurchargeAmount: number
  totalEstimatedPrice: number
} {
  const baseTripEstimatedPrice = calculateEstimatedPrice(tripDistanceKm, pricePerKm)
  const pickupSurchargeAmount = calculatePickupSurcharge(pickupDistanceFromPartnerKm, pricePerKm)

  return {
    baseTripEstimatedPrice,
    pickupSurchargeAmount,
    totalEstimatedPrice: baseTripEstimatedPrice + pickupSurchargeAmount,
  }
}

export function resolveAppliedPrice(
  partnerPricePerKm: number,
  customerOfferPerKm?: number
): number {
  return customerOfferPerKm ?? partnerPricePerKm
}
```

### 15.3A Multi-Vehicle and Per-Seat Pricing
```ts
export function calculateSeatBasedEstimatedPrice(params: {
  distanceKm: number
  basePricePerKm: number
  additionalPassengerPricePerKm: number
  passengerCount: number
}): number {
  const additionalPassengers = Math.max(0, params.passengerCount - 1)
  const effectivePricePerKm =
    params.basePricePerKm + (additionalPassengers * params.additionalPassengerPricePerKm)

  return calculateEstimatedPrice(params.distanceKm, effectivePricePerKm)
}
```

Rules:
- `motor` default `pricingMode = per_vehicle`
- `mobil` dan `bajaj` boleh `pricingMode = per_seat`
- `angkot` diarahkan ke `fixed_price` berbasis rute/tarif tetap
- Untuk `per_seat`, passenger count wajib ada di booking draft
- `angkot` eventual `fixed_price` membutuhkan flow terpisah dan tidak masuk MVP pilot

### 15.3A.1 Service Matrix Lock
| Service Type | Pricing Mode | Booking Model | Scope |
|---|---|---|---|
| `motor` | `per_vehicle` | personal ride | MVP Pilot |
| `mobil` | `per_seat` | personal/shared small group | MVP Pilot |
| `bajaj` | `per_seat` | personal/shared small group | Phase 2 |
| `angkot` | `fixed_price` | route/fixed fare | Phase 2+ |

### 15.3B Waiting Fairness Calculation
```ts
export function calculateWaitingCharge(waitingSeconds: number, pricePerKm: number): number {
  if (waitingSeconds <= PRICING_CONSTRAINTS.freeWaitingSeconds) return 0

  const chargeableSeconds = waitingSeconds - PRICING_CONSTRAINTS.freeWaitingSeconds
  const steps = Math.ceil(chargeableSeconds / PRICING_CONSTRAINTS.waitingStepSeconds)
  return steps * pricePerKm
}

export function calculateDriverDelayDeduction(idleSecondsAfterAccept: number, pricePerKm: number): number {
  if (idleSecondsAfterAccept <= PRICING_CONSTRAINTS.freeWaitingSeconds) return 0

  const chargeableSeconds = idleSecondsAfterAccept - PRICING_CONSTRAINTS.freeWaitingSeconds
  const steps = Math.ceil(chargeableSeconds / PRICING_CONSTRAINTS.waitingStepSeconds)
  return steps * pricePerKm
}
```

### 15.3C Rider Gear Discount
```ts
export function calculateRiderGearDiscount(params: {
  vehicleType: VehicleProfile['vehicleType']
  bringsOwnHelmet: boolean
  bringsOwnRaincoat: boolean
  isRaining: boolean
  distanceKm: number
}): number {
  if (params.vehicleType !== 'motor') return 0

  let discountPerKm = 0
  if (params.bringsOwnHelmet) discountPerKm += PRICING_CONSTRAINTS.helmetDiscountPerKm
  if (params.isRaining && params.bringsOwnRaincoat) discountPerKm += PRICING_CONSTRAINTS.rainGearDiscountPerKm

  return Math.round(params.distanceKm * discountPerKm)
}
```

---

## 16. Transaction Log Specification

### 16.1 Commission Constants
```ts
export const COMMISSION = {
  rate: 0.10,              // 10% — di bawah batas regulasi 15%
  minAmount: 0,            // tidak ada minimum komisi
  roundingUnit: 100,       // Round ke Rp 100 terdekat
}
```

Rule:
- Basis komisi platform hanya `baseTripEstimatedPrice`
- `pickupSurchargeAmount` tidak masuk basis komisi dan menjadi kompensasi penuh untuk mitra

### 16.2 Record Transaction
```ts
async function recordCompletedTrip(order: Order): Promise<Result<void>> {
  if (order.status !== 'Completed') {
    return err({ code: 'INVALID_ORDER_TRANSITION' })
  }
  
  const commissionAmount = Math.round(
    order.baseTripEstimatedPrice * COMMISSION.rate / COMMISSION.roundingUnit
  ) * COMMISSION.roundingUnit
  
  const log: TransactionLog = {
    logId: uuid(),
    orderId: order.orderId,
    serviceType: order.serviceType,
    customerId: order.customerId,
    partnerId: order.partnerId,
    estimatedPrice: order.estimatedPrice,
    paymentMethod: order.paymentMethod,
    paymentAdminFeeTotal: order.paymentAdminFeeTotal,
    customerAdminFeeShare: order.customerAdminFeeShare,
    partnerAdminFeeShare: order.partnerAdminFeeShare,
    pricePerKm: order.pricePerKmApplied,
    distanceKm: order.distanceEstimateKm,
    commissionBaseAmount: order.baseTripEstimatedPrice,
    commissionRate: COMMISSION.rate,
    commissionAmount,
    completedAt: order.updatedAt,
  }
  
  await TransactionRepository.recordTransaction(log)
  await appendAuditEvent(buildEvent('TRANSACTION_RECORDED', {
    logId: log.logId,
    commissionAmount,
    commissionBaseAmount: order.baseTripEstimatedPrice,
  }))
  
  return ok(undefined)
}
```

### 16.3 Payment Method Boundary
Rules:
- `cash` dan `manual_transfer` dapat dipakai tanpa backend settlement
- `gateway` adalah fase lanjut dan harus diproteksi feature flag
- Jika `gateway` aktif, biaya admin dibagi dua dan breakdown wajib terlihat di review order

### 16.3B Log Presentation Contract
Rules:
- `TransactionLogListItemViewModel` harus mengambil angka dari `TransactionLog`, bukan menghitung ulang dari `Order`
- `shortOrderId` dipakai untuk list agar mudah dipindai operator, tetapi `orderId` penuh tetap tersedia untuk trace
- History detail dan transaction log wajib konsisten pada `serviceType`, `paymentMethod`, dan angka final yang ditampilkan
- CSV export harus memakai header yang stabil agar operator tidak perlu mengubah template rekap setiap export

### 16.3A Payment Quote Contract
```ts
export function buildPaymentQuote(params: {
  estimatedPrice: number
  paymentMethod: PaymentMethod
  paymentAdminFeeTotal?: number
}): {
  customerPayableAmount: number
  partnerSettlementEstimate: number
  customerAdminFeeShare: number
  partnerAdminFeeShare: number
} {
  if (params.paymentMethod !== 'gateway') {
    return {
      customerPayableAmount: params.estimatedPrice,
      partnerSettlementEstimate: params.estimatedPrice,
      customerAdminFeeShare: 0,
      partnerAdminFeeShare: 0,
    }
  }

  const totalAdminFee = params.paymentAdminFeeTotal ?? 0
  const customerAdminFeeShare = Math.ceil(totalAdminFee / 2)
  const partnerAdminFeeShare = totalAdminFee - customerAdminFeeShare

  return {
    customerPayableAmount: params.estimatedPrice + customerAdminFeeShare,
    partnerSettlementEstimate: params.estimatedPrice - partnerAdminFeeShare,
    customerAdminFeeShare,
    partnerAdminFeeShare,
  }
}
```

Rules:
- komisi platform tetap dihitung dari `baseTripEstimatedPrice`
- admin fee payment bukan basis komisi
- `partnerSettlementEstimate` hanyalah estimasi payment settlement, bukan final earning setelah komisi offline

### 16.4 Default Rating Completion Policy
```ts
export function resolveCompletedTripRating(manualRating?: number): number {
  if (!manualRating) return 5
  return Math.max(1, Math.min(5, Math.round(manualRating)))
}
```

### 16.4A Post-Trip Feedback Contract
```ts
export function buildPostTripFeedback(params: {
  orderId: string
  customerId: string
  partnerId: string
  manualRating?: number
  reviewText?: string
  createdAt: string
}): PostTripFeedback {
  const rating = resolveCompletedTripRating(params.manualRating)

  return {
    orderId: params.orderId,
    customerId: params.customerId,
    partnerId: params.partnerId,
    rating,
    reviewText: params.reviewText?.trim() || undefined,
    createdAt: params.createdAt,
    source: params.manualRating ? 'manual' : 'default_auto',
  }
}
```

Rules:
- Feedback hanya boleh dibuat setelah order `Completed`
- Jika customer tidak mengirim rating manual, sistem tetap membekukan rating default `5`
- `reviewText` bersifat opsional dan tidak dipakai untuk recommendation ranking di MVP

---

## 17. Distance Calculation

### 17.1 Haversine Implementation
```ts
export function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
```

### 17.2 Display Rules
- Tampilkan `distanceEstimateKm` dengan 1 desimal: `"3.2 km (estimasi)"`
- Tampilkan `estimatedPrice` diformat sebagai IDR: `"Rp 48.000 (estimasi)"`
- Kata **"estimasi"** wajib tampil di semua nilai kalkulasi berbasis haversine
- Jangan tampilkan sebagai "harga", tampilkan sebagai "estimasi harga"

---

## 18. External Handoff Specification

### 18.1 Maps Deep Link
```ts
async function openMaps(params: {
  origin?: LocationPoint
  destination: LocationPoint
}): Promise<void> {
  // Google Maps
  const dest = `${params.destination.latitude},${params.destination.longitude}`
  const orig = params.origin
    ? `${params.origin.latitude},${params.origin.longitude}`
    : undefined
    
  const url = orig
    ? `https://www.google.com/maps/dir/${orig}/${dest}`
    : `https://www.google.com/maps/search/?api=1&query=${dest}`
  
  await appendAuditEvent(buildEvent('HANDOFF_MAPS_ATTEMPTED', { dest }))
  
  const canOpen = await Linking.canOpenURL(url)
  if (!canOpen) throw new AppError('EXTERNAL_APP_NOT_AVAILABLE')
  
  await Linking.openURL(url)
  await appendAuditEvent(buildEvent('HANDOFF_MAPS_OPENED', { dest }))
}
```

Rules:
- Gunakan koordinat `latitude,longitude` sebagai input utama
- Android: coba Google Maps terlebih dahulu
- iOS: fallback ke Apple Maps jika Google Maps tidak tersedia
- Jangan bergantung pada geocoding API berbayar untuk flow inti

### 18.1A Apple Maps Fallback
```ts
function buildAppleMapsUrl(params: {
  origin?: LocationPoint
  destination: LocationPoint
}): string {
  const dest = `${params.destination.latitude},${params.destination.longitude}`
  const origin = params.origin
    ? `${params.origin.latitude},${params.origin.longitude}`
    : undefined

  return origin
    ? `http://maps.apple.com/?saddr=${origin}&daddr=${dest}&dirflg=d`
    : `http://maps.apple.com/?daddr=${dest}&dirflg=d`
}
```

### 18.2 Dialer
```ts
async function openDialer(phoneNumber: string): Promise<void> {
  const url = `tel:${phoneNumber}`
  await appendAuditEvent(buildEvent('HANDOFF_CALL_ATTEMPTED', { phoneNumber: masked(phoneNumber) }))
  await Linking.openURL(url)
  await appendAuditEvent(buildEvent('HANDOFF_CALL_OPENED', {}))
}

function masked(phoneNumber: string): string {
  // Log hanya 4 digit terakhir untuk audit
  return '***' + phoneNumber.slice(-4)
}
```

### 18.3 WhatsApp
```ts
async function openWhatsApp(
  phoneNumber: string,
  text?: string
): Promise<void> {
  // Format: +62 tanpa leading 0
  const normalized = normalizeInternationalNumber(phoneNumber)
  const message = text ? encodeURIComponent(text) : ''
  const url = `whatsapp://send?phone=${normalized}&text=${message}`
  
  await appendAuditEvent(buildEvent('HANDOFF_WHATSAPP_ATTEMPTED', {}))
  
  const canOpen = await Linking.canOpenURL(url)
  if (!canOpen) {
    await appendAuditEvent(buildEvent('HANDOFF_WHATSAPP_FAILED', { reason: 'not_installed' }))
    throw new AppError('EXTERNAL_APP_NOT_AVAILABLE')
  }
  
  await Linking.openURL(url)
  await appendAuditEvent(buildEvent('HANDOFF_WHATSAPP_OPENED', {}))
}
```

---

## 19. State Management Specification

### 19.1 Zustand Store Shape
```ts
type RootState = {
  // Session
  bootstrapDone: boolean
  currentRole: AppRole | null
  isOnline: boolean

  // User
  profile: UserProfile | null
  pricing: PricingProfile | null

  // Permissions
  locationGranted: boolean

  // Discovery
  discoveryItems: PresenceSnapshot[]
  discoveryLoading: boolean
  discoveryError: AppErrorCode | null
  discoveryLastUpdatedAt: string | null

  // Order
  activeOrder: Order | null
  orderSyncing: boolean
  orderRecoveryMode: boolean

  // Connectivity
  relayConnected: boolean

  // Audit
  auditExportInProgress: boolean
  
  // Actions (Zustand pattern)
  setRole: (role: AppRole) => void
  setOnline: (online: boolean) => void
  setDiscovery: (items: PresenceSnapshot[]) => void
  setActiveOrder: (order: Order | null) => void
  // ... etc
}
```

### 19.2 Rehydration Sequence
```ts
async function bootstrapApp(): Promise<void> {
  // 1. Inisialisasi SQLite + run migrations
  await TripDatabase.initialize()
  
  // 2. Load profile
  const profile = await UserRepository.getProfile()
  store.setProfile(profile)
  
  // 3. Load pricing
  if (profile) {
    const pricing = await PricingRepository.getPricing(profile.userId)
    store.setPricing(pricing)
  }
  
  // 4. Load active order
  const activeOrder = await OrderRepository.getActiveOrder()
  store.setActiveOrder(activeOrder)
  
  // 5. Check lokasi permission
  const perm = await LocationGateway.checkPermission()
  store.setLocationGranted(perm === 'granted')
  
  // 6. Connect ke Supabase Relay
  if (isRelayEnabled()) {
    await SupabaseClient.initialize()
    store.setRelayConnected(true)
  }
  
  // 7. Recovery mode jika ada active order
  if (activeOrder && !isTerminal(activeOrder.status)) {
    store.setOrderRecoveryMode(true)
    await RecoverActiveOrder.execute(activeOrder.orderId)
  }
  
  // 8. Audit bootstrap
  await appendAuditEvent(buildEvent('BOOTSTRAP_COMPLETE', {}))
  
  store.setBootstrapDone(true)
}
```

---

## 20. Feature Technical Breakdown

### 20.1 Onboarding
**Input:** none (first launch)
**Output:** UserProfile tersimpan, role aktif tersimpan
**Screens:** role selection → nama & nomor → pricing awal (jika mitra) → home

**Technical requirements:**
- UUID v4 dibuat lokal untuk userId
- Device binding ID dibuat lokal dan disimpan ke Secure Storage
- Tidak ada API call ke server
- Phone number: validasi format Indonesia (08xx/+628xx), normalisasi ke `+62...`, tidak perlu OTP di MVP
- Nomor telepon penuh disimpan di Secure Storage; SQLite hanya simpan masked/hash
- `identityStatus` hanya menjadi `active` jika profile lolos normalisasi dan validasi
- `PROFILE_VALIDATED` audit event ditulis saat profil lolos validasi minimum
- Profil dengan data mencurigakan dapat di-set ke `blocked` dan menghasilkan `IDENTITY_BLOCKED` audit event

### 20.1A Profile Editor Contract
```ts
function buildProfileEditorViewModel(params: {
  profile: UserProfile
  hasActiveOrder: boolean
}): ProfileEditorViewModel {
  return {
    displayName: params.profile.displayName,
    legalFullName: params.profile.legalFullName,
    profilePhotoUri: params.profile.profilePhotoUri,
    genderDeclaration: params.profile.genderDeclaration,
    driverReadinessStatus: params.profile.driverReadinessStatus,
    editableWhileActiveOrder: !params.hasActiveOrder,
    blockedFields: params.hasActiveOrder
      ? ['legalFullName', 'identityNumberMasked', 'vehicles', 'hasSpareHelmet', 'hasRaincoatSpare']
      : [],
  }
}

function validateProfileMutation(params: {
  currentProfile: UserProfile
  nextProfile: UserProfile
  hasActiveOrder: boolean
}): Result<UserProfile> {
  const touchesCriticalField =
    params.currentProfile.legalFullName !== params.nextProfile.legalFullName
    || params.currentProfile.identityNumberMasked !== params.nextProfile.identityNumberMasked
    || JSON.stringify(params.currentProfile.vehicles ?? []) !== JSON.stringify(params.nextProfile.vehicles ?? [])
    || params.currentProfile.hasSpareHelmet !== params.nextProfile.hasSpareHelmet
    || params.currentProfile.hasRaincoatSpare !== params.nextProfile.hasRaincoatSpare

  if (params.hasActiveOrder && touchesCriticalField) {
    return err({ code: 'PROFILE_EDIT_LOCKED_DURING_ACTIVE_ORDER' })
  }

  return ok(params.nextProfile)
}
```

Rules:
- Perubahan field kritikal harus diikuti re-evaluasi `validateDriverReadiness()`
- Jika hasilnya tidak lagi `minimum_valid`, user tetap boleh memakai role customer tetapi gate driver harus tertutup
- Field non-kritikal seperti foto profil, favorite address, dan rekening bank tetap boleh diubah saat ada order aktif

### 20.1B Pricing Settings Contract
```ts
function buildPricingSettingsViewModel(params: {
  pricing: PricingProfile | null
  hasActiveOrder: boolean
}): PricingSettingsViewModel {
  return {
    partnerPricePerKm: params.pricing?.partnerPricePerKm,
    customerOfferPerKm: params.pricing?.customerOfferPerKm,
    currency: 'IDR',
    editableWhileActiveOrder: true,
    affectsCurrentOrder: false,
    helperText: params.hasActiveOrder
      ? 'Perubahan tarif hanya berlaku untuk booking baru, bukan trip aktif.'
      : 'Tarif baru akan dipakai untuk discovery dan booking berikutnya.',
  }
}

async function savePricingUpdate(params: {
  userId: string
  currentPricing: PricingProfile | null
  nextPartnerPricePerKm?: number
  nextCustomerOfferPerKm?: number
  hasActiveOrder: boolean
  isOnline: boolean
}): Promise<Result<PricingProfile>> {
  const partnerPriceResult =
    params.nextPartnerPricePerKm === undefined
      ? ok(undefined)
      : validatePartnerPrice(params.nextPartnerPricePerKm)

  if (!partnerPriceResult.ok) return partnerPriceResult

  const nextPricing: PricingProfile = {
    userId: params.userId,
    partnerPricePerKm: params.nextPartnerPricePerKm ?? params.currentPricing?.partnerPricePerKm,
    customerOfferPerKm: params.nextCustomerOfferPerKm ?? params.currentPricing?.customerOfferPerKm,
    currency: 'IDR',
    updatedAt: nowIso(),
  }

  await PricingRepository.savePricing(nextPricing)

  if (params.isOnline && !params.hasActiveOrder) {
    await publishCurrentPresence(params.userId)
  }

  await appendAuditEvent(buildEvent('PRICING_UPDATED', {
    userId: params.userId,
    partnerPricePerKm: nextPricing.partnerPricePerKm,
    customerOfferPerKm: nextPricing.customerOfferPerKm,
  }))

  return ok(nextPricing)
}
```

Rules:
- Perubahan pricing tidak boleh mengubah `Order` yang sudah `Requested`, `Accepted`, `OnTheWay`, atau `OnTrip`
- Jika user online dan tidak sedang punya active order, discovery snapshot boleh diperbarui setelah save sukses
- Copy helper di pricing screen wajib menjelaskan bahwa efek pricing bersifat prospektif

### 20.2 Home Customer
**Input:** UserProfile + PricingProfile + lokasi aktif
**Output:** list mitra online di sekitar dengan jarak dan tarif
**Refresh:** setiap 30 detik + pull-to-refresh

**Technical requirements:**
- Subscribe ke Supabase presence:mitra channel
- Filter dan sort sesuai spec §12.5
- Map view opsional (gunakan react-native-maps jika bundle size acceptable)

### 20.2A Customer Home View Contract
```ts
function buildCustomerHomeViewModel(params: {
  profile: UserProfile
  activeOrder: Order | null
  recoveryMode: boolean
  selectedServiceType?: VehicleProfile['vehicleType']
  womenPreferenceEnabled: boolean
  discoveryItems: PresenceSnapshot[]
  locationGranted: boolean
  relayConnected: boolean
}): CustomerHomeViewModel {
  const topRecommendation = params.discoveryItems[0]

  return {
    currentRole: params.profile.currentRole,
    displayName: params.profile.displayName,
    hasActiveOrder: !!params.activeOrder,
    activeOrderId: params.activeOrder?.orderId,
    recoveryMode: params.recoveryMode,
    selectedServiceType: params.selectedServiceType,
    womenPreferenceEnabled: params.womenPreferenceEnabled,
    discoveryCount: params.discoveryItems.length,
    topRecommendationPartnerId: topRecommendation?.userId,
    topRecommendationReason: topRecommendation ? 'dekat dan eligible untuk booking' : undefined,
    discoveryState: !params.locationGranted
      ? 'location_required'
      : !params.relayConnected
        ? 'offline'
        : params.discoveryItems.length === 0
          ? 'empty'
          : 'ready',
  }
}
```

Rules:
- Home customer wajib menampilkan recovery banner jika `hasActiveOrder = true`
- CTA `auto booking` hanya boleh aktif bila candidate set hasil filter tidak kosong
- Role switch entry harus tetap terlihat dari home
- Jika `discoveryState !== ready`, home tetap menampilkan reason state yang jelas, bukan layar kosong

### 20.3 Home Mitra
**Input:** UserProfile + PricingProfile
**Output:** online toggle + list customer aktif di sekitar + incoming order notification

**Technical requirements:**
- Publish presence saat online
- Subscribe ke presence:customer channel
- Subscribe ke incoming order channel

### 20.3A Driver Home View Contract
```ts
async function buildDriverHomeViewModel(params: {
  profile: UserProfile
  pricing: PricingProfile | null
  activeOrder: Order | null
  recoveryMode: boolean
  isOnline: boolean
  nearbyDemandCount: number
}): Promise<DriverHomeViewModel> {
  const readiness = await validateDriverReadiness(params.profile)

  return {
    currentRole: params.profile.currentRole,
    displayName: params.profile.displayName,
    hasActiveOrder: !!params.activeOrder,
    activeOrderId: params.activeOrder?.orderId,
    recoveryMode: params.recoveryMode,
    isOnline: params.isOnline,
    identityStatus: params.profile.identityStatus,
    driverReadinessStatus: params.profile.driverReadinessStatus,
    activeVehicleType: params.profile.activeVehicleType,
    activePricePerKm: params.pricing?.partnerPricePerKm,
    onlineGateReason: readiness.ok ? undefined : readiness.error.code,
    nearbyDemandCount: params.nearbyDemandCount,
  }
}
```

Rules:
- Jika `hasActiveOrder = true`, home mitra harus memprioritaskan banner kembali ke trip aktif dibanding discovery biasa
- Toggle online tidak boleh aktif bila `onlineGateReason` ada
- Jika readiness gagal, home mitra harus mengarahkan user ke screen yang relevan seperti pricing atau profile

### 20.4 Booking Flow
**Input:** pickup (GPS/manual) + destination + selected mitra
**Output:** Order tersimpan lokal + sinyal dikirim ke mitra

**Technical requirements:**
- Customer wajib memilih `serviceType` di awal
- Pickup auto-fill dari GPS
- Destination: text search menggunakan device keyboard (tidak butuh geocoding API)
- Haversine distance calculation
- Order UUID dibuat client-side
- Booking session ID dibuat client-side untuk mengelompokkan retry dalam satu sesi booking
- Persist lokal sebelum kirim sinyal
- Customer dapat memilih `manual` atau `auto` booking
- Booking form harus adaptif sesuai `serviceType`
- Customer wajib memilih `bookingIntent`: untuk diri sendiri atau untuk orang lain
- Jika `bookingIntent = for_other`, `riderDeclaredName` wajib diisi dan `riderPhoneMasked` wajib tersedia sebelum submit
- Customer wajib memilih `paymentMethod` sebelum confirm
- Candidate set wajib difilter dulu sebelum selection/ranking
- Jika delegated booking sedang direstrict oleh trust enforcement, submit harus ditolak
- Auto booking harus memilih target di client dengan ranking lokal yang transparan
- Auto booking tidak boleh broadcast ke banyak mitra sekaligus
- Jika pickup distance melebihi 3 km dari mitra target, biaya penjemputan tambahan harus dihitung dan ditampilkan sebelum confirm
- Preview booking harus menampilkan breakdown: estimasi perjalanan, biaya penjemputan tambahan, admin fee share jika ada, dan total estimasi
- Auto booking retry progress harus terlihat ke customer
- Failure state booking harus eksplisit dan tidak boleh collapse ke generic error

### 20.5 Incoming Order (Mitra)
**Input:** OrderRequestPayload dari relay subscription
**Output:** accept → Order status Accepted | reject → status Rejected

**Technical requirements:**
- Validasi payload tidak expired (§13.4)
- Validasi eligibility accept mengikuti `validateIncomingOrderDecision()` (§13.4A)
- Countdown timer 60 detik yang akurat
- Auto-handle timeout → don't leave UI hanging
- Biometric prompt opsional sebelum accept (jika feature flag aktif)
- Incoming order wajib menampilkan:
  - `customerDisplayName`
  - `serviceType`
  - `passengerCount` jika relevan
  - `bookingMode`
  - `bookingIntent`
  - `riderDeclaredName` dan `riderPhoneMasked` jika `for_other`
  - `paymentMethod`
  - pickup dan destination
  - jarak ke pickup, estimasi perjalanan, biaya penjemputan tambahan, gear discount jika ada, admin fee split jika ada, dan total estimasi
- Mitra tidak boleh dipaksa accept order tanpa melihat total estimasi yang sudah termasuk pickup surcharge
- `Reject` oleh user wajib membawa `responseReasonCode`
- Jika `bookingMode = manual`, reject/expired mengembalikan customer ke flow pilih mitra
- Jika `bookingMode = auto`, reject/expired boleh meneruskan retry ke kandidat berikutnya secara berurutan

### 20.5A Incoming Order Screen Contract
```ts
export type IncomingOrderViewModel = {
  orderId: string
  customerDisplayName: string
  serviceType?: VehicleProfile['vehicleType']
  passengerCount?: number
  bookingMode: BookingMode
  bookingIntent: BookingIntent
  riderDeclaredName: string
  riderPhoneMasked?: string
  paymentMethod?: PaymentMethod
  pickupLabel?: string
  destinationLabel?: string
  pickupDistanceFromPartnerKm: number
  baseTripEstimatedPrice: number
  pickupSurchargeAmount: number
  gearDiscountAmount?: number
  paymentAdminFeeTotal?: number
  customerAdminFeeShare?: number
  partnerAdminFeeShare?: number
  estimatedPrice: number
  expiresAt: string
}
```

### 20.6 Active Trip
**Input:** active Order
**Output:** status updates + external handoff

**Technical requirements:**
- State persisten di SQLite
- Restore dari lokal jika app di-kill
- All handoff buttons harus punya clear error state
- Contact reveal harus selesai lebih dulu sebelum action `call_partner` atau `chat_partner` dibuka
- Jika `temporary_chat_enabled = false`, `chat_partner` harus diarahkan ke fallback seperti WhatsApp

### 20.6A Active Trip Lifecycle Contract
```ts
export type ActiveTripMilestone =
  | 'accepted'
  | 'departing_to_pickup'
  | 'arrived_at_pickup'
  | 'waiting_free_window'
  | 'waiting_charge_running'
  | 'on_trip'
  | 'completed'
```

Rules:
- milestone aktif tidak mengganti `OrderStatus`, tetapi menjadi penjelas operasional di dalam `Accepted`, `OnTheWay`, dan `OnTrip`
- saat driver tap `Arrived at Pickup`, set `arrivedAtPickupAt`
- waiting timer hanya berjalan setelah `arrivedAtPickupAt`
- jika driver tidak bergerak material setelah `Accepted`, hitung `driverDelayDeductionAmount`
- saat `OnTrip` dimulai, beku-kan kalkulasi waiting/delay fairness
- breakdown final order harus membawa:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `waitingChargeAmount`
  - `driverDelayDeductionAmount`
  - `gearDiscountAmount`

### 20.6A.1 Active Trip View Contract
```ts
export type ActiveTripViewModel = {
  orderId: string
  serviceType?: VehicleProfile['vehicleType']
  paymentMethod?: PaymentMethod
  bookingIntent: BookingIntent
  passengerCount?: number
  status: OrderStatus
  milestone: ActiveTripMilestone
  counterpartDisplayName: string
  counterpartPhoneMasked?: string
  arrivedAtPickupAt?: string
  waitingTimerSeconds?: number
  baseTripEstimatedPrice: number
  pickupSurchargeAmount: number
  waitingChargeAmount?: number
  driverDelayDeductionAmount?: number
  gearDiscountAmount?: number
  estimatedPrice: number
}
```

### 20.6A.2 Active Trip Action Contract
```ts
export type PartnerTripAction =
  | 'depart_to_pickup'
  | 'mark_arrived_at_pickup'
  | 'start_trip'
  | 'complete_trip'
  | 'cancel_trip'

export type CustomerTripAction =
  | 'open_maps'
  | 'call_partner'
  | 'chat_partner'
  | 'cancel_trip'
```

### 20.6A.2A Contact Reveal Contract
```ts
async function revealOrderContact(order: Order): Promise<Result<OrderContactRevealPayload>> {
  if (order.status !== 'Accepted' && order.status !== 'OnTheWay' && order.status !== 'OnTrip') {
    return err({ code: 'CONTACT_REVEAL_NOT_ALLOWED' })
  }

  return ok({
    orderId: order.orderId,
    customerId: order.customerId,
    partnerId: order.partnerId,
    customerPhoneE164: await SecureStore.getItem('customerPhoneE164'),
    partnerPhoneE164: await SecureStore.getItem('partnerPhoneE164'),
    availableHandoffActions: FeatureFlags.temporary_chat_enabled
      ? ['call', 'whatsapp', 'temporary_chat']
      : ['call', 'whatsapp'],
    revealedAt: nowIso(),
    expiresAt: computeContactRevealExpiry(order),
  })
}
```

Rules:
- Contact reveal tidak boleh terjadi pada `Draft`, `Requested`, `Rejected`, `Expired`, atau `Canceled`
- Reveal payload hanya dikirim ke pasangan order yang aktif
- Nomor penuh yang terekspos tidak boleh dipersist ke discovery cache

### 20.6A.2B Temporary Chat Contract
```ts
export function canUseTemporaryChat(params: {
  orderStatus: OrderStatus
  contactRevealDone: boolean
  temporaryChatEnabled: boolean
}): boolean {
  const activeStatuses: OrderStatus[] = ['Accepted', 'OnTheWay', 'OnTrip']
  return params.temporaryChatEnabled
    && params.contactRevealDone
    && activeStatuses.includes(params.orderStatus)
}
```

Rules:
- Semua message temporary harus punya TTL dan `orderId`
- Temporary chat bukan source of truth dan tidak boleh dipakai untuk keputusan status order
- File chat harus bisa dimatikan tanpa merusak flow inti trip

### 20.6A.3 Cancel Sheet Contract
```ts
export type CancelReasonCode =
  | 'user_changed_mind'
  | 'no_show'
  | 'identity_mismatch'
  | 'undeclared_rider'
  | 'contact_mismatch'
  | 'unsafe_or_suspicious'
  | 'pickup_mismatch'
  | 'other'

export function getAllowedCancelReasons(params: {
  status: OrderStatus
  milestone: ActiveTripMilestone
}): CancelReasonCode[] {
  const baseReasons: CancelReasonCode[] = [
    'user_changed_mind',
    'identity_mismatch',
    'undeclared_rider',
    'contact_mismatch',
    'unsafe_or_suspicious',
    'pickup_mismatch',
    'other',
  ]

  if (params.status === 'Accepted' || params.status === 'OnTheWay') {
    if (params.milestone === 'arrived_at_pickup' || params.milestone === 'waiting_free_window' || params.milestone === 'waiting_charge_running') {
      return ['no_show', ...baseReasons]
    }
    return baseReasons
  }

  if (params.status === 'OnTrip') {
    return ['unsafe_or_suspicious', 'other']
  }

  return ['other']
}
```

### 20.6B Background Safety Mode Boundary
Rules:
- hanya aktif saat order non-terminal sedang berjalan
- tidak boleh dipakai untuk discovery background
- target update lokasi periodik: `~60 detik` bila OS mengizinkan
- jika OS menghentikan background updates, app harus fallback ke last known location tanpa menganggap itu error fatal
- entering/exiting safety mode wajib menulis audit event ringan

### 20.6C SOS Contract
```ts
export type SosPayload = {
  actorUserId: string
  orderId?: string
  serviceType?: VehicleProfile['vehicleType']
  latitude: number
  longitude: number
  dangerNote: string
  createdAt: string
}
```

Rules:
- SOS payload harus minimum dan cepat dikirim
- jangan lampirkan data sensitif yang tidak relevan
- SOS tidak boleh bergantung pada upload file besar

### 20.7 Audit Export
**Input:** date range + device auth
**Output:** `.tripaudit` ZIP file via share sheet

**Technical requirements:**
- Require device auth (biometric/PIN) sebelum export
- Build bundle async (tidak block UI)
- Progress indicator
- Clear error handling jika export gagal

### 20.7A History Screen Contract
```ts
async function buildHistoryList(currentUserId: string, status?: OrderStatus): Promise<HistoryListItemViewModel[]> {
  const orders = await OrderRepository.listHistory(status, 50, 0)

  return orders.map(order => ({
    orderId: order.orderId,
    shortOrderId: order.orderId.slice(0, 8).toUpperCase(),
    serviceType: order.serviceType,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalAmount: order.estimatedPrice,
    counterpartyDisplayName: resolveCounterpartyDisplayName(order, currentUserId),
    happenedAt: order.updatedAt,
  }))
}

async function buildHistoryDetail(orderId: string): Promise<HistoryDetailViewModel | null> {
  const order = await OrderRepository.getOrderById(orderId)
  if (!order) return null

  return {
    orderId: order.orderId,
    serviceType: order.serviceType,
    status: order.status,
    pickupLabel: order.pickup.label ?? `${order.pickup.latitude},${order.pickup.longitude}`,
    destinationLabel: order.destination.label ?? `${order.destination.latitude},${order.destination.longitude}`,
    paymentMethod: order.paymentMethod,
    baseTripEstimatedPrice: order.baseTripEstimatedPrice,
    pickupSurchargeAmount: order.pickupSurchargeAmount,
    gearDiscountAmount: order.gearDiscountAmount,
    waitingChargeAmount: order.waitingChargeAmount,
    driverDelayDeductionAmount: order.driverDelayDeductionAmount,
    paymentAdminFeeTotal: order.paymentAdminFeeTotal,
    estimatedPrice: order.estimatedPrice,
    cancelReason: order.cancelReason,
    updatedAt: order.updatedAt,
  }
}
```

Rules:
- History screen harus bisa dibuka offline dari data lokal
- Filter minimum: `all`, `Completed`, `Canceled`
- Detail screen wajib menampilkan breakdown finansial utama dan reason terminal bila ada

### 20.7B Transaction Log Screen Contract
```ts
async function buildTransactionLogList(fromDate?: string, toDate?: string): Promise<TransactionLogListItemViewModel[]> {
  const logs = await TransactionRepository.listTransactions(fromDate, toDate)

  return logs.map(log => ({
    logId: log.logId,
    shortOrderId: log.orderId.slice(0, 8).toUpperCase(),
    serviceType: log.serviceType,
    paymentMethod: log.paymentMethod,
    estimatedPrice: log.estimatedPrice,
    commissionBaseAmount: log.commissionBaseAmount,
    commissionAmount: log.commissionAmount,
    paymentAdminFeeTotal: log.paymentAdminFeeTotal,
    completedAt: log.completedAt,
  }))
}
```

Rules:
- Operator harus bisa membedakan `estimatedPrice` vs `commissionBaseAmount` dengan jelas
- Jika `paymentAdminFeeTotal` kosong, UI tidak boleh menampilkan angka nol yang menyesatkan seolah gateway dipakai

### 20.7C Audit Export View Contract
```ts
async function runAuditExport(params: ExportParams): Promise<Result<AuditExportViewModel>> {
  const auth = await DeviceAuth.prompt()
  if (!auth.ok) return err({ code: 'DEVICE_AUTH_REQUIRED' })

  store.setAuditExportInProgress(true)

  try {
    const exportedFilePath = await AuditRepository.exportBundle(params)
    return ok({
      fromDate: params.fromDate,
      toDate: params.toDate,
      includeAllEvents: !!params.includeAllEvents,
      exportInProgress: false,
      exportedFilePath,
    })
  } catch {
    return err({ code: 'AUDIT_EXPORT_FAILED' })
  } finally {
    store.setAuditExportInProgress(false)
  }
}
```

Rules:
- Progress state harus terlihat selama bundle sedang dibuat
- Saat sukses, UI harus menampilkan file path atau membuka share sheet
- Saat gagal, user harus mendapat pesan yang bisa ditindaklanjuti tanpa jargon teknis

---

## 21. Logging Specification

### 21.1 Debug Logger (Dev Only)
```ts
// Aktif di dev, minimize/off di prod
AppLogger.debug(feature, action, context?)
AppLogger.info(feature, action, context?)
AppLogger.warn(feature, action, context?)
AppLogger.error(feature, action, error)
```

### 21.2 Yang Tidak Boleh Di-log
- Nomor telepon penuh
- Koordinat mentah secara penuh dan tidak perlu
- Payload audit mentah
- Device binding key
- Token atau credential apapun

### 21.3 Structured Log Fields
```ts
type LogEntry = {
  level: 'debug' | 'info' | 'warn' | 'error'
  feature: string       // 'presence', 'order', 'audit', etc
  action: string        // 'goOnline', 'submitOrder', etc
  status: 'start' | 'success' | 'fail'
  errorCode?: AppErrorCode
  orderId?: string
  timestamp: string
}
```

---

## 22. Recovery dan Resilience

### 22.1 App Restart dengan Active Order
```ts
async function recoverActiveOrder(orderId: string): Promise<void> {
  const order = await OrderRepository.getOrderById(orderId)
  if (!order) {
    store.clearActiveOrder()
    return
  }
  
  if (isTerminal(order.status)) {
    await OrderRepository.clearActiveOrderPointer()
    store.clearActiveOrder()
    return
  }
  
  // Coba sync dari relay
  const syncState = await OrderSignalGateway.syncActiveOrder(orderId)
  if (syncState && syncState.version > getLocalVersion(order)) {
    const result = transitionOrder(order, syncState.status)
    if (result.ok) {
      await OrderRepository.updateOrder(result.value)
      store.setActiveOrder(result.value)
      await appendAuditEvent(buildEvent('RECOVERY_TRIGGERED', { orderId, syncedStatus: syncState.status }))
    }
  } else {
    // Gunakan local state
    store.setActiveOrder(order)
    store.setOrderRecoveryMode(true)
  }
}
```

### 22.2 Presence Stale Cleanup
```ts
// Jalankan setiap 30 detik saat app foreground
function cleanStaleDiscovery(): void {
  const now = Date.now()
  const fresh = store.discoveryItems.filter(s => {
    const ageMs = now - new Date(s.timestamp).getTime()
    return ageMs < s.ttlSeconds * 1000
  })
  store.setDiscovery(fresh)
}
```

### 22.3 Relay Reconnect
```ts
// Supabase Realtime handles reconnect automatically
// Tambahkan listener untuk connectivity change:
NetInfo.addEventListener(state => {
  if (state.isConnected && !store.relayConnected) {
    SupabaseClient.reconnect()
    store.setRelayConnected(true)
  }
})
```

---

## 23. Acceptance Criteria Teknis

### 23.1 Bootstrap
- [ ] App tidak crash saat DB kosong (first install)
- [ ] App membuat profile awal dan menyimpan ke SQLite
- [ ] App me-load profile dan role aktif setelah restart
- [ ] Bootstrap wajib menulis BOOTSTRAP_COMPLETE audit event
- [ ] Edit profile kritikal ditolak saat ada active order non-terminal

### 23.2 Pricing
- [ ] Input di luar range menampilkan error spesifik
- [ ] Mitra tidak bisa online jika pricing belum di-set
- [ ] PRICING_UPDATED audit event tercatat saat pricing berubah
- [ ] Perubahan pricing tidak mengubah breakdown order aktif
- [ ] Perubahan pricing saat online tanpa active order memperbarui snapshot untuk booking baru

### 23.3 Discovery
- [ ] Mitra yang online muncul dalam < 10 detik
- [ ] Snapshot expired tidak muncul di list
- [ ] Empty state informatif saat tidak ada nearby users
- [ ] Discovery tidak muncul saat lokasi permission ditolak

### 23.3A Home Screens
- [ ] Customer home menampilkan recovery banner saat ada active order non-terminal
- [ ] Customer home menampilkan top recommendation dengan alasan singkat saat kandidat tersedia
- [ ] Driver home menampilkan online gate reason saat readiness belum lolos
- [ ] Home screens tetap informatif saat lokasi belum aktif atau relay tidak terhubung

### 23.4 Anti-Abuse
- [ ] Koordinat di luar range Indonesia ditolak (unit test)
- [ ] Velocity anomaly terdeteksi dan presence tidak dipublish (unit test)
- [ ] Rate limit berjalan: publish kedua dalam 10 detik ditolak
- [ ] ANTI_ABUSE_VIOLATION tercatat di audit

### 23.5 Order
- [ ] Customer bisa buat order draft dan submit
- [ ] Mitra menerima incoming order di foreground
- [ ] Accept/reject berfungsi dan status ter-sync
- [ ] Invalid status transition ditolak
- [ ] Order aktif survive app restart
- [ ] Order timeout setelah 60 detik → status Expired
- [ ] Contact reveal tidak terjadi sebelum order diterima
- [ ] Action call/chat baru aktif setelah contact reveal sukses

### 23.6 Transaction Log
- [ ] Setiap order Completed membuat TransactionLog entry
- [ ] Commission amount terhitung benar (unit test)
- [ ] Transaction log screen membedakan `estimatedPrice` dan `commissionBaseAmount` dengan jelas
- [ ] CSV export memakai kolom yang stabil dan human-readable
- [ ] TRANSACTION_RECORDED audit event tercatat

### 23.7 Audit
- [ ] Semua event wajib menghasilkan audit entry
- [ ] CRC32 checksum valid untuk setiap event file
- [ ] Export bundle menghasilkan valid ZIP
- [ ] Export ter-guard device auth jika fitur aktif
- [ ] Audit export screen menampilkan progress dan hasil file dengan jelas

### 23.8 External Handoff
- [ ] Maps buka dengan koordinat yang benar
- [ ] Dialer buka dengan nomor yang benar
- [ ] WhatsApp buka dengan nomor yang benar
- [ ] Error yang jelas jika app target tidak tersedia
- [ ] Semua handoff dicatat di audit

### 23.9 Feedback dan Temporary Chat
- [ ] Trip tanpa rating manual tetap menghasilkan feedback dengan rating `5`
- [ ] Trip dengan rating manual menyimpan rating manual dan source `manual`
- [ ] Temporary chat hanya aktif untuk order yang sudah contact reveal dan masih aktif
- [ ] Temporary chat tidak mengubah source of truth status order

---

## 24. Testing Specification

### 24.1 Unit Tests (Wajib — 0 boleh skip)
```
haversineDistanceKm()             — 10+ test cases
calculateEstimatedPrice()         — boundary, rounding
resolveAppliedPrice()             — dengan dan tanpa offer
transitionOrder()                 — semua valid + invalid transitions
validatePartnerPrice()            — min, max, NaN, infinity
isValidIndonesiaCoords()          — valid, invalid, edge
isVelocityValid()                 — normal, teleport, edge
calculateCommission()             — beberapa nilai
filterAndSortDiscovery()          — expired, radius, sort
AuditSerializer encode/decode     — round-trip accuracy
isOrderPayloadValid()             — expired, future, valid
```

### 24.2 Integration Tests (Wajib)
```
SQLite migration 001 → state OK
SQLite migration 002 → state OK
UserRepository: save → load → update
OrderRepository: save → load → update → list history
AuditRepository: append → manifest entry → export bundle
TransactionRepository: record → list → export CSV
PresenceGateway: publish → discover (mock Supabase)
OrderSignalGateway: send → receive (mock Supabase)
```

### 24.3 E2E Tests (Minimum — manual + automated)
```
Complete onboarding flow
Toggle online/offline mitra
Discovery muncul di customer home
Booking flow end-to-end
Accept order
Complete order → transaction log recorded
Cancel order
App kill saat active order → restart → recovery
Export audit
Open maps handoff
Open dialer handoff
Open WhatsApp handoff
```

---

## 25. Build dan Configuration

### 25.1 Environments
```
dev:      Supabase dev project, verbose logging, anti_abuse off optional
staging:  Supabase staging project, reduced logging
prod:     Supabase prod project, sanitized logging, obfuscation on, anti_abuse always on
```

### 25.2 Feature Flags (Runtime)
```ts
const FEATURE_FLAGS = {
  relay_enabled: true,
  audit_export_enabled: true,
  device_auth_guard_enabled: false,    // aktifkan jika biometrics reliable
  maps_handoff_enabled: true,
  dialer_handoff_enabled: true,
  whatsapp_handoff_enabled: true,
  transaction_log_enabled: true,
  anti_abuse_enabled: true,            // TIDAK BOLEH false di prod
  firebase_push_enabled: true,
  temporary_chat_enabled: false,
  women_preference_enabled: false,
  active_order_background_tracking_enabled: false,
  sos_enabled: false,
}
```

Feature flag intent:
- `firebase_push_enabled`: boleh aktif lebih awal untuk incoming order dan update penting
- `temporary_chat_enabled`: tetap `false` sampai retention/cleanup policy siap
- `active_order_background_tracking_enabled`: aktif hanya jika pengujian baterai dan OS behavior sudah aman
- `sos_enabled`: aktif hanya jika payload, routing notifikasi, dan fallback UX sudah jelas

### 25.3 Config Rules
- Prod config tidak boleh enable verbose logging
- `anti_abuse_enabled` tidak boleh `false` di prod environment
- Supabase URL dan anon key di-load dari environment variable, tidak hardcode

---

## 26. Implementation Sequence

### Fase A — Fondasi
```
[ ] Bootstrap + DB initialization
[ ] SQLite migration 001 + 002
[ ] UserRepository implementation
[ ] PricingRepository implementation
[ ] OrderRepository implementation
[ ] AuditRepository implementation (basic)
[ ] TransactionRepository implementation
[ ] Onboarding screens
[ ] Role selection dan switch
[ ] Permission lokasi screen
[ ] Basic profile screen
[ ] Pricing settings screen
```

### Fase B — Presence
```
[ ] Supabase client setup
[ ] PresenceGateway implementation
[ ] Anti-abuse validators (coordinate, velocity, rate limit)
[ ] goOnline / goOffline use cases
[ ] Home customer screen (discovery list)
[ ] Home mitra screen (online toggle + discovery)
[ ] Haversine distance util
[ ] Discovery filtering dan sorting
```

### Fase C — Order Core
```
[ ] Booking form (pickup, destination, mitra selection)
[ ] Estimasi jarak + harga
[ ] Order draft creation
[ ] Submit order + Supabase signaling
[ ] Incoming order screen + countdown
[ ] Accept / reject + response signaling
[ ] Active trip screen
[ ] Order state machine
[ ] Order recovery on app restart
[ ] Complete order + transaction log
```

### Fase D — Audit, Hardening, dan Export
```
[ ] Audit binary writer (header + MessagePack + CRC32)
[ ] Audit manifest indexing
[ ] Audit export bundle (ZIP)
[ ] External handoff implementation
[ ] Transaction log export CSV
[ ] Typed error model + UI error mapping
[ ] Recovery flow hardening
[ ] QA testing semua flow
[ ] Empty states dan error states
[ ] Debug log sanitization untuk prod
```

---

## 27. Keputusan Teknis Final

Carrier App Project diimplementasikan sebagai **single cross-platform React Native app dengan TypeScript**, dengan:

- **SQLite** (op-sqlite) sebagai local persistence utama
- **Supabase Realtime** sebagai thin relay untuk presence dan order signaling
- **Firebase FCM** sebagai push layer dan Firebase temp store untuk komunikasi sementara yang non-kritikal
- **MessagePack** sebagai format audit compact dengan binary record format
- **Zustand** sebagai state management
- **Anti-abuse validation** sebagai wajib MVP (bukan opsional)
- **Transaction log** sebagai komponen monetisasi pertama
- **External handoff** (Maps/Dialer/WhatsApp) untuk komunikasi dan navigasi

Arsitektur ini memenuhi semua prinsip dari BRD dan PRD: local-first, transparan, ringan, dan dapat dieksekusi dengan cepat oleh tim kecil.

Model final yang diimplementasikan adalah **local-first dengan thin relay wajib**, bukan zero-server absolut dan bukan backend-heavy konvensional.

TSD ini adalah kontrak implementasi. Setiap deviasi harus didokumentasikan.

---

*Versi: 1.0 | CEO-reviewed | Approved for engineering execution*
