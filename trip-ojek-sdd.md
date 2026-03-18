# SDD — Software Design Document
## Carrier App Project

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CTO / Engineering Direction
**Project:** Carrier App Project
**Motto:** Just Fair
**Previous Working Name:** TRIP
**Document Type:** Software Design Document (SDD)
**Status:** Approved for engineering execution
**Source Reference:** PRD — Carrier App Project v1.0

---

## Catatan CEO

> SDD versi awal secara teknis solid. Revisi ini menambahkan hal-hal yang hilang: desain anti-abuse yang lebih eksplisit, transaction log component untuk monetisasi, relay technology decision yang lebih konkret, dan klarifikasi bahwa beberapa komponen yang sebelumnya "opsional" sekarang menjadi wajib di MVP.
>
> Satu prinsip yang saya tekankan: **arsitektur yang baik harus bisa dijelaskan ke investor dalam 5 menit, dan diimplementasikan oleh engineer baru dalam 2 minggu.** Jika terlalu kompleks untuk salah satunya, simplify.

---

## 1. Ringkasan

Dokumen ini menjabarkan desain perangkat lunak untuk **Carrier App Project** — aplikasi mobile cross-platform, **satu aplikasi untuk dua peran** (customer dan mitra), dengan pendekatan **local-first, low-backend, tanpa third-party berbayar di fase awal**.

SDD ini menurunkan PRD ke level implementasi: arsitektur sistem, komponen, desain storage lokal, desain audit, desain relay, contract module, state machine, strategi keamanan, dan batasan arsitektur MVP.

---

## 2. Tujuan Desain

### 2.1 Tujuan Utama
- Fondasi teknis untuk single app dengan dual role
- Local storage sebagai source of truth utama
- Tidak menyimpan histori lokasi penuh di server
- Audit lokal compact yang dapat diekspor
- Jalur ekspansi ke arsitektur lebih matang tanpa refactor total

### 2.2 Tujuan Non-Fungsional
- App startup < 2 detik di mid-range device
- Usable dalam kondisi koneksi 3G
- Recovery state lokal yang kuat setelah force close
- Struktur modul yang mudah diiterasi oleh engineer baru
- Berjalan di Android dan iOS dari satu codebase

---

## 3. Prinsip Arsitektur

1. **Single App, Dual Role** — satu binary, dua cara pakai
2. **Local-First Source of Truth** — profil, pricing, order history, audit ada di device
3. **Presence over Surveillance** — fokus pada siapa yang online sekarang, bukan histori lokasi
4. **Thin Coordination Layer** — relay minimal hanya untuk presence dan order signaling
5. **External Handoff First** — routing, call, chat via app eksternal yang sudah ada
6. **Audit by Default** — semua event bisnis penting wajib tercatat lokal
7. **Trust from Day One** — anti-abuse basic bukan phase 2, ini wajib ada di MVP
8. **Revenue Visible** — transaction log untuk komisi bukan afterthought, ini bagian arsitektur
9. **Just Fair** — aturan waiting, pricing, punishment, dan recommendation harus seimbang untuk kedua sisi
10. **Warm Product Layer** — copywriting, reminder, dan tone UI diperlakukan sebagai bagian dari desain sistem

---

## 4. Keputusan Arsitektur Utama

### 4.1 Mobile Stack
- **React Native + TypeScript**
- Alasan: delivery cepat, satu codebase Android/iOS, integrasi native bridge untuk lokasi/biometrics/deep link, ekosistem library solid
- Alternatif Flutter juga valid, tapi RN lebih cepat jika tim sudah kuat di JS/TS

### 4.2 Local Persistence
- **SQLite** via react-native-quick-sqlite atau op-sqlite
- Alasan: relational query untuk history, atomic writes, recovery lebih baik dari key-value murni
- Secure Storage (Keychain/Keystore) untuk secret kecil

### 4.2A Model Auth dan Identity (MVP)
- MVP **tidak** memakai username/password dan **tidak** memakai OTP SMS
- Identitas pengguna bersifat **device-bound**: saat first launch app membuat `userId` dan `deviceBindingId`
- `deviceBindingId` disimpan di Secure Storage dan dipakai sebagai jangkar identitas lokal device
- Nomor telepon penuh disimpan di Secure Storage setelah dinormalisasi ke format E.164 (`+62...`)
- SQLite hanya menyimpan versi yang aman untuk operasional ringan: `phoneMasked`, `phoneHash`, dan status identitas
- User boleh memakai app secara lokal dalam status draft, tetapi **baru boleh online** jika profil valid, identity status aktif, dan gate anti-abuse lolos
- Device auth (PIN/biometric OS) dipakai untuk aksi sensitif, bukan sebagai login utama

### 4.3 Relay Technology
Relay **wajib ada** (tidak murni optional) untuk discovery dan signaling. Dua opsi yang layak:

**Opsi A — Supabase Realtime (Rekomendasi MVP)**
- Hosted PostgreSQL + Realtime subscription
- Presence via broadcast channel dengan TTL
- Gratis hingga tier tertentu
- Tidak perlu maintain server sendiri
- Mudah di-replace jika perlu

**Opsi B — Firebase Realtime Database**
- Mature, mobile SDK bagus
- Free tier cukup untuk pilot
- Sedikit lebih mahal di scale

**Opsi C — Custom WebSocket Server (Node.js/Go)**
- Full control
- Lebih murah di scale
- Membutuhkan maintenance sendiri
- Direkomendasikan di phase 2 jika biaya relay hosted mulai membebani

**Keputusan MVP:** Mulai dengan **Supabase Realtime** — zero ops overhead, free tier cukup, mudah diganti. Evaluasi ulang di 500+ daily active users.

### 4.3A Firebase Boundary (Push dan Temporary Communication)
- Firebase Cloud Messaging dipakai untuk push notification dasar
- Firebase Realtime Database dapat dipakai untuk temporary live chat atau ephemeral coordination data yang bukan source of truth utama
- Firebase Storage dapat dipakai untuk file chat sementara dengan cleanup policy
- Order state, audit state, transaction state, dan auth state tetap berada di local-first core storage
- Chat sementara wajib punya retention policy pendek, target awal `24 jam setelah order terminal`
- Firebase tidak boleh menjadi penyimpan permanen histori trip, histori pembayaran, atau histori audit
- Jika chat/Firebase gagal, order core flow tetap harus jalan dengan relay utama dan local state

### 4.3C Notification dan Realtime Event Matrix
| Event / Data | Transport Utama | Fallback / Catatan |
|---|---|---|
| Presence publish/discovery | Supabase Realtime | Tidak memakai FCM |
| Order request | Supabase Realtime | FCM hanya wake-up notice bila app target background |
| Order accept/reject | Supabase Realtime | FCM boleh kirim notice ringkas, bukan source of truth |
| Contact reveal | Supabase Realtime bertarget | Tidak boleh dibroadcast |
| Active order recovery sync | Relay pull/sync | Jika relay down, pakai local recovery mode |
| Temporary chat | Firebase temp store | Call/WhatsApp fallback |
| History / transaction log / audit | Local storage | Tidak dikirim ke FCM/Firebase chat |
| SOS notice | FCM / channel safety ringan | Payload minimum, bukan histori permanen |

Rules:
- Realtime relay tetap menjadi jalur kebenaran untuk coordination event antar user
- FCM hanya lapisan notifikasi untuk membantu wake-up/background delivery
- Event yang terlewat di push harus tetap bisa dipulihkan dari relay sync atau local state

### 4.3B Maps Strategy (Free First)
- Navigasi berbasis deep link latitude/longitude
- Android memprioritaskan Google Maps jika tersedia
- iOS memprioritaskan Apple Maps sebagai default fallback platform
- Tidak menggunakan routing/geocoding API berbayar di fase awal
- Label alamat hanya pembantu UX; koordinat tetap source of truth untuk navigasi

### 4.4 Audit Format
- **MessagePack** untuk serialisasi compact
- File binary per event + manifest SQLite lokal
- Export bundle `.tripaudit` (ZIP berisi manifest + event files)

### 4.5 Sikap Teknis yang Tegas
- Tidak ada zero-server absolut — relay tipis wajib ada untuk discovery dan signaling
- Tidak ada backend berat — tidak ada dispatch server, routing engine, atau analytics kompleks
- Tidak ada histori lokasi penuh di server

### 4.6 Klarifikasi Istilah Penting
- **Local-first** berarti source of truth untuk data bisnis utama ada di device user, bukan di relay
- **Decentralised** dalam konteks MVP ini berarti data inti tersebar di device masing-masing, bukan berarti sistem murni peer-to-peer tanpa relay
- **End-to-end** di dokumen ini berarti alur bisnis lengkap dari satu device ke device lain melalui relay tipis, dari request sampai complete/recovery
- **Binary audit** adalah format penyimpanan lokal yang compact untuk audit dan export, bukan media komunikasi antar user

---

## 5. Konteks Sistem

### 5.1 Aktor
- **Customer** — pengguna yang memesan perjalanan
- **Mitra** — pengemudi yang menerima order
- **Device OS** — lokasi, biometrics, file system, deep links
- **Thin Relay** — Supabase Realtime untuk presence dan order signaling
- **External Apps** — Google Maps, Dialer, WhatsApp

### 5.2 Batas Tanggung Jawab Sistem

**TRIP bertanggung jawab untuk:**
- Manajemen role dan profil
- Permission lokasi
- Presence discovery
- Pricing settings
- Order lifecycle
- Audit lokal
- Transaction log
- Anti-abuse dasar
- Handoff ke app eksternal

**TRIP tidak bertanggung jawab untuk:**
- Routing dan navigasi
- Pembayaran dan settlement
- In-app VoIP/call
- In-app chat
- Histori lokasi terpusat
- Admin analytics kompleks

---

## 6. Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────┐
│                  TRIP Mobile App                    │
│─────────────────────────────────────────────────────│
│  Presentation Layer                                 │
│  ├── Screens / UI Components                        │
│  ├── Navigation (React Navigation)                  │
│  └── Feature Controllers / ViewModel Hooks          │
│─────────────────────────────────────────────────────│
│  Application Layer                                  │
│  ├── Role Orchestrator                              │
│  ├── Presence Use Case                              │
│  ├── Pricing Use Case                               │
│  ├── Order Use Case                                 │
│  ├── Audit Use Case                                 │
│  ├── AntiAbuse Use Case  ← BARU (wajib MVP)         │
│  ├── TransactionLog Use Case  ← BARU               │
│  └── External Handoff Use Case                      │
│─────────────────────────────────────────────────────│
│  Domain Layer                                       │
│  ├── Entities                                       │
│  ├── Value Objects                                  │
│  ├── Order State Machine                            │
│  ├── Pricing Policy                                 │
│  ├── Presence Policy                                │
│  └── AntiAbuse Policy  ← BARU                      │
│─────────────────────────────────────────────────────│
│  Data Layer                                         │
│  ├── SQLite (profile, order, audit manifest,        │
│  │           transaction log)                       │
│  ├── Secure Storage (secrets, device binding)       │
│  ├── File System (/AUDIT folder)                    │
│  ├── Presence Gateway → Supabase Realtime           │
│  └── Order Signaling Gateway → Supabase Realtime    │
│─────────────────────────────────────────────────────│
│  Platform Integration                               │
│  ├── Location API (foreground)                      │
│  ├── Biometrics / Device Auth                       │
│  ├── File System                                    │
│  ├── Maps Deep Link                                 │
│  ├── Dialer Intent                                  │
│  └── WhatsApp Deep Link                             │
└─────────────────────────────────────────────────────┘
            │  ephemeral presence + order signals
            ▼
