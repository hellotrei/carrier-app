# PRD — TRIP Local-First Ride Coordination Platform

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CEO / Product Direction
**Project:** TRIP
**Document Type:** Product Requirements Document (PRD)
**Source Reference:** BRD — TRIP v1.0
**Status:** Approved for design and engineering execution

---

## Catatan CEO

> PRD versi awal sudah menangkap core flow dengan cukup baik. Versi ini memperkuat beberapa area yang lemah: definisi persona lebih tajam, acceptance criteria lebih bisa diuji, penambahan fitur trust/safety minimal yang wajib ada di MVP, dan monetisasi tracking yang hilang sama sekali di versi sebelumnya.
>
> Satu hal yang saya tekankan kepada tim: **jangan build fitur yang tidak ada dalam scope MVP ini hanya karena terasa "keren" atau "lengkap"**. Setiap tambahan fitur di MVP adalah beban development, testing, dan maintenance. Kita validasi dulu, baru build lebih.

---

## 1. Ringkasan Produk

TRIP adalah aplikasi mobile cross-platform — **satu aplikasi untuk dua peran**: **customer** (penumpang) dan **mitra** (pengemudi ojek). Produk ini dirancang dengan pendekatan **local-first**, **low-backend**, dan **biaya operasional minimal**.

**Nilai inti yang TRIP janjikan:**

- **Customer:** Temukan mitra di sekitar dengan cepat. Harga jelas sebelum pesan. Koordinasi mudah via WhatsApp/telepon langsung.
- **Mitra:** Atur tarif sendiri. Pilih order yang cocok. Tidak ada sistem penalti algoritmik yang tidak transparan.
- **Operator:** Jalankan platform dengan biaya infrastruktur minimal. Audit trail tersedia tanpa server besar.

---

## 2. Latar Belakang

Platform ride-hailing tradisional tidak layak ditiru dari awal karena membawa overhead yang tidak proporsional untuk operator baru:
- Real-time dispatch server
- Routing engine
- Fraud prevention ML
- Support operation
- Compliance reporting
- Third-party API berbayar

TRIP mengambil pendekatan yang lebih realistis: **ride coordination**, bukan **ride-hailing**. Perbedaannya fundamental:
- Ride-hailing: platform yang mengalokasikan driver secara otomatis
- Ride coordination: platform yang mempertemukan supply dan demand, lalu memberikan kontrol kepada kedua pihak

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis
- Launch MVP dalam 3-4 sprint (6-8 minggu development)
- Validasi product-market fit di 1 area pilot
- Capai 1.000 trip selesai dalam 3 bulan pertama
- Biaya infrastruktur MVP < Rp 3 juta/bulan

### 3.2 Tujuan Pengguna
- Customer menemukan mitra online dalam < 60 detik dari buka app
- Customer melihat estimasi harga sebelum order dikirim
- Mitra bisa atur tarif dan aktif online dalam < 2 menit pertama
- Kedua pihak bisa terhubung tanpa keluar dari ekosistem yang sudah familiar (WhatsApp, Google Maps)

### 3.3 Tujuan Teknis
- Satu codebase: Android dan iOS
- Local storage sebagai source of truth
- Tidak simpan histori lokasi penuh di server
- Relay server ringan yang cost-efficient
- Usable di kondisi koneksi 3G dan perangkat mid-range

---

## 4. Persona Utama

### 4.1 Customer: "Budi, 28 tahun, Kota Menengah"

**Latar belakang:**
Tinggal di kota kabupaten. Punya smartphone Android, pakai WhatsApp setiap hari. Kadang-kadang butuh ojek untuk pergi ke pasar atau kantor, tapi supply Gojek/Grab di areanya sering tidak ada.

**Perilaku saat ini:**
Kalau butuh ojek, cari lewat grup WhatsApp komunitas atau ke pangkalan ojek terdekat. Sering tidak pasti harga dan harus tawar-menawar.

