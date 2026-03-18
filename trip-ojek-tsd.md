# TSD — Technical Specification Document
## TRIP Local-First Ride Coordination Platform

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CTO / Engineering Direction
**Project:** TRIP
**Document Type:** Technical Specification Document (TSD)
**Status:** Approved for engineering execution
**Source Reference:** SDD — TRIP v1.0

---

## Catatan CEO

> TSD versi awal sudah sangat detail dan bisa dieksekusi. Revisi ini menambahkan spesifikasi yang hilang: anti-abuse technical spec, transaction log schema, relay technology specifics (Supabase), dan beberapa penyempurnaan pada contract yang kurang lengkap.
>
> Pesan untuk tim engineering: **TSD ini adalah kontrak, bukan guideline**. Jika perlu deviation dari spec ini selama implementasi, dokumentasikan alasannya dan update dokumen ini. Jangan silent-break the spec.

---

## 1. Ringkasan

TSD ini menjabarkan spesifikasi implementasi teknis untuk **TRIP** — single app dual role, local-first, thin relay. Dokumen ini menurunkan SDD ke level yang langsung bisa dieksekusi oleh engineer: module contracts, payload schemas, SQLite schema lengkap, audit binary format, lifecycle specs, error model, dan testing requirements.

**Prinsip utama yang tidak boleh dilanggar:**
1. Source of truth data user ada di local storage device
2. Presence dan signaling bersifat ephemeral dan TTL-based
3. Semua aksi bisnis penting wajib menghasilkan audit event
4. Anti-abuse validation wajib berjalan sebelum presence publish
5. Semua perubahan status order wajib lewat state machine domain
6. UI tidak boleh menyimpan business rules kritikal
7. Data sensitif tidak boleh ditulis utuh ke debug log
8. Desain harus toleran terhadap app kill, resume, dan koneksi buruk

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
```

### 3.3 Integration Libraries
```
Location:           @react-native-community/geolocation
                    atau expo-location
Biometrics:         react-native-biometrics
Maps:               custom deep link builder (tidak perlu library)
Dialer:             Linking.openURL('tel:...')
WhatsApp:           Linking.openURL('whatsapp://...')
```

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

export type UserProfile = {
  userId: string
  displayName: string
  phoneNumber?: string
  activeRoles: AppRole[]
  currentRole: AppRole
  deviceAuthEnabled: boolean
  createdAt: string
  updatedAt: string
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
  customerId: string
  partnerId: string
  pickup: LocationPoint
  destination: LocationPoint
  distanceEstimateKm: number
  pricePerKmApplied: number
  estimatedPrice: number
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
  customerId: string
  partnerId: string
  estimatedPrice: number
  pricePerKm: number
  distanceKm: number
  commissionRate: number
  commissionAmount: number
  completedAt: string
}
```

### 6.2 Payload Types
```ts
export type OrderRequestPayload = {
  orderId: string
  customerId: string
  customerDisplayName: string
  partnerId: string
  pickup: LocationPoint
  destination: LocationPoint
  distanceEstimateKm: number
  pricePerKmApplied: number
  estimatedPrice: number
  expiresAt: string           // ISO 8601, createdAt + 60s
  createdAt: string
}

export type OrderResponsePayload = {
  orderId: string
  partnerId: string
  response: 'accept' | 'reject'
  respondedAt: string
}

export type OrderSyncState = {
  orderId: string
  status: OrderStatus
  updatedAt: string
  version: number
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
  subscribeToIncomingOrders(
    userId: string,
    callback: (payload: OrderRequestPayload) => void
  ): () => void
  subscribeToOrderResponse(
    orderId: string,
    callback: (payload: OrderResponsePayload) => void
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
  phone_number TEXT,
  current_role TEXT NOT NULL CHECK(current_role IN ('customer', 'mitra')),
  active_roles TEXT NOT NULL DEFAULT '[]',   -- JSON array
  device_auth_enabled INTEGER NOT NULL DEFAULT 0,
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
  customer_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  pickup_json TEXT NOT NULL,             -- JSON: LocationPoint
  destination_json TEXT NOT NULL,        -- JSON: LocationPoint
  distance_estimate_km REAL NOT NULL,
  price_per_km_applied REAL NOT NULL,
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
}
```

### 10.4 Secure Storage Keys
```ts
const SECURE_STORAGE_KEYS = {
  DEVICE_BINDING_ID: 'trip.device_binding_id',
  AUDIT_EXPORT_GUARD_ENABLED: 'trip.audit_export_guard_enabled',
  LAST_AUTHENTICATED_AT: 'trip.last_authenticated_at',
}
```

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

### 11.3 Event Type Codes
```ts
const AUDIT_EVENT_CODES: Record<AuditEventType, number> = {
  BOOTSTRAP_COMPLETE:              0x0001,
  ROLE_SELECTED:                   0x0010,
  ROLE_SWITCHED:                   0x0011,
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
  
  return true
}
```

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

---

## 15. Pricing Specification

