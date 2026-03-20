# Carrier Architecture Decision Pack

**Versi:** 1.0  
**Status:** Active baseline  
**Scope:** React Native implementation baseline, code boundaries, state/data rules, and security posture for MVP

---

## Tujuan

Dokumen ini merangkum keputusan arsitektur yang **harus dianggap default** saat implementasi dimulai. Tujuannya bukan menggantikan SDD/TSD, tetapi mengunci keputusan yang paling memengaruhi efisiensi delivery, biaya maintenance, dan posture keamanan.

Prinsip penggunaan:
- Jika ada konflik kecil, **TSD menang untuk detail teknis** dan dokumen ini menang untuk baseline/arahan implementasi.
- Jika ada deviasi besar dari dokumen ini, buat ADR baru atau update dokumen ini terlebih dahulu.

---

## ADR-001 — Runtime Baseline

**Status:** Accepted

### Decision
- Gunakan **React Native 0.84**
- Gunakan **React 19.2**
- Gunakan **Node.js 22.11+ LTS**
- Gunakan **Hermes V1** sebagai JavaScript engine default
- Gunakan **New Architecture** sejak awal, bukan migrasi belakangan

### Why
- Mengurangi biaya migrasi teknis setelah fondasi berjalan
- Menjaga kompatibilitas dengan arah resmi React Native terbaru
- Membatasi pilihan package ke yang benar-benar sehat untuk jangka menengah

### Consequences
- Semua dependency native wajib dievaluasi terhadap kompatibilitas New Architecture
- Library yang hanya nyaman di bridge legacy tidak boleh jadi fondasi utama

---

## ADR-002 — Codebase Boundary

**Status:** Accepted

### Decision
Struktur implementasi dibagi ke boundary berikut:
- `ui/primitives` untuk tiny reusable components tanpa business knowledge
- `ui/patterns` untuk reusable composites lintas feature
- `features/*` untuk flow dan komposisi UI per fitur
- `application/*` untuk use case orchestration
- `domain/*` untuk entities, policies, value objects, dan state machine
- `data/*` untuk database, storage, gateway, relay, dan mapper

### Why
- Menjaga screen tetap tipis
- Mencegah duplikasi komponen customer vs mitra
- Mengurangi coupling antara UI, storage, dan network

### Consequences
- Screen/container tidak boleh mengakses SQLite, secure storage, atau relay client secara langsung
- Komponen di `ui/primitives` dan `ui/patterns` tidak boleh tahu detail store, query, atau gateway

---

## ADR-003 — TypeScript Contract First

**Status:** Accepted

### Decision
- Gunakan `@react-native/typescript-config` sebagai baseline
- Aktifkan mode TypeScript ketat sebagai default repo
- Gunakan `customConditions: ["react-native-strict-api"]`
- Larang import dari `react-native/Libraries/*`
- Gunakan branded types untuk identifier penting seperti `UserId`, `OrderId`, `DeviceBindingId`
- Gunakan discriminated union untuk state machine penting: order, discovery, bootstrap, recovery

### Why
- Mengurangi bug boundary dan bug state transition
- Membuat refactor lebih aman saat codebase mulai besar
- Menghindari ketergantungan ke API internal React Native yang tidak stabil

### Consequences
- DTO dan payload boundary harus eksplisit, bukan object bebas
- `string` mentah tidak boleh menjadi pengganti semua identifier domain

---

## ADR-004 — State Minimal, Domain Strong

**Status:** Accepted

### Decision
- State global dipakai hanya untuk proyeksi UI, session, dan recovery surface yang memang perlu reaktif
- Business rules tetap hidup di `domain` dan `application`, bukan di store
- Store tidak menjadi source of truth utama untuk histori order, audit, atau data identitas

### Why
- Mengurangi race condition dan state drift
- Membuat bootstrap dan recovery lebih mudah dipahami
- Menjaga local-first storage tetap menjadi sumber data utama

### Consequences
- Zustand boleh dipakai, tetapi tetap tipis
- Repository + use case menjadi jalur utama mutasi data

---

## ADR-005 — Local-First Storage Security

**Status:** Accepted

### Decision
- Secret kecil disimpan di Keychain/Keystore
- Data trip sensitif di SQLite **wajib terenkripsi at rest**
- Audit file tetap append-only dan punya checksum/integrity marker
- Raw phone number tidak masuk SQLite
- Logging aplikasi wajib dimasking untuk phone, location, dan identity-sensitive fields