**Yang diinginkan dari TRIP:**
- Lihat siapa ojek yang tersedia sekarang di dekatnya
- Tahu harga sebelum pesan — tidak perlu tawar-menawar
- Bisa langsung WhatsApp driver kalau butuh konfirmasi
- Tidak perlu buat akun rumit

**Frustasi yang dihindari:**
- "Gak ada driver tersedia" padahal ada ojek di sekitar
- Harga berubah-ubah tidak jelas
- Harus download banyak app

### 4.2 Mitra: "Pak Slamet, 35 tahun, Ojek Semi-Aktif"

**Latar belakang:**
Pengemudi ojek yang sudah daftar di Gojek tapi jarang online karena area dia kurang ramai. Kadang ikut ojek pangkalan. Punya Android, familiar dengan WhatsApp dan Google Maps.

**Perilaku saat ini:**
Mangkal di depan minimarket, dapat order dari kenalan, atau sesekali online di Gojek kalau lagi perlu.

**Yang diinginkan dari TRIP:**
- Bisa lihat ada customer yang cari ojek di dekatnya
- Tarif yang dia set sendiri, bukan dikontrol platform
- Tidak ada ancaman penalti atau suspen tiba-tiba
- Prosesnya simpel — tidak perlu belajar dashboard baru

**Frustasi yang dihindari:**
- "Saldo saya dipotong tanpa penjelasan jelas"
- Order yang jauh dan tidak sepadan
- Harus selalu online untuk dapat order bagus

### 4.3 Internal Product/Engineering: "Tim Developer TRIP"

**Yang dibutuhkan:**
- Scope yang jelas dan tidak berubah-ubah di tengah sprint
- State machine yang terdefinisi dengan baik
- Acceptance criteria yang bisa ditest
- Tahu persis mana yang MVP dan mana yang phase 2

---

## 5. Prinsip Produk

1. **Single App, Dual Role** — satu binary, dua cara pakai
2. **Local-First** — data milik user ada di device user
3. **Transparent Pricing** — harga tidak boleh jadi surprise
4. **Trust Through Simplicity** — semakin sederhana alurnya, semakin mudah dipercaya
5. **Mitra Has Agency** — mitra bukan aset yang dialokasikan, tapi partner yang memilih
6. **Build for Field Conditions** — 3G, mid-range device, baterai rendah
7. **Audit by Default** — setiap aksi penting harus tercatat

---

## 6. Scope MVP

### 6.1 In Scope — MVP

#### Identitas & Role
- Satu aplikasi untuk customer dan mitra
- Role selection saat onboarding (pilih utama, bisa aktifkan keduanya)
- Role switching dari dalam app tanpa logout
- Profil dasar: nama tampilan, nomor telepon, role aktif
- Semua data profil tersimpan lokal

#### Presence & Discovery
- Request izin lokasi (foreground)
- Toggle online/offline
- Daftar/peta pengguna opposite-role yang online di sekitar
- Filter berdasarkan radius (default: 3km)
- Tampilkan tarif/km mitra dan estimasi harga berdasarkan jarak ke destination

#### Pricing
- Mitra: set tarif dasar per-km (min: Rp 2.000/km, max: Rp 8.000/km)
- Customer: set tarif offer per-km (opsional — default ikut tarif mitra yang dipilih)
- Estimasi harga tampil sebelum order dikirim (haversine × tarif)
- Label "estimasi" wajib tampil — bukan harga final

#### Booking
- Customer isi pickup point (GPS atau manual pin)
- Customer isi destination
- Customer pilih mitra dari list
- Preview order dengan estimasi harga
- Customer kirim order request
- Mitra terima notifikasi order (foreground)
- Mitra accept atau reject dalam 60 detik (auto-expire jika tidak ada respons)
- Status order: Draft → Requested → Accepted → OnTheWay → OnTrip → Completed / Canceled

