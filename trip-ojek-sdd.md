# SDD — Software Design Document
## TRIP Local-First Ride Coordination Platform

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CTO / Engineering Direction
**Project:** TRIP
**Document Type:** Software Design Document (SDD)
**Status:** Approved for engineering execution
**Source Reference:** PRD — TRIP v1.0

---

## Catatan CEO

> SDD versi awal secara teknis solid. Revisi ini menambahkan hal-hal yang hilang: desain anti-abuse yang lebih eksplisit, transaction log component untuk monetisasi, relay technology decision yang lebih konkret, dan klarifikasi bahwa beberapa komponen yang sebelumnya "opsional" sekarang menjadi wajib di MVP.
>
> Satu prinsip yang saya tekankan: **arsitektur yang baik harus bisa dijelaskan ke investor dalam 5 menit, dan diimplementasikan oleh engineer baru dalam 2 minggu.** Jika terlalu kompleks untuk salah satunya, simplify.

---

## 1. Ringkasan

Dokumen ini menjabarkan desain perangkat lunak untuk **TRIP** — aplikasi mobile cross-platform, **satu aplikasi untuk dua peran** (customer dan mitra), dengan pendekatan **local-first, low-backend, tanpa third-party berbayar di fase awal**.

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

### 4.4 Audit Format
- **MessagePack** untuk serialisasi compact
- File binary per event + manifest SQLite lokal
- Export bundle `.tripaudit` (ZIP berisi manifest + event files)

### 4.5 Sikap Teknis yang Tegas
- Tidak ada zero-server absolut — relay tipis wajib ada untuk discovery dan signaling
- Tidak ada backend berat — tidak ada dispatch server, routing engine, atau analytics kompleks
- Tidak ada histori lokasi penuh di server

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
  phoneNumber?: string
  activeRoles: AppRole[]
  currentRole: AppRole
  deviceAuthEnabled: boolean
  createdAt: string            // ISO 8601
  updatedAt: string
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
  customerId: string
  partnerId: string
  estimatedPrice: number
  pricePerKm: number
  distanceKm: number
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
  phone_number TEXT,
  current_role TEXT NOT NULL,
  active_roles TEXT NOT NULL,  -- JSON array
  device_auth_enabled INTEGER DEFAULT 0,
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
  customer_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  pickup_json TEXT NOT NULL,
  destination_json TEXT NOT NULL,
  distance_estimate_km REAL NOT NULL,
  price_per_km_applied REAL NOT NULL,
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

### 15.2 Payload
```ts
// Request dari customer ke mitra
type OrderRequestPayload = {
  orderId: string
  customerId: string
  customerDisplayName: string
  partnerId: string
  pickup: LocationPoint
  destination: LocationPoint
  distanceEstimateKm: number
  pricePerKmApplied: number
  estimatedPrice: number
  expiresAt: string           // createdAt + 60 detik
  createdAt: string
}

// Response dari mitra ke customer
type OrderResponsePayload = {
  orderId: string
  partnerId: string
  response: 'accept' | 'reject'
  respondedAt: string
}
```

### 15.3 Aturan Signaling
- Mitra hanya bisa punya 1 active order
- Customer hanya bisa punya 1 active order
- Payload dengan `expiresAt` sudah lewat wajib ditolak
- Order aktif selalu di-persist lokal (tidak hanya di memory)

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