┌─────────────────────────────────────┐
│  Thin Relay (Supabase Realtime)     │
│  ├── Presence Channel (TTL: 120s)   │
│  ├── Order Signal Channel           │
│  ├── Anti-abuse rate limiting       │
│  └── NO: location history           │
│      NO: heavy business logic       │
│      NO: analytics storage          │
└─────────────────────────────────────┘
```

---

## 7. Gaya Arsitektur Aplikasi

- **Modular Clean Architecture** — UI tidak menyentuh storage langsung
- **Feature-first foldering** — tiap feature punya screen, controller, dan tests sendiri
- **Unidirectional data flow** — state mengalir satu arah, tidak ada circular dependency
- **Repository pattern** — data layer abstracted, mudah diganti
- **Use case orchestration** — logika bisnis ada di application layer, bukan di screen
- **Explicit state machine** — transisi order dikontrol dan dapat diaudit

---

## 8. Struktur Modul

```
src/
  app/
    navigation/          # stack, tabs, modal nav
    providers/           # context providers, DI
    bootstrap/           # initialization sequence
  core/
    types/               # shared TS types
    constants/           # app-wide constants
    utils/               # pure utility functions
    logger/              # structured logging (debug ≠ audit)
    result/              # Result<T, E> pattern
    errors/              # typed error codes
    time/                # clock abstraction (testable)
    validation/          # shared validators
  domain/
    user/
      entities/
      policies/
      value-objects/
    pricing/
      entities/
      policies/           # min/max validation, rounding
    presence/
      entities/
      policies/           # TTL, radius, sort logic
    order/
      entities/
      policies/
      state-machine/      # transitionOrder() reducer
    audit/
      entities/
      serializers/        # MessagePack encode/decode
      policies/
    anti-abuse/           # BARU: velocity check, rate limit policy
    transaction/          # BARU: commission calculation
  application/
    user/                 # setActiveRole, updateProfile
    pricing/              # updatePartnerPrice, updateCustomerOffer
    presence/             # goOnline, goOffline, discoverNearby
    order/                # createDraft, submitOrder, acceptOrder, etc
    audit/                # appendEvent, exportBundle
    anti-abuse/           # BARU: validatePresencePayload, checkVelocity
    transaction/          # BARU: recordCompletedTrip, getCommissionSummary
    external/             # openMaps, openDialer, openWhatsApp
  data/
    db/
      sqlite/             # DB connection, pool
      migrations/         # versioned migrations
      mappers/            # entity ↔ row mapping
    repositories/         # UserRepo, OrderRepo, PricingRepo, etc
    gateways/
      presence/           # PresenceGateway → Supabase
      order-signal/       # OrderSignalGateway → Supabase
    storage/              # SecureStorage wrapper
    relay/                # Supabase Realtime client setup
    serializers/          # MessagePack helpers
  integrations/
    location/             # foreground GPS
    maps/                 # deep link builder
    dialer/               # tel: intent
    whatsapp/             # wa.me deep link
    biometrics/           # react-native-biometrics wrapper
    filesystem/           # RNFS wrapper
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
    profile/
    transaction-log/      # BARU: operator view
  state/
    store/                # Redux Toolkit atau Zustand
    slices/               # session, user, order, discovery, audit
    selectors/
    effects/              # side effects / thunks
```

---

## 9. Desain Layer

### 9.1 Presentation Layer
- Render screen dan komponen UI
- Menerima input user
- Menampilkan state dari global store atau local hook
- **Tidak boleh:** menulis langsung ke DB, menyimpan business rules, melakukan I/O jaringan langsung

### 9.2 Application Layer
- Orkestrasi use case
- Koordinasi antar repository dan gateway
- Penanganan error dan recovery
- Semua logika "apa yang harus terjadi selanjutnya" ada di sini

Daftar use cases wajib:
```
setActiveRole(role)
updatePartnerPrice(pricePerKm)
updateCustomerOfferPrice(pricePerKm)
goOnline()
goOffline()
discoverNearbyOppositeRole(params)
createOrderDraft(params)
submitOrder(draftId)
acceptOrder(orderId)
rejectOrder(orderId)
advanceOrderStatus(orderId, nextStatus)
cancelOrder(orderId, reason)
openMaps(destination)
openDialer(phoneNumber)
openWhatsApp(phoneNumber, message?)
appendAuditEvent(event)
exportAuditBundle(params)
validatePresencePayload(snapshot)   ← BARU
recordCompletedTrip(orderId)        ← BARU
getTransactionSummary(period)       ← BARU
```

### 9.3 Domain Layer
- Entity definitions
- Value objects (LocationPoint, Price, Distance)
- Order state machine (pure function, no side effects)
- Pricing policy (validation, rounding)
- Presence policy (TTL check, staleness, radius filter)
- Anti-abuse policy (velocity check, coordinate range check)
- Commission policy (rate calculation)

### 9.4 Data Layer
- SQLite repository implementations
- Relay gateway implementations
- Secure storage wrapper
- File system audit store
- MessagePack serializers

---

## 10. Entitas Domain

### 10.1 UserProfile
```ts
type UserProfile = {
  userId: string               // UUID, generated locally
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
  identityStatus: 'draft' | 'active' | 'blocked'
  profileValidatedAt?: string
  createdAt: string            // ISO 8601
  updatedAt: string
}
```

### 10.1A Profile Extension Types
```ts
type VehicleProfile = {
  vehicleId: string
  vehicleType: 'motor' | 'mobil' | 'bajaj' | 'angkot'
  plateNumber?: string
  driverLicenseClass?: string
  seatCapacity?: number
  pricingMode: 'per_vehicle' | 'per_seat' | 'fixed_price'
  additionalPassengerPricePerKm?: number
  verificationStatus?: 'draft' | 'declared' | 'minimum_valid' | 'flagged' | 'blocked'
  isActiveForBooking: boolean
}

type BankAccount = {
  bankAccountId: string
  bankName: string
  accountHolderName: string
  accountNumberMasked: string
}

type SavedAddress = {
  savedAddressId: string
  label: string
  latitude: number
  longitude: number
}
```

### 10.2 PricingProfile
```ts
type PricingProfile = {
  userId: string
  partnerPricePerKm?: number   // Rp 2.000 - Rp 8.000 range
  customerOfferPerKm?: number  // opsional
  currency: 'IDR'
  updatedAt: string
}
```

### 10.3 PresenceSnapshot
```ts
type PresenceSnapshot = {
  userId: string
  role: AppRole
  isOnline: boolean
  latitude: number
  longitude: number
  visiblePricePerKm: number
  timestamp: string
  ttlSeconds: number           // default 120
}
```

### 10.4 LocationPoint
```ts
type LocationPoint = {
  label?: string
  latitude: number
  longitude: number
  source: 'gps' | 'manual'
}
```

### 10.5 OrderStatus dan Order
```ts
type OrderStatus =
  | 'Draft'
  | 'Requested'
  | 'Accepted'
  | 'OnTheWay'
  | 'OnTrip'
  | 'Completed'
  | 'Canceled'
  | 'Rejected'
  | 'Expired'

type Order = {
  orderId: string
  bookingSessionId: string
  customerId: string
  partnerId: string
  serviceType?: VehicleProfile['vehicleType']
  pricingMode?: VehicleProfile['pricingMode']
  passengerCount?: number
  bookingMode: 'manual' | 'auto'
  bookingIntent: 'self' | 'for_other'
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
  status: OrderStatus
  cancelReason?: string
  createdAt: string
  updatedAt: string
}
```

### 10.6 AuditEvent
```ts
type AuditEvent = {
  eventId: string
  eventType: AuditEventType
  actorUserId: string
  actorRole: AppRole | 'system'
  orderId?: string
  payloadCompact: Uint8Array | string
  checksum?: string
  createdAt: string
}
```

### 10.7 TransactionLog (BARU)
```ts
type TransactionLog = {
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
  commissionRate: number     // 0.10 = 10%
  commissionAmount: number
  completedAt: string
}
```

---

## 11. State Machine Order

### 11.1 Status dan Transisi Valid

```
Draft ──────────────────────────────────► Canceled
  │
  └─► Requested ──────────────────────────► Canceled
         │              │
         ├─► Accepted ──┤──────────────────► Canceled
         │      │       │
         ├─► Rejected   └─► OnTheWay ──────► Canceled
         │                     │
         └─► Expired           └─► OnTrip ──► Canceled
                                      │
                                      └─► Completed ✓
```

**State Terminal:** `Completed`, `Canceled`, `Rejected`, `Expired`

### 11.2 State Machine Reducer
```ts
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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