#### Communication & Navigation (External Handoff)
- Tombol "Buka Maps" → buka Google Maps / maps default dengan koordinat destination
- Tombol "Telepon" → buka dialer native dengan nomor pihak lain
- Tombol "WhatsApp" → buka WhatsApp chat dengan nomor pihak lain (jika tersedia)
- Fallback: jika WhatsApp tidak tersedia, tampilkan pesan jelas + fallback ke dialer

#### Transaction Tracking (Monetisasi Dasar)
- Setiap order completed mencatat: nilai estimasi trip, tarif yang digunakan, tanggal
- Log ini digunakan untuk perhitungan komisi secara manual di fase awal
- Tidak ada payment processing di MVP — cash antara mitra dan customer

#### Audit & Storage Lokal
- Folder `AUDIT` lokal di device
- Semua event penting tersimpan: order lifecycle, perubahan tarif, handoff eksternal
- Format compact (tidak plain JSON verbose)
- Export audit ke file `.tripaudit` via share sheet
- Guard akses audit dengan device PIN/biometric

### 6.2 Out of Scope — MVP

| Fitur | Alasan Ditunda |
|-------|---------------|
| Payment gateway / wallet | Kompleksitas tinggi, validasi bisnis belum perlu |
| Promo / discount engine | Terlalu dini untuk monetisasi kompleks |
| OTP SMS berbayar | Biaya tidak perlu, gunakan no-OTP atau device-auth |
| In-app VoIP | WhatsApp/dialer cukup dan lebih familiar |
| In-app chat | WhatsApp cukup dan lebih familiar |
| In-app routing engine | Google Maps cukup |
| Dynamic pricing algorithm | Validasi model sederhana dulu |
| Rating/reputation sistem | Phase 2 setelah ada data cukup |
| Enterprise admin dashboard | Belum ada operator yang perlu ini |
| Compliance reporting otomatis | Phase 3 |
| Cloud backup wajib | Phase 2 |
| Background discovery saat app closed | Terlalu kompleks, battery drain |

---

## 7. User Journey Detail

### 7.1 Journey Customer (End-to-End)

```
1. Install app
2. Onboarding: pilih role Customer (atau aktifkan keduanya)
3. Masukkan nama tampilan dan nomor telepon
4. Beri izin lokasi
5. Aktifkan online (opsional — customer tidak harus online untuk booking)
6. Home customer: lihat list/peta mitra online di sekitar
7. Pilih mitra, atau tap "Pesan Sekarang"
8. Isi titik jemput (GPS auto atau pin manual)
9. Isi destination
10. Lihat estimasi harga (jarak × tarif mitra)
11. Opsional: set custom tarif offer per-km
12. Review order summary
13. Kirim order
14. Tunggu mitra accept/reject (max 60 detik)
   a. Jika rejected: kembali ke list, pilih mitra lain
   b. Jika accepted: masuk layar active trip
15. Layar active trip:
   - Nama & nomor mitra
   - Status perjalanan
   - Tombol "Buka Maps", "Telepon", "WhatsApp"
16. Perjalanan selesai: customer tap "Selesaikan Trip"
17. Riwayat tersimpan lokal
```

### 7.2 Journey Mitra (End-to-End)

```
1. Install app
2. Onboarding: pilih role Mitra
3. Masukkan nama tampilan dan nomor telepon
4. Set tarif per-km
5. Beri izin lokasi
6. Aktifkan online → nama mitra muncul di discovery customer sekitar
7. [Opsional] Lihat list customer sekitar yang aktif
8. Notifikasi order masuk (foreground)
9. Layar incoming order:
   - Estimasi jarak dan harga
   - Nama customer
   - Pickup point di map
   - Tombol Accept / Reject
10. Jika accept: masuk ke layar active trip
    - Nomor customer
    - Tombol "Buka Maps ke Pickup", "Telepon", "WhatsApp"
11. Update status perjalanan:
    - OnTheWay (saat berangkat ke pickup)
    - OnTrip (saat customer naik)
12. Selesaikan order
13. Audit tersimpan lokal
```

---

## 8. Feature Requirements Detail