### Why
- Model local-first memindahkan risiko ke device; storage hygiene tidak boleh opsional
- Data pickup, destination, dan riwayat trip cukup sensitif untuk dianggap protected by default

### Consequences
- Enkripsi storage bukan hardening phase-2; ini baseline
- Data minimization dan retention policy harus ditetapkan sebelum feature bertambah

---

## ADR-006 — Network Security Posture

**Status:** Accepted

### Decision
- iOS release wajib menjaga **App Transport Security** aktif
- Android release wajib memakai **Network Security Config** dengan cleartext nonaktif
- Payload relay harus lolos validation, expiry check, dan policy check sebelum boleh mengubah state lokal
- External handoff hanya boleh ke scheme/domain allowlist
- Certificate pinning diperlakukan sebagai hardening selektif untuk endpoint yang benar-benar dikendalikan tim

### Why
- Carrier punya jalur eksternal dan relay; network boundary harus jelas sejak awal
- Tidak semua network call layak diperlakukan sama antara handoff publik dan endpoint inti produk

### Consequences
- URL bebas dari user tidak boleh dibuka langsung
- Event invalid dari relay tetap masuk audit, tetapi tidak boleh mengubah state bisnis

---

## ADR-007 — Dependency Discipline

**Status:** Accepted

### Decision
- Default sikap repo adalah **sedikit dependency, terutama dependency native**
- Tambahan library baru harus menjawab tiga pertanyaan:
  1. Apakah ini mengurangi kode internal yang berisiko?
  2. Apakah ini kompatibel dengan New Architecture?
  3. Apakah ini mengurangi, bukan menambah, attack surface dan maintenance burden?

### Why
- Dependency native yang salah akan membuat upgrade RN, debugging, dan security review jauh lebih mahal

### Consequences
- Utility kecil lebih baik ditulis internal daripada menarik package yang tidak jelas maintenance-nya
- Library yang menambah native surface area tanpa manfaat besar harus ditolak

---

## ADR-008 — Recovery Before Polish

**Status:** Accepted

### Decision
Flow yang harus dianggap core sejak sprint awal:
- bootstrap recovery
- reconnect handling
- duplicate event handling
- stale state cleanup
- idempotent order transition

### Why
- App ini bukan sekadar online CRUD; local-first + relay berarti kegagalan sinkronisasi adalah kondisi normal, bukan edge case

### Consequences
- Happy path UI tidak boleh selesai lebih dulu tanpa recovery path yang sepadan
- Empty state, degraded state, dan retry state adalah bagian arsitektur, bukan copy belakangan

---

## ADR-009 — Observability Boundary

**Status:** Accepted

### Decision
- Pisahkan debug log dari audit log
- Error memakai code yang stabil dan bisa dipetakan ke UX copy
- Audit adalah artefak investigasi dan dispute, bukan debug console

### Why
- Kebutuhan operasional Carrier menuntut jejak yang bisa dipakai manusia tanpa membocorkan data sensitif

### Consequences
- Verbose logging tidak boleh aktif di production
- Event taxonomy harus stabil sebelum sprint implementasi besar berjalan

---

## Non-Goals

Hal-hal berikut **bukan** target keputusan arsitektur tahap ini:
- mengganti relay utama dari Supabase
- menambah payment gateway penuh di MVP
- menambah in-app chat permanen
- menambah microservices atau backend-heavy stack

---

## Checklist Adopsi

Sebelum scaffold implementasi dimulai, tim harus sepakat atas poin berikut:
- Runtime baseline RN/React/Node/Hermes/New Architecture terkunci
- Boundary folder `ui`, `features`, `application`, `domain`, `data` disetujui
- Aturan TypeScript ketat dan larangan deep import RN disetujui
- Enkripsi SQLite untuk data trip dianggap mandatory
- Network posture release untuk iOS/Android dianggap mandatory

---

## Langkah Setelah Dokumen Ini

Urutan kerja yang direkomendasikan:
1. Turunkan dokumen ini menjadi folder blueprint final
2. Tentukan dependency allowlist / denylist
3. Scaffold project React Native sesuai baseline ini
4. Baru mulai implementasi fitur fondasi