### 15.1 Constants
```ts
export const PRICING_CONSTRAINTS = {
  minPartnerPricePerKm: 2000,     // Rp 2.000 (configurable)
  maxPartnerPricePerKm: 8000,     // Rp 8.000 (configurable)
  roundingUnit: 500,              // Pembulatan ke Rp 500 terdekat
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

export function resolveAppliedPrice(
  partnerPricePerKm: number,
  customerOfferPerKm?: number
): number {
  return customerOfferPerKm ?? partnerPricePerKm
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

### 16.2 Record Transaction
```ts
async function recordCompletedTrip(order: Order): Promise<Result<void>> {
  if (order.status !== 'Completed') {
    return err({ code: 'INVALID_ORDER_TRANSITION' })
  }
  
  const commissionAmount = Math.round(
    order.estimatedPrice * COMMISSION.rate / COMMISSION.roundingUnit
  ) * COMMISSION.roundingUnit
  
  const log: TransactionLog = {
    logId: uuid(),
    orderId: order.orderId,
    customerId: order.customerId,
    partnerId: order.partnerId,
    estimatedPrice: order.estimatedPrice,
    pricePerKm: order.pricePerKmApplied,
    distanceKm: order.distanceEstimateKm,
    commissionRate: COMMISSION.rate,
    commissionAmount,
    completedAt: order.updatedAt,
  }
  
  await TransactionRepository.recordTransaction(log)
  await appendAuditEvent(buildEvent('TRANSACTION_RECORDED', { logId: log.logId, commissionAmount }))
  
  return ok(undefined)
}
```

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
- Tidak ada API call ke server
- Phone number: validasi format Indonesia (08xx/+628xx), tidak perlu OTP di MVP

### 20.2 Home Customer
**Input:** UserProfile + PricingProfile + lokasi aktif
**Output:** list mitra online di sekitar dengan jarak dan tarif
**Refresh:** setiap 30 detik + pull-to-refresh

**Technical requirements:**
- Subscribe ke Supabase presence:mitra channel
- Filter dan sort sesuai spec §12.5
- Map view opsional (gunakan react-native-maps jika bundle size acceptable)

### 20.3 Home Mitra
**Input:** UserProfile + PricingProfile
**Output:** online toggle + list customer aktif di sekitar + incoming order notification

**Technical requirements:**
- Publish presence saat online
- Subscribe ke presence:customer channel
- Subscribe ke incoming order channel

### 20.4 Booking Flow
**Input:** pickup (GPS/manual) + destination + selected mitra
**Output:** Order tersimpan lokal + sinyal dikirim ke mitra

**Technical requirements:**
- Pickup auto-fill dari GPS
- Destination: text search menggunakan device keyboard (tidak butuh geocoding API)
- Haversine distance calculation
- Order UUID dibuat client-side
- Persist lokal sebelum kirim sinyal

### 20.5 Incoming Order (Mitra)
**Input:** OrderRequestPayload dari relay subscription
**Output:** accept → Order status Accepted | reject → status Rejected

**Technical requirements:**
- Validasi payload tidak expired (§13.4)
- Countdown timer 60 detik yang akurat
- Auto-handle timeout → don't leave UI hanging
- Biometric prompt opsional sebelum accept (jika feature flag aktif)

### 20.6 Active Trip
**Input:** active Order
**Output:** status updates + external handoff

**Technical requirements:**
- State persisten di SQLite
- Restore dari lokal jika app di-kill
- All handoff buttons harus punya clear error state

### 20.7 Audit Export
**Input:** date range + device auth
**Output:** `.tripaudit` ZIP file via share sheet

**Technical requirements:**
- Require device auth (biometric/PIN) sebelum export
- Build bundle async (tidak block UI)
- Progress indicator
- Clear error handling jika export gagal

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

### 23.2 Pricing
- [ ] Input di luar range menampilkan error spesifik
- [ ] Mitra tidak bisa online jika pricing belum di-set
- [ ] PRICING_UPDATED audit event tercatat saat pricing berubah

### 23.3 Discovery
- [ ] Mitra yang online muncul dalam < 10 detik
- [ ] Snapshot expired tidak muncul di list
- [ ] Empty state informatif saat tidak ada nearby users
- [ ] Discovery tidak muncul saat lokasi permission ditolak

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

### 23.6 Transaction Log
- [ ] Setiap order Completed membuat TransactionLog entry
- [ ] Commission amount terhitung benar (unit test)
- [ ] TRANSACTION_RECORDED audit event tercatat

### 23.7 Audit
- [ ] Semua event wajib menghasilkan audit entry
- [ ] CRC32 checksum valid untuk setiap event file
- [ ] Export bundle menghasilkan valid ZIP
- [ ] Export ter-guard device auth jika fitur aktif

### 23.8 External Handoff
- [ ] Maps buka dengan koordinat yang benar
- [ ] Dialer buka dengan nomor yang benar
- [ ] WhatsApp buka dengan nomor yang benar
- [ ] Error yang jelas jika app target tidak tersedia
- [ ] Semua handoff dicatat di audit

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
}
```

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

TRIP diimplementasikan sebagai **single cross-platform React Native app dengan TypeScript**, dengan:

- **SQLite** (op-sqlite) sebagai local persistence utama
- **Supabase Realtime** sebagai thin relay untuk presence dan order signaling
- **MessagePack** sebagai format audit compact dengan binary record format
- **Zustand** sebagai state management
- **Anti-abuse validation** sebagai wajib MVP (bukan opsional)
- **Transaction log** sebagai komponen monetisasi pertama
- **External handoff** (Maps/Dialer/WhatsApp) untuk komunikasi dan navigasi

Arsitektur ini memenuhi semua prinsip dari BRD dan PRD: local-first, transparan, ringan, dan dapat dieksekusi dengan cepat oleh tim kecil.

TSD ini adalah kontrak implementasi. Setiap deviasi harus didokumentasikan.

---

*Versi: 1.0 | CEO-reviewed | Approved for engineering execution*