### F-001: Onboarding dan Manajemen Role
**Deskripsi:** Pengguna memilih dan mengelola role (customer/mitra) dari dalam satu aplikasi.

**Requirements:**
- User memilih role utama saat first launch
- User dapat mengaktifkan kedua role sekaligus
- User dapat switch role dari home screen tanpa logout
- Data role tersimpan lokal (tidak ke server)
- Onboarding minimal: nama tampilan + nomor telepon (tidak perlu OTP)

**Acceptance Criteria:**
- [ ] First launch menampilkan onboarding dengan pilihan role
- [ ] Setelah pilih role, user masuk ke home yang sesuai
- [ ] Switch role berhasil tanpa restart app dan tanpa logout
- [ ] Profil tersimpan persisten setelah app diclose dan dibuka ulang

**Prioritas:** P0

---

### F-002: Permission Lokasi
**Deskripsi:** Lokasi adalah pondasi discovery dan estimasi harga.

**Requirements:**
- App meminta izin lokasi foreground saat pertama kali butuh
- Tangani denial dengan layar edukasi + CTA buka settings
- Jika izin dicabut, app tetap bisa dibuka tapi discovery disabled dengan pesan jelas

**Acceptance Criteria:**
- [ ] Izin diberikan → discovery muncul dengan lokasi akurat
- [ ] Izin ditolak → layar non-discovery dengan instruksi enable + CTA
- [ ] Pencabutan izin setelah app jalan → app tidak crash, tampilkan state degraded yang jelas

**Prioritas:** P0

---

### F-003: Online/Offline Toggle
**Deskripsi:** Pengguna bisa memilih kapan terlihat di discovery.

**Requirements:**
- Toggle online/offline di home screen
- Status online mempublish presence snapshot ke relay
- Status offline menghapus presence dari relay
- Presence auto-expire setelah TTL (120 detik tanpa refresh)
- Mitra: harus set tarif valid sebelum bisa online
- Customer: tidak wajib online untuk bisa booking

**Acceptance Criteria:**
- [ ] Toggle online mempublish presence yang bisa dilihat pihak lain
- [ ] Toggle offline menghilangkan nama dari discovery pihak lain dalam < 5 detik
- [ ] Mitra dengan tarif belum diset tidak bisa toggle online (ada error message yang jelas)
- [ ] Presence stale hilang dari list discovery setelah TTL lewat

**Prioritas:** P0

---

### F-004: Nearby Discovery
**Deskripsi:** Pengguna melihat pihak opposite-role yang online di sekitar.

**Requirements:**
- Customer melihat daftar/peta mitra online dalam radius default 3km
- Mitra melihat daftar customer yang aktif dalam radius 3km
- Setiap item tampilkan: nama, jarak estimasi, tarif per-km, estimasi ke lokasi user
- Data discovery di-refresh setiap 30 detik atau on-demand pull-to-refresh
- Empty state informatif jika tidak ada pihak lain yang online

**Acceptance Criteria:**
- [ ] Mitra yang online muncul di discovery customer dalam < 10 detik setelah toggle online
- [ ] Discovery menampilkan jarak dan tarif per-km
- [ ] Pull-to-refresh bekerja dan memperbarui data
- [ ] Empty state muncul dengan pesan yang membantu (bukan error blank)
- [ ] Presence yang sudah expired tidak muncul di list

**Prioritas:** P0

---

### F-005: Pricing Settings
**Deskripsi:** Mitra dan customer dapat mengatur tarif masing-masing.

**Requirements:**
- Mitra: set tarif per-km (Rp 2.000 - Rp 8.000/km)
- Customer: set tarif offer per-km (opsional)
- Validasi input: hanya angka, dalam batas range
- Perubahan tarif mitra tercatat di audit lokal
- Tarif mitra tampil di presence snapshot yang di-publish

**Acceptance Criteria:**
- [ ] Mitra bisa menyimpan tarif yang valid dan tarif muncul di discovery customer
- [ ] Input di luar range menampilkan error yang jelas
- [ ] Perubahan tarif mitra tercatat di audit event PRICING_UPDATED
- [ ] Customer bisa set offer price, atau tidak (default ikut tarif mitra)