function calculateCommission(estimatedPrice: number): number {
  return Math.round(estimatedPrice * COMMISSION_RATE)
}
```

### 17.3 Rekap Manual (MVP)
- Transaction log tersimpan di SQLite lokal (di device operator / admin)
- Export ke CSV untuk rekap manual di fase awal
- Komisi dipungut offline oleh operator — tidak ada auto-deduction di MVP

> **Catatan CEO:** Ini memang manual dan tidak scalable jangka panjang. Tapi ini cukup untuk validasi dan mulai membangun data transaksi nyata sebelum investasi ke payment integration.

---

## 18. Desain Keamanan

### 18.1 Data Classification

| Kategori | Data | Penyimpanan |
|----------|------|-------------|
| Sangat sensitif | Nomor telepon, device binding key | Secure Storage (Keychain/Keystore) |
| Sensitif | Order history, pickup/destination, tarif | SQLite (encrypted at rest jika memungkinkan) |
| Internal | Audit payload | File binary + checksum |
| Rendah | Role aktif, UI preference | SQLite atau AsyncStorage |

### 18.2 Kontrol Keamanan MVP
- Secure Storage untuk secret kecil
- Audit export ter-guard oleh biometrics/PIN
- Checksum CRC32 pada setiap audit event file
- Log aplikasi tidak boleh menulis nomor telepon atau koordinat mentah secara penuh
- Build production wajib code obfuscation (Hermes / ProGuard)

### 18.3 Anti-Abuse (Wajib di MVP)
Lihat bagian 14.4 untuk validasi presence. Tambahan:
- Reject order payload dengan timestamp > 5 menit dari now
- Rate limit order submit: maks 1 order baru per 30 detik per user
- Log `ANTI_ABUSE_VIOLATION` ke audit setiap kali ada pelanggaran yang terdeteksi

### 18.4 Catatan Realitas
Local-first architecture berarti data ada di device user. Device compromise (jailbreak/root) tidak bisa dicegah sepenuhnya. Fokus MVP adalah:
- Mengurangi data yang disimpan
- Menambah friction akses
- Menyediakan audit trail untuk dispute resolution

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
  audit: {
    exportInProgress: boolean
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
  subscribeToIncomingOrders(userId: string, callback: (payload: OrderRequestPayload) => void): Unsubscribe
  subscribeToOrderResponse(orderId: string, callback: (payload: OrderResponsePayload) => void): Unsubscribe
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
1. Validasi pricing tidak kosong
2. Dapatkan lokasi terkini
3. Validasi koordinat (anti-abuse: range check)
4. Cek rate limit (anti-abuse: bukan < 10 detik dari publish terakhir)
5. Buat PresenceSnapshot
6. Publish ke relay (presence:mitra channel)
7. Update local state: isOnline = true
8. Tulis audit USER_WENT_ONLINE
9. Mulai refresh loop (setiap 20 detik)
```

### 22.3 Submit Order
```
1. Customer isi pickup (GPS atau manual pin)
2. Customer isi destination
3. Hitung haversine distance
4. Hitung estimasi harga (resolveAppliedPrice × distance)
5. Customer pilih mitra dari discovery list
6. Buat Order dengan status Draft
7. Tulis audit ORDER_DRAFT_CREATED
8. Customer review dan confirm
9. Update status ke Requested
10. Simpan lokal
11. Kirim OrderRequestPayload ke relay
12. Tulis audit ORDER_REQUESTED
13. Mulai timeout 60 detik di client
14. Tampilkan "Menunggu konfirmasi mitra"
```

### 22.4 Mitra Accept Order
```
1. Terima OrderRequestPayload via relay subscription
2. Validasi: payload tidak expired, mitra belum punya active order
3. Tampilkan incoming order screen dengan countdown
4. Mitra tap Accept
5. Update order lokal ke status Accepted
6. Simpan lokal
7. Kirim OrderResponsePayload ke relay (accept)
8. Tulis audit ORDER_ACCEPTED
9. Navigasi ke active trip screen
```

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

### Fase 2 — Stabilization
- Anti-spoofing lebih sophisticated (server-side validation)
- Completion rate tracking per mitra
- Rating sederhana (1-5 bintang, lokal dulu)
- Export/import audit lebih aman
- Sync recovery lebih robust

### Fase 3 — Expansion
- Payment integration (QRIS settlement)
- Komisi auto-deduction
- Admin dashboard sederhana untuk operator
- Optional cloud backup user-owned
- Model operator/franchise daerah
- Custom relay (self-hosted, bukan Supabase)

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

---

## 29. Ringkasan Keputusan Teknis

TRIP dibangun sebagai **single cross-platform mobile app** dengan:

- **React Native + TypeScript** sebagai stack utama
- **SQLite** sebagai local persistence utama
- **Supabase Realtime** sebagai thin coordination relay
- **MessagePack** sebagai format audit compact
- **Anti-abuse validation** sebagai komponen wajib MVP (bukan phase 2)
- **Transaction log** sebagai fondasi monetisasi
- **External handoff** untuk maps, call, dan chat

Arsitektur ini menjaga prinsip local-first tanpa jatuh ke zero-server yang rapuh, dan menyediakan path yang jelas untuk scale ke fase berikutnya.

---

*Versi: 1.0 | CEO-reviewed | Approved for engineering execution*