function transitionOrder(
  order: Order,
  nextStatus: OrderStatus,
  reason?: string
): Result<Order, AppError> {
  const allowed = VALID_TRANSITIONS[order.status]
  if (!allowed.includes(nextStatus)) {
    return err({ code: 'INVALID_ORDER_TRANSITION', current: order.status, next: nextStatus })
  }
  return ok({
    ...order,
    status: nextStatus,
    cancelReason: nextStatus === 'Canceled' ? reason : undefined,
    updatedAt: now(),
  })
}
```

### 11.3 Aturan Tambahan
- Satu order aktif per user pada satu waktu
- Semua transisi wajib menulis audit event
- Mitra tidak bisa accept jika sudah punya active order
- Order auto-expire setelah 60 detik tanpa respons mitra

---

## 12. Desain Storage Lokal

### 12.1 SQLite Tables

```sql
-- Profil pengguna
CREATE TABLE user_profile (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  phone_masked TEXT,
  phone_hash TEXT,
  current_role TEXT NOT NULL,
  active_roles TEXT NOT NULL,  -- JSON array
  device_auth_enabled INTEGER DEFAULT 0,
  identity_status TEXT NOT NULL DEFAULT 'draft',
  profile_validated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Pricing
CREATE TABLE pricing_profile (
  user_id TEXT PRIMARY KEY,
  partner_price_per_km REAL,
  customer_offer_per_km REAL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  updated_at TEXT NOT NULL
);

-- Orders
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  booking_session_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  booking_mode TEXT NOT NULL DEFAULT 'manual',
  booking_intent TEXT NOT NULL DEFAULT 'self',
  rider_declared_name TEXT NOT NULL,
  rider_phone_masked TEXT,
  pickup_json TEXT NOT NULL,
  destination_json TEXT NOT NULL,
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

-- Audit manifest (index events, actual payload di file)
CREATE TABLE audit_manifest (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  order_id TEXT,
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  file_name TEXT NOT NULL,
  checksum TEXT,
  created_at TEXT NOT NULL
);

-- Transaction log (komisi)
CREATE TABLE transaction_log (
  log_id TEXT PRIMARY KEY,
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

-- App settings (key-value)
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 12.2 Active Order Pointer
```sql
-- Di app_settings: key = 'active_order_id', value = orderId | NULL
```

### 12.2A Secure Identity Storage
- `deviceBindingId` disimpan di Secure Storage
- `phoneE164` disimpan di Secure Storage
- SQLite **tidak** menyimpan nomor telepon penuh
- `phoneHash` dipakai untuk referensi aman dan integritas profil, bukan untuk menggantikan nomor telepon asli saat handoff

### 12.2B Expanded Local Profile Storage
- Profil lokal dapat diperluas untuk menyimpan:
  - nama legal
  - nomor identitas dalam bentuk masked
  - foto profil URI
  - daftar kendaraan
  - plat kendaraan
  - kelas/status SIM
  - kelengkapan helm dan jas hujan
  - rating agregat, review count, total trip
  - daftar rekening bank
  - alamat jemput favorit
- Data sensitif dengan nilai raw tinggi tetap memakai masking/hash atau dipindah ke secure storage

### 12.2C Profile Editing Boundary
- Basic profile screen minimum mencakup:
  - display name
  - legal full name
  - profile photo
  - gender declaration
  - favorite pickup addresses
- Driver profile screen minimum mencakup:
  - kendaraan aktif dan data kendaraan
  - nomor plat
  - kelas SIM
  - seat capacity jika relevan
  - helm/jas hujan cadangan
  - bank accounts
- Perubahan field kritikal driver harus memicu hitung ulang `driverReadinessStatus`
- Jika perubahan membuat readiness tidak lolos, user tetap boleh memakai app sebagai customer tetapi tidak boleh online sebagai driver
- Saat ada active order non-terminal, field kritikal operasional harus dibekukan sampai order terminal
- Field non-operasional seperti foto profil, favorite address, dan rekening bank tetap boleh diubah saat ada active order

### 12.3 Migrations
- Semua schema changes melalui versioned migration
- Versi schema tersimpan di `user_version` SQLite pragma
- Tidak ada destructive migration tanpa backup data user

---

## 13. Desain Audit Lokal

### 13.1 Struktur Folder
```
/TRIP_DATA/
  AUDIT/
    manifest.db          ← SQLite index (audit_manifest table)
    events/
      2026-03/
        evt_<uuid>.msgpack
        evt_<uuid>.msgpack
    exports/
      audit-export-2026-03-18.tripaudit
```

### 13.2 Event Types yang Wajib Diaudit
```ts
type AuditEventType =
  | 'BOOTSTRAP_COMPLETE'
  | 'ROLE_SELECTED'
  | 'ROLE_SWITCHED'
  | 'PROFILE_VALIDATED'
  | 'IDENTITY_BLOCKED'
  | 'LOCATION_PERMISSION_GRANTED'
  | 'LOCATION_PERMISSION_DENIED'
  | 'USER_WENT_ONLINE'
  | 'USER_WENT_OFFLINE'
  | 'PRICING_UPDATED'
  | 'ORDER_DRAFT_CREATED'
  | 'ORDER_REQUESTED'
  | 'ORDER_ACCEPTED'
  | 'ORDER_REJECTED'
  | 'ORDER_EXPIRED'
  | 'ORDER_ON_THE_WAY'
  | 'ORDER_ON_TRIP'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELED'
  | 'CONTACT_REVEALED'
  | 'TRIP_IDENTITY_MISMATCH_REPORTED'
  | 'AUTH_WARNING_ISSUED'
  | 'ACCOUNT_RESTRICTED'
  | 'HANDOFF_MAPS_ATTEMPTED'
  | 'HANDOFF_MAPS_OPENED'
  | 'HANDOFF_MAPS_FAILED'
  | 'HANDOFF_CALL_ATTEMPTED'
  | 'HANDOFF_CALL_OPENED'
  | 'HANDOFF_WHATSAPP_ATTEMPTED'
  | 'HANDOFF_WHATSAPP_OPENED'
  | 'HANDOFF_WHATSAPP_FAILED'
  | 'AUDIT_EXPORTED'
  | 'RECOVERY_TRIGGERED'
  | 'ANTI_ABUSE_VIOLATION'   // BARU
  | 'TRANSACTION_RECORDED'   // BARU
```

### 13.3 Format Audit Record
```
Binary structure:
[2 bytes: version]
[1 byte: eventType encoded]
[8 bytes: timestamp unix ms]
[1 byte: actorRole]
[16 bytes: actorUserId UUID]
[16 bytes: orderId UUID atau zeros]
[4 bytes: payloadLength]
[N bytes: MessagePack payload]
[4 bytes: CRC32 checksum]
```

### 13.4 Strategi Tulis
1. Bentuk payload compact
2. Encode ke MessagePack
3. Buat binary record dengan header
4. Hitung CRC32
5. Tulis ke temp file
6. Rename atomik ke nama final
7. Insert ke audit_manifest (SQLite)
8. Proses ini async, tidak blocking UI

### 13.5 File Rotation
- Satu folder per bulan (`events/YYYY-MM/`)
- Hapus event file > 6 bulan (tapi pertahankan manifest entry)
- Berikan opsi export sebelum rotation

### 13.6 Klarifikasi Penggunaan Binary Audit
- File audit binary ditulis saat runtime ke file system device, bukan ditanam ke binary aplikasi
- Binary audit tidak dipakai untuk discovery, signaling, atau sinkronisasi antar user
- Binary audit dipakai untuk audit trail lokal, recovery support, dan export jika dibutuhkan operator
- Event auth/identity yang penting juga wajib masuk audit, misalnya profile validated, identity blocked, dan contact revealed

---

## 14. Desain Presence dan Discovery

### 14.1 Model Presence
Setiap user online mempublish PresenceSnapshot ke relay channel yang sesuai dengan role mereka.

Channel structure di Supabase Realtime:
- `presence:mitra` — semua mitra yang online
- `presence:customer` — semua customer yang online

### 14.2 Lifecycle Presence
```
User tap "Online"
  → Validate pricing tidak kosong (untuk mitra)
  → Validate lokasi tersedia
  → Validate anti-abuse (coordinate range, rate limit)
  → Publish PresenceSnapshot ke channel
  → Mulai refresh loop (setiap 20 detik)

User tap "Offline"
  → Stop refresh loop
  → Unpublish presence (hapus dari channel)
  → Tulis audit USER_WENT_OFFLINE

App background / killed
  → Supabase Realtime auto-cleanup connection
  → Presence TTL expire setelah 120 detik
```

### 14.3 Discovery Query
```
Customer query mitra terdekat:
  → Subscribe ke presence:mitra channel
  → Filter: radius ≤ 3km dari lokasi customer
  → Filter: timestamp masih dalam TTL
  → Sort: jarak terdekat, lalu price compatibility
  → Render list/peta

Mitra melihat customer aktif:
  → Subscribe ke presence:customer channel
  → Filter radius + TTL yang sama
  → Sort: jarak terdekat
```

### 14.4 Anti-Abuse untuk Presence
Sebelum publish presence, sistem wajib validasi:
- Koordinat dalam range Indonesia: lat (-11 s.d. 6), lng (95 s.d. 141)
- Kecepatan gerak dari posisi sebelumnya tidak melebihi 150 km/h
- Rate limit: maks 1 publish per 10 detik per userId
- Timestamp dalam window ±5 menit dari server time

---

## 15. Desain Order Signaling

### 15.1 Flow Submit Order
```
Customer submit order:
  1. Buat order dengan status Requested, simpan lokal
  2. Tulis audit ORDER_REQUESTED
  3. Kirim OrderRequestPayload ke relay (order signal channel)
  4. Mulai timeout 60 detik di client

Mitra menerima order:
  1. Relay fanout payload ke mitra yang dituju
  2. Mitra tampilkan incoming order screen dengan countdown
  3. Mitra tap Accept/Reject
  4. Kirim response ke relay
  5. Relay fanout response ke customer
  6. Kedua pihak update status order lokal
```

### 15.1A Booking Draft Lifecycle
- `Draft` adalah state order yang masih boleh diedit oleh customer
- Selama masih `Draft`, customer masih boleh mengubah `serviceType`, pickup, destination, mode booking, partner terpilih, `bookingIntent`, `passengerCount`, `paymentMethod`, dan field perlengkapan yang relevan
- Setiap perubahan field inti harus memicu re-calculate jarak estimasi dan estimasi harga
- Saat customer menekan konfirmasi, app harus membekukan field yang akan dikirim ke mitra lalu mengubah order ke `Requested`
- Setelah menjadi `Requested`, field inti tidak boleh berubah diam-diam; perubahan harus lewat cancel lalu buat order baru

### 15.1A.1 Service Selector dan Adaptive Form
- Booking flow dimulai dengan `serviceType` selector
- Untuk MVP pilot, opsi yang aktif hanya `motor` dan `mobil`
- Form harus adaptif:
  - `motor`: `bookingIntent`, rider declaration, `bringsOwnHelmet`, `bringsOwnRaincoat`
  - `mobil`: `bookingIntent`, rider declaration, `passengerCount`
- Quote tidak boleh dibangun sebelum field minimum untuk `serviceType` aktif terpenuhi

### 15.1B Dua Mode Booking
- `Manual select`
  Customer melihat nearby list lalu memilih satu mitra tertentu
- `Auto booking`
  App memilih kandidat mitra terbaik secara otomatis dari discovery list yang tersedia di device customer
- Kedua mode tetap menghasilkan **target tunggal** per attempt, bukan broadcast ke banyak mitra sekaligus
- Jika `auto booking` gagal karena reject/timeout, app boleh mencoba kandidat berikutnya **secara berurutan**, bukan paralel
- Setiap attempt auto booking tetap harus bisa dijelaskan ke user: siapa yang dipilih dan kenapa

### 15.1C Auto Booking Ranking Policy (MVP)
- Ranking dilakukan **di client/customer device**, bukan dispatch server
- Faktor ranking MVP yang boleh dipakai:
  - freshness snapshot
  - jarak mitra ke pickup
  - total estimasi biaya ke customer setelah pickup surcharge
  - trust status mitra jika tersedia
- Faktor tambahan jika preference aktif:
  - kecocokan `genderDeclaration` mitra dengan preferensi customer
- Faktor yang **belum dipakai** di MVP:
  - rating/review publik
  - kualitas kendaraan
  - scoring kompleks berbasis histori
- Jika tidak ada kandidat eligible, app harus menampilkan hasil yang jelas dan tidak mengirim request

### 15.1C.1 Safety Preference dan Recommendation Boundary
- `prefersFemaleDriver` bersifat opt-in, default `false`
- Preference ini hanya dapat dipakai jika mitra memiliki `genderDeclaration`
- `genderDeclaration` pada MVP bersifat deklaratif, bukan verifikasi identitas kuat
- Jika preference aktif dan tidak ada kandidat yang cocok, UI harus menjelaskan bahwa supply tidak tersedia
- Recommendation harus tetap explainable: tampilkan alasan singkat seperti "lebih dekat", "estimasi lebih rendah", atau "sesuai preferensi"
- Recommendation tidak boleh menyembunyikan daftar kandidat lain yang masih eligible

### 15.1C.2 Candidate Filtering sebelum Ranking
- Sebelum manual select atau auto ranking, candidate set harus disaring berdasarkan:
  - `serviceType` cocok dengan kendaraan aktif mitra
  - `driverReadinessStatus = minimum_valid`
  - `vehicle.verificationStatus = minimum_valid`
  - kapasitas kursi cukup jika `pricingMode = per_seat`
  - preference filter jika aktif
  - snapshot discovery masih fresh
- Candidate yang gagal salah satu filter tidak boleh tampil sebagai target booking yang valid

### 15.1D Pickup Surcharge Policy
- Mitra tidak boleh dirugikan untuk jarak penjemputan yang jauh
- Jika jarak mitra ke pickup `<= 3 km`, tidak ada biaya tambahan
- Jika jarak mitra ke pickup `> 3 km`, customer dikenakan biaya penjemputan tambahan
- Formula MVP:
  - `pickupSurchargeKm = max(0, pickupDistanceFromPartnerKm - 3)`
  - `pickupSurchargeAmount = pickupSurchargeKm × pricePerKmApplied`
- Breakdown ini harus terlihat sebelum booking di sisi customer dan saat incoming order di sisi mitra
- Karena itu ranking `auto booking` harus melihat total estimasi, bukan hanya tarif per-km mentah

### 15.1E Final Quote Builder
- Review order harus menjadi titik pembekuan quote final sebelum submit
- Breakdown minimum yang harus tampil:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `waitingChargeAmount` jika sudah relevan
  - `driverDelayDeductionAmount` jika sudah relevan
  - `gearDiscountAmount` jika ada
  - `paymentMethod`
  - admin fee split jika `gateway` aktif
  - total estimasi customer
- Jika satu komponen belum dapat dihitung dengan valid, tombol confirm harus tetap disabled

### 15.1F Auto Booking Retry UX
- `auto booking` harus menampilkan progress attempt ke customer
- Customer perlu tahu:
  - kandidat ke berapa yang sedang dicoba
  - apakah attempt sebelumnya reject atau timeout
  - kapan sistem sudah kehabisan kandidat
- Retry tetap berurutan, tidak paralel

### 15.1G Failure States
- Booking flow wajib punya state yang manusiawi untuk:
  - `no_eligible_driver`
  - `no_matching_driver_for_preference`
  - `selected_driver_stale`
  - `auto_booking_candidates_exhausted`
  - `booking_form_incomplete`
  - `payment_method_not_ready`

### 15.2 Payload
```ts
type BookingIntent = 'self' | 'for_other'
type OrderRejectReasonCode =
  | 'busy'
  | 'pickup_too_far'
  | 'price_not_suitable'
  | 'suspicious_order'
  | 'undeclared_rider'
  | 'payload_invalid'
  | 'expired'

// Request dari customer ke mitra
type OrderRequestPayload = {
  orderId: string
  bookingSessionId: string
  customerId: string
  customerDisplayName: string
  bookingMode: 'manual' | 'auto'
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
  paymentMethod?: 'cash' | 'manual_transfer' | 'gateway'
  paymentAdminFeeTotal?: number
  customerAdminFeeShare?: number
  partnerAdminFeeShare?: number
  estimatedPrice: number
  expiresAt: string           // createdAt + 60 detik
  createdAt: string
}

// Response dari mitra ke customer
type OrderResponsePayload = {
  orderId: string
  partnerId: string
  response: 'accept' | 'reject'
  responseReasonCode?: OrderRejectReasonCode
  respondedAt: string
}

// Reveal contact hanya setelah order Accepted
type OrderContactRevealPayload = {
  orderId: string
  customerId: string
  partnerId: string
  customerPhoneE164: string
  partnerPhoneE164: string
  availableHandoffActions: Array<'call' | 'whatsapp' | 'temporary_chat'>
  revealedAt: string
  expiresAt: string
}
```

### 15.3 Aturan Signaling
- Mitra hanya bisa punya 1 active order
- Customer hanya bisa punya 1 active order
- Payload dengan `expiresAt` sudah lewat wajib ditolak
- Order aktif selalu di-persist lokal (tidak hanya di memory)
- Local storage saja tidak cukup untuk mempertemukan dua user yang sama-sama online; karena itu relay tetap wajib untuk presence dan order signaling

### 15.3A Contact Reveal dan Temporary Chat Boundary
- Contact reveal hanya boleh dilakukan setelah `OrderResponsePayload.response = accept`
- Reveal hanya berlaku untuk pasangan `customerId` dan `partnerId` pada `orderId` yang sama
- Nomor telepon penuh tidak boleh dipublish ke discovery, incoming order screen, atau candidate list
- Temporary chat hanya boleh aktif bila order masih aktif, contact reveal sudah sukses, dan feature flag chat aktif
- Semua pesan chat temporary harus terikat ke `orderId` agar cleanup dan dispute tracing tetap jelas
- Jika contact reveal atau temporary chat gagal, flow order inti tetap lanjut; fallback utama tetap call/WhatsApp handoff

### 15.3B Booking Validation dan Freeze Rules
- Customer tidak boleh submit jika masih punya active order non-terminal
- Customer tidak boleh memilih dirinya sendiri sebagai mitra
- Pickup dan destination wajib valid, lengkap, dan tidak boleh identik secara tidak masuk akal
- Snapshot mitra yang dipilih harus masih fresh saat konfirmasi; jika sudah stale, customer harus pilih ulang atau refresh discovery
- `pricePerKmApplied`, `baseTripEstimatedPrice`, `pickupSurchargeAmount`, `paymentMethod`, komponen admin fee, dan `estimatedPrice` yang dikirim ke mitra adalah nilai yang dibekukan saat submit, bukan dihitung ulang diam-diam di sisi mitra
- Setelah `Requested`, field yang dianggap immutable: `partnerId`, `bookingMode`, `pickup`, `destination`, `bookingIntent`, `riderDeclaredName`, `riderPhoneMasked`, `pricePerKmApplied`, `pickupDistanceFromPartnerKm`, `baseTripEstimatedPrice`, `pickupSurchargeAmount`, `paymentMethod`, `paymentAdminFeeTotal`, `customerAdminFeeShare`, `partnerAdminFeeShare`, `estimatedPrice`

### 15.3C Incoming Order Decision Rules
- Incoming order screen di sisi mitra wajib menampilkan:
  - `customerDisplayName`
  - `serviceType`
  - `passengerCount` jika relevan
  - `bookingMode`
  - `bookingIntent`
  - `riderDeclaredName` dan `riderPhoneMasked` jika `for_other`
  - `paymentMethod`
  - pickup, destination, jarak mitra ke pickup
  - `baseTripEstimatedPrice`, `pickupSurchargeAmount`, `gearDiscountAmount` jika ada, admin fee split jika ada, dan `estimatedPrice`
  - countdown sisa waktu respons
- Mitra hanya boleh `Accept` jika:
  - payload masih valid dan belum expired
  - `partnerId` pada payload cocok dengan user aktif di device
  - mitra belum punya active order non-terminal
  - order lokal masih di state `Requested`
- `Reject` boleh dipicu oleh user atau sistem
- Jika reject dipicu user, `responseReasonCode` wajib diisi
- Reason minimum yang didukung untuk reject: `busy`, `pickup_too_far`, `price_not_suitable`, `suspicious_order`, `undeclared_rider`
- Reject sistem memakai `payload_invalid` atau `expired`
- Jika `bookingMode = manual`, reject/expired mengakhiri attempt dan customer kembali memilih mitra
- Jika `bookingMode = auto`, reject/expired boleh memicu attempt berikutnya **secara berurutan** dalam `bookingSessionId` yang sama

### 15.3D Incoming Order Screen Contract
- Header: nama customer + `serviceType` badge + countdown
- Body summary:
  - pickup
  - destination
  - passenger context
  - rider declaration
  - payment method
- Financial breakdown:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `gearDiscountAmount` bila relevan
  - admin fee split bila aktif
  - total estimasi
- Footer actions:
  - `Accept`
  - `Reject`
  - optional `Open Maps to Pickup`

### 15.4 Aturan Exposure Data
- Presence/discovery **tidak boleh** membawa nomor telepon penuh
- Sebelum order accepted, pihak lain hanya melihat data minimum yang perlu: display name, role, harga terlihat, dan data pickup/destination yang relevan untuk order
- Nomor telepon penuh baru boleh diekspos setelah order `Accepted` dan hanya ke pasangan order yang aktif
- Contact exchange dilakukan lewat relay sebagai payload sensitif bertarget ke dua pihak order, tidak dibroadcast ke channel umum

### 15.5 Hak Cancel dan Report karena Data Tidak Sesuai
- Customer dan mitra **berhak cancel** jika data identitas, nomor kontak, atau perilaku pihak lawan tidak sesuai dengan data yang tampil di app
- Reason minimum yang harus didukung: `identity_mismatch`, `undeclared_rider`, `contact_mismatch`, `unsafe_or_suspicious`, `pickup_mismatch`
- Cancel karena mismatch **tidak boleh** memaksa trip lanjut hanya karena order sudah `Accepted`
- Saat mismatch terjadi, sistem wajib menulis audit event `TRIP_IDENTITY_MISMATCH_REPORTED` beserta actor, orderId, dan reason code

### 15.5A Cancel, No-Show, dan Mismatch Boundary
- `cancel biasa`
  - dipakai untuk perubahan keputusan tanpa tuduhan mismatch
  - tidak otomatis memicu punishment
- `no_show`
  - baru sah setelah milestone `Arrived at Pickup`
  - dapat dipakai bila pihak lawan tidak muncul dalam window yang wajar
- `mismatch / unsafe cancel`
  - boleh dipakai sejak `Accepted` sampai sebelum `OnTrip`
  - harus membuka jalur report jika reason bersifat objektif atau safety-related
- Setelah `OnTrip`, cancel hanya untuk kondisi darurat dan tidak boleh dicampur dengan no-show

### 15.6 Delegated Booking (Customer memesankan orang lain)
- Sistem harus membedakan dua mode: `bookingIntent = self` dan `bookingIntent = for_other`
- Jika customer memesankan orang lain, customer **wajib declare sejak awal** bahwa penumpang aktual bukan dirinya
- Untuk `for_other`, order wajib membawa minimal `riderDeclaredName` dan `riderPhoneMasked`
- Mitra harus bisa melihat bahwa order ini adalah **delegated booking**, bukan order untuk account holder sendiri
- Jika di lapangan penumpang aktual berbeda dari rider yang dideklarasikan, itu diperlakukan sebagai mismatch yang valid
- Jika customer memesankan orang lain **tanpa deklarasi**, mitra boleh cancel dengan reason `undeclared_rider`

---

## 16. Desain Pricing

### 16.1 Aturan Bisnis
```ts
// Batas harga (bisa dikonfigurasi, bukan hardcode)
const PRICING_CONSTRAINTS = {
  minPartnerPricePerKm: 2000,   // Rp 2.000
  maxPartnerPricePerKm: 8000,   // Rp 8.000
  roundingUnit: 500,            // Pembulatan ke Rp 500 terdekat
}

// Kalkulasi estimasi harga
function calculateEstimatedPrice(
  distanceKm: number,
  pricePerKm: number
): number {
  const raw = distanceKm * pricePerKm
  return Math.ceil(raw / 500) * 500  // round up ke 500
}

// Tarif yang digunakan untuk order
function resolveAppliedPrice(
  partnerPricePerKm: number,
  customerOfferPerKm?: number
): number {
  // Jika customer set offer, gunakan offer
  // Mitra accept/reject berdasarkan nilai ini
  return customerOfferPerKm ?? partnerPricePerKm
}
```

### 16.1A Multi-Vehicle Pricing Direction
- `motor` default memakai pricing `per_vehicle`
- `mobil` dan `bajaj` boleh memakai pricing `per_seat`
- `angkot` diarahkan ke pricing `fixed_price` berbasis rute/tarif tetap
- Untuk `per_seat`, tarif terdiri dari:
  - `basePricePerKm` untuk penumpang pertama
  - `additionalPassengerPricePerKm` untuk setiap penumpang tambahan
- Discovery dan review order wajib menjelaskan mode harga ini secara eksplisit

### 16.1B Driver Readiness Rules
- Semua user boleh menjadi driver, tetapi baru `ready to online` jika kendaraan aktif dan legalitas minimum terisi
- Jika kendaraan aktif adalah `motor`, `hasSpareHelmet` wajib `true`
- Jika readiness belum lolos, user tetap bisa memakai app sebagai customer

### 16.1B.1 Driver Verification Matrix
| Verification Status | Arti | Boleh Online Sebagai Driver |
|---|---|---|
| `draft` | data driver belum lengkap | Tidak |
| `declared` | data sudah diisi tetapi belum lolos cek minimum | Tidak |
| `minimum_valid` | data lolos validasi format dan konsistensi minimum | Ya |
| `flagged` | data janggal dan perlu ditahan | Tidak |
| `blocked` | data ditolak karena risiko tinggi atau pola abuse | Tidak |

Rule:
- MVP ini memakai verifikasi `minimum_valid`, bukan KYC legal penuh
- `minimum_valid` cukup untuk pilot, tetapi tidak boleh diklaim sebagai legal identity proof
- Data yang saling bertentangan atau tampak palsu diperlakukan sebagai `flagged` atau `blocked`

### 16.1B.2 Driver Profile Mutation Rules
- Field yang dianggap kritikal untuk readiness:
  - `legalFullName`
  - `identityNumberMasked`
  - `vehicleType`
  - `plateNumber`
  - `driverLicenseClass`
  - `seatCapacity`
  - `hasSpareHelmet`
  - `hasRaincoatSpare`
  - `isActiveForBooking`
- Perubahan pada field kritikal harus memicu evaluasi ulang readiness dan validasi minimum
- Jika hasil evaluasi turun ke `draft|declared|flagged|blocked`, home mitra wajib menampilkan gate reason yang sesuai
- Order aktif yang sudah berjalan tidak boleh diubah maknanya oleh perubahan profile driver di tengah trip

### 16.1C Waiting Fairness Policy
- Setelah driver tiba di pickup, 5 menit pertama gratis
- Setiap kelipatan 5 menit berikutnya menghasilkan waiting charge sebesar `pricePerKmApplied`
- Jika driver tidak bergerak secara material dari titik awal selama lebih dari 5 menit setelah `Accepted`, customer mendapat deduction dengan formula simetris
- Charge dan deduction wajib tampil transparan di breakdown akhir

### 16.1D Gear Discount Policy
- Untuk layanan motor:
  - customer membawa helm sendiri → potongan `Rp 500/km`
  - saat hujan dan customer membawa jas hujan sendiri → tambahan potongan `Rp 500/km`
- Status perlengkapan customer harus terlihat ke driver di incoming order

### 16.1E Service Matrix dan Scope Lock
| Service Type | Pricing Mode | Rule Penting | Scope |
|---|---|---|---|
| `motor` | `per_vehicle` | 1 rider utama, gear discount aktif, helm dua wajib | MVP Pilot |
| `mobil` | `per_seat` | base passenger + additional passenger per km | MVP Pilot |
| `bajaj` | `per_seat` | serupa mobil dengan kapasitas lebih kecil | Phase 2 |
| `angkot` | `fixed_price` | model rute/tarif tetap, bukan order personal penuh | Phase 2+ |

Rule:
- MVP pilot dikunci ke `motor` dan `mobil`
- `bajaj` dan `angkot` tetap masuk desain, tetapi tidak boleh mempersulit core flow MVP
- Angkot fixed-price membutuhkan policy terpisah dan tidak memakai seluruh rule pricing personal ride

### 16.1F Pricing Update Boundary
- Pricing settings screen minimum mencakup:
  - partner price per km
  - customer offer per km
  - active pricing explanation untuk service type yang sedang dipakai
- Saat mitra online tanpa active order, perubahan pricing harus memperbarui snapshot discovery untuk order berikutnya
- Saat ada active order non-terminal, perubahan pricing tidak boleh mengubah quote, incoming order, atau breakdown trip aktif
- UI pricing harus menampilkan copy yang jujur bahwa perubahan berlaku prospektif untuk booking baru

### 16.2 Tampilan
- Discovery list: tampilkan `visiblePricePerKm` masing-masing mitra
- Review order: tampilkan jarak estimasi + tarif terpakai + estimasi total
- Label "estimasi" wajib tampil pada semua nilai harga kalkulasi

---

## 17. Desain Transaction Log

### 17.1 Kapan Dicatat
Transaction log entry dibuat setiap kali order berpindah ke status `Completed`.

### 17.2 Commission Policy
```ts
const COMMISSION_RATE = 0.10  // 10% — di bawah batas regulasi 15%

function calculateCommission(baseTripEstimatedPrice: number): number {
  return Math.round(baseTripEstimatedPrice * COMMISSION_RATE)
}
```

### 17.3 Rekap Manual (MVP)
- Transaction log tersimpan di SQLite lokal (di device operator / admin)
- Export ke CSV untuk rekap manual di fase awal
- Komisi dipungut offline oleh operator — tidak ada auto-deduction di MVP
- Basis komisi hanya `baseTripEstimatedPrice`
- `pickupSurchargeAmount` sepenuhnya milik mitra dan tidak dihitung sebagai basis komisi platform

> **Catatan CEO:** Ini memang manual dan tidak scalable jangka panjang. Tapi ini cukup untuk validasi dan mulai membangun data transaksi nyata sebelum investasi ke payment integration.

### 17.3A Transaction Log View UX
- Transaction log screen harus mudah dipindai dan tidak terasa seperti tabel mentah
- List minimum menampilkan:
  - short order id
  - tanggal selesai
  - service type
  - payment method
  - total estimasi
  - basis komisi
  - commission amount
  - payment admin fee bila ada
- Detail log tidak boleh menghitung ulang angka secara diam-diam; semua nilai diambil dari snapshot order saat trip selesai
- Export CSV wajib memakai kolom yang tetap dan human-readable agar operator mudah rekap manual

### 17.3B History Detail UX
- History list harus menampilkan ringkasan yang mudah dipahami: role lawan transaksi, service type, status akhir, waktu, dan total
- History detail minimum menampilkan:
  - pickup dan destination ringkas
  - payment method
  - base trip price
  - pickup surcharge
  - gear discount bila ada
  - waiting charge atau driver delay deduction bila ada
  - estimated/final payable total
  - cancel reason, no-show, atau mismatch reason bila order tidak selesai normal
- History detail wajib membantu user menelusuri apa yang terjadi pada trip, bukan sekadar membuka object order mentah

### 17.4 Payment Method Evolution
- Metode pembayaran yang diakomodasi desain:
  - `cash`
  - `manual_transfer`
  - `gateway`
- MVP tetap local-first dan tidak wajib menyelesaikan settlement otomatis
- Jika `gateway` dipakai di fase lanjut, biaya admin dibagi dua antara customer dan driver

### 17.4A Payment Flow Boundary
- `cash`
  - customer membayar langsung ke driver
  - aplikasi hanya mencatat metode bayar dan nilai transaksi
- `manual_transfer`
  - customer dan driver menyelesaikan transfer di luar settlement aplikasi
  - aplikasi hanya mencatat deklarasi metode bayar
- `gateway`
  - hanya aktif jika feature flag dan integrasi pembayaran sudah siap
  - breakdown wajib menampilkan `paymentAdminFeeTotal`, `customerAdminFeeShare`, dan `partnerAdminFeeShare`
  - basis komisi platform tetap `baseTripEstimatedPrice`, bukan biaya admin payment

### 17.4B Audit Export UX Boundary
- Audit export screen minimum menampilkan:
  - rentang tanggal export
  - opsi semua event vs periode tertentu
  - indicator progress export
  - hasil file export saat sukses
  - error message yang jelas saat gagal
- Export berjalan async agar layar tetap responsif
- Hasil export harus memberikan path file atau share sheet yang jelas, bukan hanya toast generik
- Bila device auth gagal, user harus kembali ke screen dengan state aman dan pesan yang bisa dipahami

### 17.5 Default Rating Policy
- Setiap trip selesai akan menghasilkan rating default `5`
- Jika customer mengirim rating manual, rating manual menggantikan default
- Rating default dimaksudkan sebagai baseline apresiasi, bukan mekanisme manipulasi reputasi

### 17.5A Post-Trip Feedback Flow
- Setelah order `Completed`, customer boleh melihat post-trip feedback sheet yang ringan
- Sheet minimum menampilkan:
  - rating 1-5 bintang
  - review singkat opsional
  - reminder barang bawaan atau penutup yang hangat
- Jika customer menutup atau melewati sheet tanpa input manual, rating default `5` dibekukan
- Review teks pada MVP disimpan sebagai catatan pengalaman dan belum menjadi sinyal publik untuk recommendation otomatis
- Feedback flow tidak boleh menghambat penulisan transaction log, audit, atau penutupan order

---

## 18. Desain Keamanan

### 18.1 Data Classification

| Kategori | Data | Penyimpanan |
|----------|------|-------------|
| Sangat sensitif | Nomor telepon penuh, device binding key | Secure Storage (Keychain/Keystore) |
| Sensitif terbatas | Phone masked, phone hash, identity status | SQLite |
| Sensitif | Order history, pickup/destination, tarif | SQLite (encrypted at rest jika memungkinkan) |
| Internal | Audit payload | File binary + checksum |
| Rendah | Role aktif, UI preference | SQLite atau AsyncStorage |

### 18.2 Kontrol Keamanan MVP
- Secure Storage untuk secret kecil
- Audit export ter-guard oleh biometrics/PIN
- Checksum CRC32 pada setiap audit event file
- Log aplikasi tidak boleh menulis nomor telepon atau koordinat mentah secara penuh
- Build production wajib code obfuscation (Hermes / ProGuard)

### 18.3 Validasi Data dan Treatment Fraud
- Input profil harus dinormalisasi sebelum disimpan: trim whitespace, batasi panjang display name, normalisasi nomor ke `+62...`
- Data yang gagal validasi format **ditolak sebelum persist**
- Data yang valid format tetapi mencurigakan dapat diberi `identityStatus = 'blocked'` dan user tidak boleh online sampai diperbaiki
- Payload dari relay yang invalid, expired, atau tidak lolos policy **tidak boleh** mengubah business state lokal
- Semua violation penting harus ditulis ke audit sebagai dasar dispute dan investigasi
### 18.4 Anti-Abuse (Wajib di MVP)
Lihat bagian 14.4 untuk validasi presence. Tambahan:
- Reject order payload dengan timestamp > 5 menit dari now
- Rate limit order submit: maks 1 order baru per 30 detik per user
- Log `ANTI_ABUSE_VIOLATION` ke audit setiap kali ada pelanggaran yang terdeteksi

### 18.5 Catatan Realitas
Local-first architecture berarti data ada di device user. Device compromise (jailbreak/root) tidak bisa dicegah sepenuhnya. Fokus MVP adalah:
- Mengurangi data yang disimpan
- Menambah friction akses
- Menyediakan audit trail untuk dispute resolution

### 18.6 Auth Lifecycle Operasional
Definisi penting:
- **Terdaftar di app** pada MVP berarti user sudah membuat profil lokal yang device-bound dan lolos validasi minimum
- **Bukan** berarti identitas legal atau kepemilikan nomor telepon sudah diverifikasi kuat seperti sistem OTP/KYC

Lifecycle yang disepakati:
1. **First install**
   App membuat `userId` dan `deviceBindingId`
2. **Profile draft**
   User mengisi display name, nomor telepon, dan role; data belum boleh dipublish ke publik
3. **Profile validated**
   Data dinormalisasi, format diperiksa, nomor di-mask/hash untuk SQLite, nomor penuh masuk Secure Storage
4. **Identity active**
   Status berubah ke `active` jika semua syarat minimum lolos
5. **Ready to online**
   User baru boleh online jika `identityStatus = active`, binding device ada, dan gate role-specific lolos
6. **Online**
   Hanya data minimum dipublish ke relay; nomor telepon penuh tetap tersembunyi
7. **Matched / accepted**
   Setelah order diterima, contact reveal boleh dilakukan hanya ke dua pihak order aktif
8. **Trip verification by humans**
   Customer dan mitra membandingkan identitas/nomor/perilaku nyata dengan data di app
9. **Mismatch handling**
   Jika tidak cocok atau terasa mencurigakan, salah satu pihak boleh cancel dan report mismatch
10. **Blocked**
   Profil yang gagal validasi berat atau dianggap mencurigakan bisa diubah ke `blocked` sehingga tidak boleh online

Makna praktisnya:
- MVP ini bisa menghasilkan user yang **ready to online** dan cukup aman untuk pilot
- MVP ini **belum cukup** untuk menjamin bahwa user adalah pemilik sah nomor atau identitas legal tanpa OTP/KYC/operator review
- Jadi fungsi auth MVP adalah **trust minimization**, bukan trust elimination

### 18.7 Warning dan Punishment untuk Melindungi Mitra
Prinsip:
- Jalur punishment terutama dipicu oleh report dari **mitra**, karena mismatch customer lebih sering merugikan mitra di lapangan
- Delegated booking yang **dideklarasikan dengan benar** tidak boleh diperlakukan sebagai fraud

Ladder minimum:
1. **Warning**
   Report mismatch valid pertama memberi warning ke account customer
2. **Delegated booking restricted**
   Jika mismatch berulang, customer masuk status `delegated_booking_restricted`
3. **Order creation restricted**
   Jika mismatch serius atau berulang lintas mitra, customer masuk status `restricted`
4. **Suspended / blocked**
   Jika ada pola abuse kuat atau unsafe behavior, account masuk status `suspended` atau `blocked` sampai ada tindak lanjut operator

Kapan punishment boleh naik:
- Ada mismatch `undeclared_rider`
- Nomor kontak setelah contact reveal tidak cocok dengan yang dideklarasikan
- Banyak report serupa dari mitra berbeda dalam rolling window
- Ada reason `unsafe_or_suspicious`

Batas realitas:
- Punishment yang hanya disimpan lokal mudah dibypass dengan reinstall atau ganti device
- Jadi punishment yang benar-benar berguna **membutuhkan metadata enforcement minimal di relay/backing store**, misalnya warning count, trust level, dan restriction until
- Metadata enforcement ini kecil dan tidak mengubah prinsip local-first, karena yang disimpan bukan histori trip penuh melainkan status trust minimum

### 18.8 Decision Table Enforcement
Kondisi report yang **layak diproses**:
- Report dibuat oleh mitra yang memang menerima order tersebut
- Order minimal sudah `Accepted`
- Reason code jelas dan masuk daftar resmi
- Report dibuat dalam window yang wajar setelah accept atau pertemuan fisik

Kondisi report yang **tidak boleh menghukum customer**:
- Delegated booking sudah dideklarasikan dengan benar dan rider sesuai deklarasi
- Mitra hanya berubah pikiran tanpa ada mismatch nyata
- Report duplikat untuk order yang sama
- Data tidak cukup untuk membedakan mismatch vs miskomunikasi biasa

Tabel keputusan minimum:

| Kondisi | Keputusan |
|--------|-----------|
| `bookingIntent=self`, rider sesuai, tidak ada mismatch | Tidak ada punishment |
| `bookingIntent=for_other`, rider dideklarasikan, rider sesuai deklarasi | Tidak ada punishment |
| `bookingIntent=for_other`, rider aktual berbeda dari deklarasi | Warning + mismatch report |
| Rider pihak ketiga muncul tanpa deklarasi | Warning, dan kandidat restrict delegated booking |
| Nomor/identitas kontak setelah reveal tidak cocok | Warning, dan jika berulang jadi restrict |
| Reason `unsafe_or_suspicious` dari banyak mitra berbeda | Restrict atau suspend |
| Report berulang dari mitra berbeda dalam rolling window | Escalate ke restrict |
| Report tunggal yang lemah / ambiguous | Catat audit saja, tanpa punishment otomatis |

Prinsip fairness:
- Sistem harus melindungi mitra, tetapi **tidak boleh** otomatis menghukum customer untuk delegated booking yang sah
- Hukuman otomatis hanya boleh naik pada reason yang relatif objektif atau pada pola report berulang lintas order/mitra

### 18.9 Trust Enforcement State Machine
State minimum:
- `clear`
- `warned`
- `delegated_booking_restricted`
- `restricted`
- `suspended`

Transition rules:
- `clear -> warned`
  Trigger: mismatch valid pertama dari mitra
- `warned -> delegated_booking_restricted`
  Trigger: report valid berulang dengan reason `undeclared_rider` atau `contact_mismatch`
- `warned -> restricted`
  Trigger: mismatch berat lintas mitra atau kombinasi warning + unsafe signal
- `delegated_booking_restricted -> restricted`
  Trigger: tetap ada mismatch baru saat customer sudah dibatasi untuk delegated booking
- `restricted -> suspended`
  Trigger: report berat berulang, `unsafe_or_suspicious`, atau pola abuse yang kuat
- `warned -> clear`
  Trigger: review manual atau cooldown policy selesai tanpa insiden baru
- `delegated_booking_restricted -> warned|clear`
  Trigger: masa restriksi selesai dan tidak ada insiden baru
- `restricted -> warned|clear`
  Trigger: review manual atau masa restriksi selesai

Invariants:
- `clear` dan `warned` masih boleh booking untuk diri sendiri
- `delegated_booking_restricted` tidak boleh memakai `bookingIntent=for_other`
- `restricted` tidak boleh membuat order baru
- `suspended` tidak boleh menggunakan fitur transaksi utama sama sekali

### 18.10 Safety Preference dan Background Standby
- Customer perempuan dapat menyimpan preferensi `prefersFemaleDriver`
- Preference ini adalah filter pemesanan, bukan jaminan absolut bila supply tidak tersedia
- Gender driver pada MVP bersifat `genderDeclaration`, bukan verifikasi identitas kuat
- Background standby hanya boleh aktif saat ada order aktif, bukan untuk discovery terus-menerus
- Saat order aktif, app boleh melakukan update lokasi periodik minimum untuk kebutuhan sinkronisasi dan SOS
- SOS minimal membawa `actorUserId`, `orderId` bila ada, lokasi terakhir, dan keterangan bahaya singkat
- Frekuensi target update lokasi background: sekitar 60 detik sekali bila OS mengizinkan
- Background safety mode harus diposisikan sebagai best-effort capability, bukan jaminan tracking kontinu di semua device

### 18.11 Treatment Data Driver Palsu atau Tidak Konsisten
- Jika data driver belum lengkap → `driverReadinessStatus = draft|declared`
- Jika data format valid tetapi janggal → `driverReadinessStatus = flagged`
- Jika data diduga palsu atau berulang mismatch berat → `driverReadinessStatus = blocked`
- `flagged` dan `blocked` tidak boleh publish presence sebagai driver
- Semua perubahan status ini wajib menulis audit event yang relevan agar operator bisa menelusuri keputusan

---

## 19. Desain Offline dan Recovery

### 19.1 Data yang Harus Tersedia Offline
- Profil lokal
- Pricing setting
- Draft order
- Active order detail
- Riwayat order lokal
- Audit lokal

### 19.2 Recovery Saat App Restart
```
On bootstrap:
  1. Load profile dari SQLite
  2. Load pricing dari SQLite
  3. Load active_order_id dari app_settings
  4. Jika ada active order → load order, tampilkan recovery banner
  5. Jika relay tersedia → sync status terkini
  6. Jika relay tidak tersedia → tampilkan last known state + indicator offline
  7. Render home sesuai role aktif
```

### 19.3 Offline Graceful Degradation
- App tetap bisa dibuka dan lihat riwayat lokal
- Discovery tidak tersedia saat offline (tampilkan state yang jelas, bukan blank atau crash)
- Active order detail tetap bisa dilihat offline
- Tombol maps/dialer/WhatsApp tetap berfungsi offline

### 19.3A Error dan Empty State Matrix
| Kondisi | UI State | CTA Minimum | Yang Tetap Bisa Dilakukan |
|---|---|---|---|
| Lokasi belum diizinkan | education / permission required | buka settings / izinkan lokasi | buka app, lihat history lokal |
| Relay tidak tersedia | mode terbatas / offline indicator | retry / pull to refresh | lihat home, history, active order lokal |
| Discovery kosong | empty nearby state | refresh / ubah service type | tetap buka booking review jika ada kandidat tersimpan |
| Driver readiness gagal | gate state | buka profile / pricing | tetap gunakan role customer |
| Tidak ada kandidat auto booking | no candidate state | lihat kandidat manual / ubah filter | tetap edit booking draft |
| Pricing invalid | form validation state | perbaiki input | tetap di screen pricing |
| Audit export gagal | export failed state | coba lagi | tetap kembali ke history/audit screen |
| External app tidak tersedia | handoff failed state | pilih fallback lain | tetap lanjut trip screen |

Rules:
- Empty state harus memakai copy yang membantu, bukan error generik
- Error state harus mempertahankan context yang masih valid di layar
- Jika recovery banner tersedia, CTA kembali ke active trip harus diprioritaskan di home

---

## 20. State Management UI

### 20.1 Global State Minimum
```ts
type RootState = {
  session: {
    bootstrapDone: boolean
    currentRole: AppRole | null
    isOnline: boolean
  }
  user: {
    profile: UserProfile | null
    pricing: PricingProfile | null
  }
  permission: {
    locationGranted: boolean
  }
  discovery: {
    items: PresenceSnapshot[]
    loading: boolean
    error: AppErrorCode | null
    lastUpdatedAt?: string
  }
  order: {
    activeOrder: Order | null
    syncing: boolean
    recoveryMode: boolean
  }
  communication: {
    contactRevealDone: boolean
    temporaryChatEnabled: boolean
  }
  history: {
    filter: 'all' | 'completed' | 'canceled'
    loading: boolean
  }
  transactionLog: {
    fromDate?: string
    toDate?: string
    loading: boolean
  }
  audit: {
    exportInProgress: boolean
    lastExportFilePath?: string
  }
  connectivity: {            // BARU
    relayConnected: boolean
  }
}
```

### 20.2 State Management Library
- **Zustand** atau **Redux Toolkit** — keduanya valid
- Hindari Context API murni untuk state yang sering update (performa)
- Discovery snapshot boleh di-cache lokal, tapi active order harus di-persist SQLite

### 20.3 UX Direction
- Warna lembut dan bersih
- Border minimal
- Shadow tipis
- Copy utama harus hangat, humble, dan sopan
- Reminder seperti "jangan lupa barang bawaan" dan "pastikan tidak ada yang tertinggal" diperlakukan sebagai bagian experience, bukan teks tambahan acak

### 20.3B Design System Boundary
- Token visual minimum:
  - background utama terang dan lembut
  - surface card sedikit terangkat dengan shadow tipis
  - border hanya dipakai bila memang membantu grouping
  - radius medium, tidak terlalu tajam dan tidak terlalu bulat
  - spacing lega untuk area sentuh mobile
- Prioritas visual:
  - CTA utama seperti `Booking`, `Accept`, `Go Online` boleh paling menonjol
  - status sekunder seperti filter, helper text, atau metadata harus tetap tenang
  - warna warning/error harus jelas tetapi tidak terasa alarmis
- Komponen inti yang harus konsisten:
  - app bar
  - role switch chip/entry
  - service selector
  - nearby/recommendation card
  - pricing breakdown rows
  - status badge
  - primary / secondary button
  - recovery banner
- Customer dan mitra harus terasa satu design system yang sama, hanya beda konteks dan prioritas informasi

### 20.3D MVP Screen Map
- Entry flow:
  - splash / bootstrap
  - onboarding
  - role selection
  - basic profile
  - pricing setup opsional untuk mitra
  - home sesuai role
- Customer flow:
  - customer home
  - booking form
  - order review
  - waiting response
  - active trip
  - post-trip feedback
  - history detail
- Mitra flow:
  - mitra home
  - pricing / profile correction bila belum ready
  - incoming order
  - active trip
  - history detail
- Support flow:
  - profile
  - pricing settings
  - transaction log
  - audit export

Rules:
- Active order selalu mengalahkan navigasi biasa; jika ada order non-terminal, recovery banner harus menjadi pintu kembali utama
- Customer dan mitra memakai screen map yang berbagi komponen inti, bukan dua subtree UI yang benar-benar terpisah

### 20.3C Copywriting dan Tone Matrix
| Screen / Context | Tone Utama | Tujuan Copy | Hindari |
|---|---|---|---|
| Onboarding | menyambut dan menenangkan | membuat user merasa aplikasi mudah dipakai | bahasa teknis, kesan verifikasi berat |
| Customer home | membantu dan ringan | bantu user memilih layanan atau mitra dengan tenang | memaksa booking, kalimat terlalu promosi |
| Mitra home | menghargai dan lugas | jelaskan kesiapan online, gate, dan demand sekitar | nada menghakimi saat readiness belum lolos |
| Incoming order | jelas dan cepat | bantu mitra ambil keputusan tanpa bingung | copy panik, alarmis, atau terlalu panjang |
| Active trip | tenang dan kontekstual | menjaga fokus user pada langkah berikutnya | notifikasi berlebihan, repetitif |
| Post-trip feedback | apresiatif | menutup perjalanan dengan hangat tanpa memaksa | guilt-trip untuk kasih rating |
| Empty state | suportif | memberi arah tindakan berikutnya | menyamakan empty state dengan error |
| Error state | jujur dan membantu | menjelaskan masalah dan CTA berikutnya | menyalahkan user atau istilah backend |

Rules:
- Copy tidak boleh terdengar seperti operator platform yang kaku
- Kalimat sebaiknya pendek, manusiawi, dan langsung bisa ditindaklanjuti
- Reminder keselamatan dan barang bawaan muncul kontekstual, bukan di setiap layar

### 20.3A Customer Home Contract
- Customer home adalah entry point utama setelah onboarding atau role switch ke `customer`
- Blok minimum yang harus tersedia:
  - greeting ringkas dan role switch entry
  - active trip/recovery banner bila ada order non-terminal
  - service type quick selector untuk `motor` atau `mobil`
  - women preference indicator bila aktif
  - top recommendation card bila kandidat tersedia
  - discovery list nearby mitra
  - CTA `auto booking` dan akses ke manual select
- Jika lokasi belum aktif, relay putus, atau discovery kosong, home harus tetap informatif dan tidak boleh tampil blank

### 20.3B Mitra Home Contract
- Mitra home adalah entry point utama setelah role switch ke `mitra`
- Blok minimum yang harus tersedia:
  - greeting ringkas dan role switch entry
  - active trip/recovery banner bila ada order non-terminal
  - readiness summary: identity status, driver readiness status, kendaraan aktif, pricing aktif
  - online/offline toggle
  - reason gate yang jelas bila toggle online ditolak
  - nearby demand list sederhana untuk customer aktif di sekitar
  - shortcut ke pricing settings atau profile bila readiness belum lolos
- Home mitra harus membuat status `siap online / belum siap online / sedang ada order aktif` terlihat jelas dalam satu layar

---

## 21. Kontrak Repository dan Gateway

### 21.1 Repositories
```ts
interface UserRepository {
  getProfile(): Promise<UserProfile | null>
  saveProfile(profile: UserProfile): Promise<void>
  updateCurrentRole(role: AppRole): Promise<void>
}

interface PricingRepository {
  getPricing(userId: string): Promise<PricingProfile | null>
  savePricing(data: PricingProfile): Promise<void>
}

interface OrderRepository {
  getActiveOrder(): Promise<Order | null>
  getOrderById(orderId: string): Promise<Order | null>
  saveOrder(order: Order): Promise<void>
  updateOrder(order: Order): Promise<void>
  clearActiveOrderPointer(): Promise<void>
  listHistory(filter?: OrderStatus): Promise<Order[]>
}

interface TransactionRepository {          // BARU
  recordTransaction(log: TransactionLog): Promise<void>
  listTransactions(period?: string): Promise<TransactionLog[]>
  exportToCsv(period: string): Promise<string>
}
```

### 21.2 Gateways
```ts
interface PresenceGateway {
  publish(snapshot: PresenceSnapshot): Promise<void>
  unpublish(userId: string, role: AppRole): Promise<void>
  discover(params: DiscoverParams): Promise<PresenceSnapshot[]>
  subscribe(role: AppRole, callback: (snapshots: PresenceSnapshot[]) => void): Unsubscribe
}

interface OrderSignalGateway {
  sendOrderRequest(payload: OrderRequestPayload): Promise<void>
  sendOrderResponse(orderId: string, response: 'accept' | 'reject'): Promise<void>
  sendContactReveal(payload: OrderContactRevealPayload): Promise<void>
  subscribeToIncomingOrders(userId: string, callback: (payload: OrderRequestPayload) => void): Unsubscribe
  subscribeToOrderResponse(orderId: string, callback: (payload: OrderResponsePayload) => void): Unsubscribe
  subscribeToContactReveal(orderId: string, callback: (payload: OrderContactRevealPayload) => void): Unsubscribe
  syncActiveOrder(orderId: string): Promise<OrderSyncState | null>
}

interface AuditGateway {
  append(event: AuditEvent): Promise<void>
  exportBundle(params: ExportParams): Promise<string>  // returns file path
}
```

---

## 22. Flow Implementasi Inti

### 22.1 Bootstrap App
```
1. Inisialisasi SQLite + run pending migrations
2. Load profile lokal
3. Load role aktif
4. Load pricing
5. Load active order (jika ada)
6. Check permission lokasi
7. Connect ke relay (Supabase)
8. Jika ada active order → tampilkan recovery state
9. Render home sesuai role
```

### 22.2 Go Online (Mitra)
```
1. Load profile lokal + pastikan `identityStatus = active`
2. Pastikan `deviceBindingId` tersedia di Secure Storage
3. Validasi pricing tidak kosong
4. Dapatkan lokasi terkini
5. Validasi koordinat (anti-abuse: range check)
6. Cek rate limit (anti-abuse: bukan < 10 detik dari publish terakhir)
7. Buat PresenceSnapshot
8. Publish ke relay (presence:mitra channel)
9. Update local state: isOnline = true
10. Tulis audit USER_WENT_ONLINE
11. Mulai refresh loop (setiap 20 detik)
```

### 22.3 Submit Order
```
1. Customer pilih `serviceType`
2. Customer isi pickup (GPS atau manual pin)
3. Customer isi destination
4. Form adaptif tampil sesuai `serviceType`
5. Customer pilih mode: `manual select` atau `auto booking`
6. Customer pilih `bookingIntent`: untuk diri sendiri atau untuk orang lain
7. Jika untuk orang lain, customer wajib isi rider name dan contact minimum
8. Customer pilih `paymentMethod`
9. Filter candidate set berdasarkan readiness, service type, capacity, preference, dan freshness
10. Hitung haversine distance
11. Hitung estimasi perjalanan
12. Hitung jarak mitra ke pickup dan biaya penjemputan tambahan jika > 3 km
13. Hitung gear discount / komponen quote lain yang relevan
14. Jika `gateway` aktif, hitung admin fee dan split customer/driver
15. Tampilkan breakdown total ke customer
16. Jika `manual`, customer pilih mitra dari candidate set
17. Jika `auto`, app meranking kandidat lalu memilih target terbaik secara lokal
18. Buat Order dengan status Draft
19. Tulis audit ORDER_DRAFT_CREATED
20. Customer review dan confirm
21. Update status ke Requested
22. Simpan lokal
23. Kirim OrderRequestPayload ke relay
24. Tulis audit ORDER_REQUESTED
25. Mulai timeout 60 detik di client
26. Jika `auto`, tampilkan progress attempt
27. Tampilkan state menunggu atau failure yang sesuai
```

### 22.4 Mitra Accept Order
```
1. Terima OrderRequestPayload via relay subscription
2. Validasi: payload tidak expired, partnerId cocok, mitra belum punya active order, breakdown harga konsisten
3. Tampilkan incoming order screen dengan countdown + booking context + breakdown biaya
4. Mitra tap Accept
5. Update order lokal ke status Accepted
6. Simpan lokal
7. Kirim OrderResponsePayload ke relay (accept)
8. Lakukan contact reveal bertarget ke pasangan order
9. Jika contact reveal sukses, aktifkan call/chat handoff yang relevan
10. Tulis audit ORDER_ACCEPTED dan CONTACT_REVEALED
11. Navigasi ke active trip screen
```

### 22.4A Mitra Reject Order
```
1. Terima OrderRequestPayload via relay subscription
2. Validasi dasar payload dan state lokal
3. Tampilkan incoming order screen dengan countdown
4. Mitra tap Reject atau timer habis
5. Tentukan responseReasonCode
6. Update order lokal ke status Rejected atau Expired
7. Simpan lokal
8. Kirim OrderResponsePayload ke relay (reject + reason)
9. Tulis audit ORDER_REJECTED atau ORDER_EXPIRED
10. Jika bookingMode=manual, customer kembali pilih mitra
11. Jika bookingMode=auto, customer boleh lanjut ke kandidat berikutnya secara berurutan
```

### 22.4B Active Trip Lifecycle
```
1. Order sudah Accepted
2. Driver mulai bergerak ke pickup → status OnTheWay
3. Saat driver menekan "Saya Sampai", simpan milestone arrivedAtPickupAt
4. Mulai waiting timer 5 menit gratis
5. Jika customer belum naik setelah grace period, tambahkan waitingChargeAmount per kelipatan 5 menit
6. Jika driver tidak bergerak material dari titik awal > 5 menit setelah Accepted, tambahkan driverDelayDeductionAmount secara simetris
7. Saat customer naik, transition ke OnTrip
8. Freeze kalkulasi fairness aktif; trip berjalan ke destination
9. Saat selesai, transition ke Completed dan simpan breakdown final
```

Rules:
- `Arrived at Pickup` adalah milestone aktif, bukan status order baru
- `waitingChargeAmount` dan `driverDelayDeductionAmount` tidak boleh aktif pada interval yang sama
- Cancel/no-show/mismatch masih sah sebelum `OnTrip`

### 22.4C Active Trip Screen Contract
- Sisi mitra dan customer sama-sama harus melihat:
  - nama pihak lawan
  - `serviceType`
  - `paymentMethod`
  - status order utama
  - milestone aktif
- Sisi mitra perlu action:
  - `Berangkat ke Pickup`
  - `Saya Sampai`
  - `Customer Naik / Mulai Trip`
  - `Selesaikan`
- Sisi customer perlu melihat:
  - indikator driver menuju pickup
  - indikator driver sudah sampai
  - waiting timer jika aktif
  - breakdown trip aktif yang terus diperbarui
- Breakdown aktif minimum:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `waitingChargeAmount`
  - `driverDelayDeductionAmount`
  - `gearDiscountAmount`
  - `estimatedPrice`
- Cancel sheet sebelum `OnTrip` harus menyediakan reason:
  - `user_changed_mind`
  - `no_show`
  - `identity_mismatch`
  - `undeclared_rider`
  - `contact_mismatch`
  - `unsafe_or_suspicious`
  - `pickup_mismatch`
  - `other`

Rules:
- `no_show` hanya boleh aktif setelah `Arrived at Pickup`
- `user_changed_mind` tidak boleh memicu punishment otomatis
- `identity_mismatch`, `undeclared_rider`, `contact_mismatch`, `unsafe_or_suspicious` harus memicu audit mismatch/report path

### 22.5 Complete Order
```
1. User (customer atau mitra) tap Selesaikan
2. Konfirmasi dialog
3. Transition order ke Completed
4. Simpan lokal
5. Tulis audit ORDER_COMPLETED
6. Buat TransactionLog entry
7. Tulis audit TRANSACTION_RECORDED
8. Clear active order pointer
9. Masuk ke history
```

---

## 23. Kalkulasi Jarak

### MVP: Haversine Formula
```ts
function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371  // radius bumi km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat/2)**2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
    * Math.sin(dLng/2)**2
  return R * 2 * Math.asin(Math.sqrt(a))
}
```

**Catatan:** Ini jarak garis lurus, bukan jarak rute jalan. Selisih rata-rata 20-40% dari jarak aktual. Label "estimasi" **wajib** tampil di semua kalkulasi berbasis ini.

---

## 24. Testing Strategy

### 24.1 Unit Tests (Wajib)
- `haversineDistanceKm()` — berbagai koordinat
- `calculateEstimatedPrice()` — edge cases
- `transitionOrder()` — semua valid dan invalid transitions
- `AuditSerializer` — encode/decode round-trip
- Pricing validators — boundary conditions
- Anti-abuse validators — valid dan violation cases
- `calculateCommission()` — beberapa nilai

### 24.2 Integration Tests
- SQLite migration: schema v1 → v2
- UserRepository: save/load/update
- OrderRepository: save, update, load active
- AuditGateway: append + manifest + export bundle
- TransactionRepository: record + list + export CSV

### 24.3 End-to-End Tests (Manual + Automated)
- Onboarding → role selection → home
- Toggle online/offline
- Discovery render mitra/customer
- Create order → accept → complete
- External handoff: maps, dialer, WhatsApp
- App kill saat active order → restart → recovery
- Audit export flow

---

## 25. Risiko Teknis dan Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Supabase down → discovery tidak bisa | Empty state jelas, retry dengan backoff, tidak crash |
| Sinkronisasi order ganda | Idempotent order save, single active order rule |
| Audit file corrupt | CRC32 check, temp+rename, manifest terpisah |
| Background location limit iOS/Android | Fokus foreground-active untuk MVP, tidak bergantung background streaming |
| Device storage penuh | Rotation audit 6 bulan, peringatan storage di settings |
| Spoofing dan fake location | Velocity check + coordinate range check (wajib MVP) |
| Supabase free tier limit terlewati | Monitor usage, upgrade tier atau migrasi ke self-hosted sebelum limit |

---

## 26. Build dan Environment

### 26.1 Environments
- `dev` — relay ke Supabase project dev, verbose logging
- `staging` — relay ke Supabase project staging, reduced logging
- `prod` — relay ke Supabase project prod, sanitized logging, obfuscation

### 26.2 Feature Flags
```
relay_enabled                  ← default true prod, bisa false untuk pure local testing
audit_export_enabled           ← default true
device_auth_guard_enabled      ← default false, aktifkan jika biometrics reliable
maps_handoff_enabled           ← default true
dialer_handoff_enabled         ← default true
whatsapp_handoff_enabled       ← default true
transaction_log_enabled        ← default true
anti_abuse_enabled             ← default true, TIDAK BOLEH false di prod
```

---

## 27. Rencana Evolusi Arsitektur

### Fase 1 — MVP (sekarang)
- Local-first + relay Supabase + audit lokal + external handoff + transaction log manual
- Flow inti: onboarding, home, booking, incoming order, active trip, history, profile, pricing

### Fase 2 — Stabilization
- Anti-spoofing lebih sophisticated (server-side validation)
- Completion rate tracking per mitra
- Review aggregation yang lebih konsisten lintas device
- Export/import audit lebih aman
- Sync recovery lebih robust
- Firebase FCM rollout penuh bila notice background benar-benar dibutuhkan
- Waiting fairness automation
- Multi-vehicle profile
- Women preference toggle

### Fase 3 — Expansion
- Payment integration (QRIS settlement)
- Komisi auto-deduction
- Admin dashboard sederhana untuk operator
- Optional cloud backup user-owned
- Model operator/franchise daerah
- Custom relay (self-hosted, bukan Supabase)

### 27.1 Scope Lock Teknis
| Area | Status | Rule Implementasi |
|---|---|---|
| Core order lifecycle | MVP Pilot | wajib stabil, tidak boleh tergantung fitur flag opsional |
| Profile, pricing, driver readiness | MVP Pilot | wajib jalan offline-first |
| Audit, history, transaction log | MVP Pilot | source of truth lokal |
| Firebase FCM | Pilot Optional | hanya notice layer, tidak boleh jadi source of truth |
| Temporary chat | Pilot Optional | default off sampai TTL/cleanup siap |
| Women preference | Pilot Optional | hanya jika supply dan UX siap |
| Bajaj | Phase 2 | jangan mempersulit service matrix pilot |
| Background tracking + SOS | Phase 2 | hanya setelah battery/routing clear |
| Payment gateway | Phase 2+ | tidak boleh memblok pilot |
| Angkot fixed route | Phase 2+ | flow terpisah dari personal ride |

Rules:
- Fitur `Pilot Optional` harus berada di balik feature flag
- Fitur `Phase 2+` tidak boleh menambah cabang logic wajib pada flow pilot
- Jika ada konflik prioritas, core order lifecycle selalu menang atas fitur opsional
- Temporary live chat berbasis Firebase
- SOS dan active-order background safety mode
- Driver recommendation berbasis value score yang lebih matang

---

## 28. Sprint Breakdown

### Sprint 1 — Fondasi (1-2 minggu)
- Bootstrap app, navigation setup
- SQLite + migrations
- UserRepository, PricingRepository
- Onboarding screens
- Role selection dan switch
- Permission lokasi
- Basic profile screen

### Sprint 2 — Presence & Discovery (1-2 minggu)
- Supabase Realtime integration
- PresenceGateway implementation
- Online/offline toggle + anti-abuse validation
- Home customer: nearby mitra list
- Home mitra: customer list + online toggle
- Pricing settings screen
- Estimasi jarak (haversine)

### Sprint 3 — Order Core (1-2 minggu)
- Booking form (pickup, destination, mitra selection)
- Order review screen
- Submit order + relay signaling
- Incoming order screen (mitra) + countdown
- Accept/reject + response signaling
- Active trip screen
- Order state machine implementation

### Sprint 4 — Audit, Handoff, Monetisasi, Hardening (1-2 minggu)
- Audit binary writer + manifest
- External handoff (maps, dialer, WhatsApp)
- Transaction log recording
- Recovery flow
- Audit export screen
- Riwayat order
- QA + bug fixes
- Error handling dan empty states

### 28.1 Build Order Final
| Sprint | Fokus | Exit Criteria |
|---|---|---|
| 1 | fondasi app, onboarding, profile, pricing, readiness | user bisa onboarding, switch role, simpan profile/pricing, dan gate driver tampil benar |
| 2 | presence, discovery, home screens | mitra bisa online, discovery muncul, home customer/mitra stabil, state empty/error jelas |
| 3 | booking, incoming order, active trip, cancel flow | order bisa berjalan end-to-end dari draft sampai terminal dengan fairness dan mismatch handling |
| 4 | history, audit, transaction log, export, hardening | history/audit/log bisa ditelusuri, export jalan, recovery/error state rapi |

Rules:
- Sprint berikutnya tidak boleh mengambil fitur `Pilot Optional` sebelum exit criteria sprint sebelumnya tercapai
- Jika ada dev capacity sisa, gunakan untuk hardening flow inti lebih dulu, bukan membuka phase 2

---

## 29. Ringkasan Keputusan Teknis

Carrier App Project dibangun sebagai **single cross-platform mobile app** dengan:

- **React Native + TypeScript** sebagai stack utama
- **SQLite** sebagai local persistence utama
- **Supabase Realtime** sebagai thin coordination relay
- **Firebase FCM** untuk push notification dan boundary jelas untuk temporary communication
- **MessagePack** sebagai format audit compact
- **Anti-abuse validation** sebagai komponen wajib MVP (bukan phase 2)
- **Transaction log** sebagai fondasi monetisasi
- **External handoff** untuk maps, call, dan chat

Arsitektur ini menjaga prinsip local-first tanpa jatuh ke zero-server yang rapuh, dan menyediakan path yang jelas untuk scale ke fase berikutnya.

Model yang dipilih adalah **local-first + thin relay**, bukan backend-heavy tradisional dan bukan pure peer-to-peer tanpa server.

---

*Versi: 1.0 | CEO-reviewed | Approved for engineering execution*