**Prioritas:** P0

---

### F-006: Estimasi Harga
**Deskripsi:** Sistem menghitung dan menampilkan estimasi biaya perjalanan sebelum order.

**Requirements:**
- Kalkulasi: haversine distance(pickup, destination) × tarif berlaku
- Tarif berlaku: tarif offer customer jika ada, atau tarif mitra
- Label "estimasi" wajib tampil di semua kalkulasi harga
- Update otomatis jika destination atau tarif berubah

**Acceptance Criteria:**
- [ ] Estimasi harga muncul setelah pickup dan destination ditentukan
- [ ] Kalkulasi haversine akurat (unit test wajib pass)
- [ ] Label "estimasi" tampil jelas — bukan "harga final"
- [ ] Jika tarif berubah, estimasi di-recalculate

**Prioritas:** P0

---

### F-007: Booking Flow
**Deskripsi:** Customer membuat dan mengirim order ke mitra.

**Requirements:**
- Customer isi pickup (GPS auto-fill atau manual pin di map)
- Customer isi destination (search atau manual pin)
- Customer pilih mitra dari list nearby
- Preview order: mitra, pickup, destination, jarak estimasi, harga estimasi
- Customer confirm dan kirim order
- Order tersimpan lokal dengan status `Requested`
- Signaling dikirim ke mitra via relay
- Timeout 60 detik jika mitra tidak merespons → auto status `Expired`

**Acceptance Criteria:**
- [ ] Order bisa dibuat dan dikirim end-to-end dari customer ke mitra
- [ ] Preview order menampilkan semua detail yang relevan sebelum konfirmasi
- [ ] Order tersimpan lokal sebelum sinyal dikirim (tidak hilang jika koneksi putus saat kirim)
- [ ] Timeout 60 detik berjalan dan order auto-expire
- [ ] Audit event ORDER_REQUESTED tercatat

**Prioritas:** P0

---

### F-008: Incoming Order (Mitra)
**Deskripsi:** Mitra menerima dan merespons order masuk.

**Requirements:**
- Notifikasi order masuk saat app foreground
- Layar incoming order: nama customer, pickup point, estimasi harga, countdown timer
- Tombol Accept dan Reject
- Countdown 60 detik yang visible
- Jika tidak ada respons dalam 60 detik → auto-reject (order kembali ke Expired)

**Acceptance Criteria:**
- [ ] Order masuk muncul di mitra dalam < 5 detik dari pengiriman customer
- [ ] Countdown timer tampil dan berjalan mundur
- [ ] Accept mengubah status order ke `Accepted`
- [ ] Reject mengubah status ke `Rejected`
- [ ] Auto-expire setelah 60 detik tanpa respons
- [ ] Audit event ORDER_ACCEPTED / ORDER_REJECTED tercatat

**Prioritas:** P0

---

### F-009: Active Trip Screen
**Deskripsi:** Layar utama saat perjalanan sedang berlangsung.

**Requirements:**
- Tampilkan: nama & nomor pihak lain, status perjalanan, tombol aksi
- Tombol "Buka Maps" (ke pickup untuk mitra, ke destination untuk customer)
- Tombol "Telepon" (buka dialer dengan nomor pihak lain)
- Tombol "WhatsApp" (jika nomor tersedia di WhatsApp)
- Update status: OnTheWay → OnTrip → Completed
- Tombol cancel dengan konfirmasi

**Acceptance Criteria:**
- [ ] Active trip screen muncul setelah order accepted
- [ ] Tombol maps, telepon, WhatsApp berfungsi
- [ ] Status bisa diupdate oleh kedua pihak
- [ ] Cancel dengan konfirmasi sebelum dieksekusi
- [ ] State persisten jika app di-background dan dibuka ulang
- [ ] Audit event untuk setiap transisi status tercatat

**Prioritas:** P0

---

### F-010: External Handoff
**Deskripsi:** Integrasi dengan app eksternal untuk navigasi dan komunikasi.

**Requirements:**
- Maps: buka Google Maps / app maps default dengan koordinat yang benar
- Dialer: buka dialer native dengan nomor yang benar
- WhatsApp: buka WA chat dengan nomor yang benar + prefilled message opsional
- Setiap handoff dicatat di audit dengan status: attempted / opened / failed

**Acceptance Criteria:**
- [ ] Maps handoff membuka maps dengan koordinat destination yang benar
- [ ] Dialer handoff membuka dialer dengan nomor pihak lain yang benar
- [ ] WhatsApp handoff berfungsi jika WA terpasang
- [ ] Error handling jelas jika app target tidak tersedia
- [ ] Audit event HANDOFF_MAPS/CALL/WHATSAPP tercatat

**Prioritas:** P0

---

### F-011: Audit Lokal
**Deskripsi:** Semua event penting tersimpan secara lokal.

**Requirements:**
- Event yang wajib dicatat: semua transisi status order, perubahan tarif, handoff eksternal, role switch, login/bootstrap
- Format: compact (bukan verbose plain text JSON)
- Append-only, tidak bisa diedit
- Export ke file `.tripaudit` via share sheet
- Guard export dengan device PIN/biometric

**Acceptance Criteria:**
- [ ] Setiap event wajib menghasilkan audit entry
- [ ] Audit tidak bisa diedit secara manual dari luar app
- [ ] Export menghasilkan file yang bisa dibuka
- [ ] Export ter-guard oleh device auth
- [ ] Audit tidak membesar tak terkendali (rotation per bulan)

**Prioritas:** P0 (write), P1 (export UI)

---

### F-012: Riwayat Order
**Deskripsi:** Pengguna bisa melihat riwayat perjalanan yang tersimpan lokal.

**Requirements:**
- List riwayat order dari local storage
- Filter: semua / selesai / dibatalkan
- Tap item untuk lihat detail
- Bisa diakses offline

**Acceptance Criteria:**
- [ ] Order completed dan canceled muncul di riwayat
- [ ] Detail order bisa dibuka tanpa koneksi
- [ ] Filter berfungsi

**Prioritas:** P1

---

### F-013: Anti-Abuse Dasar (Trust & Safety Minimum)
**Deskripsi:** Kontrol dasar untuk mencegah fraud dan spoofing.

**Requirements:**
- Validasi koordinat: lat/lng harus dalam range Indonesia (approx -11 to 6 lat, 95 to 141 lng)
- Velocity check: lokasi tidak bergerak lebih cepat dari 150 km/h antar update
- Rate limit presence publish: maks 1 publish per 10 detik per user
- Reject payload dengan timestamp > 5 menit dari server time

> **Catatan CEO:** Ini bukan opsional. Trust & safety minimum **harus ada di MVP**. Tanpa ini, platform bisa disalahgunakan sejak hari pertama dan merusak kepercayaan seluruh ekosistem.

**Acceptance Criteria:**
- [ ] Koordinat di luar range Indonesia ditolak
- [ ] Velocity anomaly detected dan presence tidak dipublish
- [ ] Rate limiting berjalan di sisi relay
- [ ] Payload lama ditolak

**Prioritas:** P0

---

### F-014: Transaction Log (Monetisasi Dasar)
**Deskripsi:** Pencatatan nilai transaksi untuk rekap komisi.

**Requirements:**
- Setiap order completed mencatat: orderId, estimatedPrice, tarif yang digunakan, timestamp
- Log tersedia untuk di-export oleh operator
- Komisi (10% dari estimatedPrice) dikalkulasi dan dicatat tapi tidak dipungut otomatis di MVP

**Acceptance Criteria:**
- [ ] Setiap order completed memiliki transaction log entry
- [ ] Export transaction log tersedia untuk operator
- [ ] Nilai komisi terhitung dan tercatat

**Prioritas:** P1

---

## 9. Non-Functional Requirements

### 9.1 Platform
- Android (min API 26 / Android 8.0) dan iOS (min 14)
- Satu codebase cross-platform

### 9.2 Performa
- App startup: < 2 detik di mid-range device
- Discovery load time: < 3 detik
- Order submit ke mitra receive: < 5 detik
- Audit write tidak block UI thread

### 9.3 Reliabilitas
- Draft order tidak hilang saat app di-kill
- Active order state ter-restore setelah app restart
- Crash-free session rate: > 99%

### 9.4 Privasi
- Tidak menyimpan histori lokasi penuh di server
- Presence snapshot ephemeral dengan TTL
- User diberi penjelasan penggunaan lokasi saat onboarding

### 9.5 Konektivitas
- Fitur utama usable dalam kondisi koneksi 3G
- State lokal tidak bergantung pada koneksi aktif
- Graceful degradation saat relay down: tunjukkan "mode terbatas" bukan crash

### 9.6 Biaya
- Tidak ada third-party berbayar di MVP
- Relay server < Rp 2 juta/bulan pada beban pilot

---

## 10. State Machine Order

```
Draft
  → Requested (customer submit)
  → Canceled (customer batal sebelum kirim)

Requested
  → Accepted (mitra accept dalam 60 detik)
  → Rejected (mitra reject)
  → Expired (timeout 60 detik tanpa respons)
  → Canceled (customer batal sebelum respons)

Accepted
  → OnTheWay (mitra tap "Berangkat ke Pickup")
  → Canceled (salah satu pihak batal)

OnTheWay
  → OnTrip (mitra tap "Customer Naik" / "Mulai Trip")
  → Canceled (salah satu pihak batal)

OnTrip
  → Completed (salah satu pihak tap "Selesaikan")
  → Canceled (darurat — harus ada konfirmasi)

Completed [TERMINAL]
Canceled [TERMINAL]
Rejected [TERMINAL]
Expired [TERMINAL]
```

**Aturan:**
- State terminal tidak bisa kembali ke state aktif
- Satu order aktif per user pada satu waktu
- Semua transisi wajib menulis audit event

---

## 11. Data Entities (Minimal)

```typescript
// Profil pengguna
type UserProfile = {
  userId: string              // UUID lokal
  displayName: string
  phoneNumber?: string
  activeRoles: AppRole[]
  currentRole: AppRole
  deviceAuthEnabled: boolean
  createdAt: string
  updatedAt: string
}

// Pricing
type PricingProfile = {
  userId: string
  partnerPricePerKm?: number  // untuk mitra
  customerOfferPerKm?: number // untuk customer (opsional)
  currency: 'IDR'
  updatedAt: string
}

// Presence snapshot (ephemeral, TTL-based)
type PresenceSnapshot = {
  userId: string
  role: AppRole
  isOnline: boolean
  latitude: number
  longitude: number
  visiblePricePerKm: number
  timestamp: string
  ttlSeconds: number         // default: 120
}

// Order
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
  createdAt: string
  updatedAt: string
}

// Audit event
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

// Transaction log (untuk komisi)
type TransactionLog = {
  orderId: string
  estimatedPrice: number
  pricePerKm: number
  distanceKm: number
  commissionRate: number      // 0.10 = 10%
  commissionAmount: number
  completedAt: string
}
```

---

## 12. Screen List MVP

| No | Screen | Prioritas |
|----|--------|-----------|
| 1 | Splash / Boot | P0 |
| 2 | Onboarding — Role Selection | P0 |
| 3 | Onboarding — Profil Dasar | P0 |
| 4 | Permission Gate — Lokasi | P0 |
| 5 | Home Customer (list + peta mitra) | P0 |
| 6 | Home Mitra (toggle online + list customer) | P0 |
| 7 | Tarif Settings | P0 |
| 8 | Form Pickup & Destination | P0 |
| 9 | Detail Kandidat Mitra | P0 |
| 10 | Review Order | P0 |
| 11 | Incoming Order (mitra) | P0 |
| 12 | Active Trip Detail | P0 |
| 13 | Riwayat Order | P1 |
| 14 | Audit Export / Debug | P1 |
| 15 | Profile & Role Switch | P0 |
| 16 | Transaction Log View (operator) | P1 |

---

## 13. Success Metrics

### Aktivasi
- % user menyelesaikan onboarding: target > 80%
- % user memberi izin lokasi: target > 90%
- % mitra yang aktif online setelah onboarding: target > 70%

### Discovery
- % sesi customer yang melihat ≥1 mitra online: target > 80%
- Rata-rata jumlah mitra terlihat per sesi: target > 3

### Booking
- % order request berhasil dikirim: target > 95%
- % order yang diterima mitra: target > 70%
- Median waktu buka app → order accepted: target < 3 menit

### Trip
- Completion rate: target > 70%
- Cancel rate (dari mitra): target < 15%
- Cancel rate (dari customer setelah accepted): target < 10%

### Teknis
- Crash-free sessions: > 99%
- Discovery render < 3 detik: > 95% sesi
- Konsistensi state order: 0 data loss

### Bisnis
- Biaya backend/bulan: < Rp 3 juta
- Jumlah trip selesai di area pilot: 1.000+ dalam 3 bulan

---

## 14. Risks dan Mitigasi

| Risiko | Level | Mitigasi |
|--------|-------|----------|
| Discovery tidak konsisten | Tinggi | Relay tipis reliable + empty state informatif + retry otomatis |
| Cold start supply-demand | Tinggi | Onboarding mitra sebelum launch ke customer |
| Fraud/spoofing | Sedang | F-013 anti-abuse wajib di MVP |
| UX kalah halus vs platform besar | Sedang | Fokus pada kecepatan dan transparansi, bukan kelengkapan |
| Audit hilang jika device rusak | Sedang | Export manual + komunikasi ke user |
| Ekspektasi setara Gojek/Grab | Sedang | Positioning clear sejak onboarding |

---

## 15. Open Questions

1. Apakah onboarding nomor telepon perlu verifikasi (OTP) atau cukup enter + konfirmasi?
   - **Rekomendasi CEO:** Fase MVP tidak perlu OTP. Gunakan device identity. Tambahkan OTP di phase 2 jika fraud terbukti menjadi masalah.

2. Apakah mitra bisa melihat identitas customer sebelum accept order?
   - **Rekomendasi CEO:** Ya, tampilkan nama display customer dan jarak pickup. Ini membantu mitra membuat keputusan yang informed.

3. Apakah perlu rating/review di MVP?
   - **Rekomendasi CEO:** Tidak. Phase 2. Dengan data trip < 1.000, rating belum statistically meaningful.

4. Bagaimana handle situasi mitra accept lalu tidak datang?
   - **Rekomendasi CEO:** Customer bisa cancel, ada audit trail. Di phase 2, tambahkan completion rate tracking per mitra.

---

## 16. Rekomendasi Dokumen Selanjutnya

Setelah PRD ini, yang dibutuhkan:
- **SDD (Software Design Document)** — arsitektur sistem dan desain komponen
- **TSD (Technical Specification Document)** — spesifikasi implementasi detail
- **UX Spec** — wireframe dan alur layar per screen
- **Sprint breakdown** — task engineering per sprint

---

## 17. Ringkasan Keputusan Produk

TRIP dibangun sebagai **single cross-platform mobile app**, dual role, local-first, dengan:
- pricing transparency sebagai core differentiator,
- external handoff untuk maps/call/chat,
- anti-abuse dasar sebagai keharusan MVP,
- transaction log untuk monetisasi,
- dan audit lokal sebagai fondasi kepercayaan.

MVP sengaja tidak membangun backend berat, routing engine, payment gateway, atau chat sistem. Validasi dilakukan dahulu — lalu scale dengan evidence.

---

*Versi: 1.0 | CEO-reviewed | Approved for execution*
