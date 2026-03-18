# PRD — Carrier App Project

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CEO / Product Direction
**Project:** Carrier App Project
**Motto:** Just Fair
**Previous Working Name:** TRIP
**Document Type:** Product Requirements Document (PRD)
**Source Reference:** BRD — Carrier App Project v1.0
**Status:** Approved for design and engineering execution

---

## Catatan CEO

> PRD versi awal sudah menangkap core flow dengan cukup baik. Versi ini memperkuat beberapa area yang lemah: definisi persona lebih tajam, acceptance criteria lebih bisa diuji, penambahan fitur trust/safety minimal yang wajib ada di MVP, dan monetisasi tracking yang hilang sama sekali di versi sebelumnya.
>
> Satu hal yang saya tekankan kepada tim: **jangan build fitur yang tidak ada dalam scope MVP ini hanya karena terasa "keren" atau "lengkap"**. Setiap tambahan fitur di MVP adalah beban development, testing, dan maintenance. Kita validasi dulu, baru build lebih.

---

## 1. Ringkasan Produk

Carrier App Project adalah aplikasi mobile cross-platform — **satu aplikasi untuk dua peran**: **customer** (penumpang) dan **mitra/driver** (pengemudi). Produk ini dirancang dengan pendekatan **local-first**, **low-backend**, dan **biaya operasional minimal**.

**Nilai inti yang Carrier App Project janjikan:**

- **Customer:** Temukan mitra di sekitar dengan cepat. Harga jelas sebelum pesan. Koordinasi mudah via WhatsApp/telepon langsung.
- **Mitra:** Atur tarif sendiri. Pilih order yang cocok. Tidak ada sistem penalti algoritmik yang tidak transparan.
- **Operator:** Jalankan platform dengan biaya infrastruktur minimal. Audit trail tersedia tanpa server besar.
- **Brand promise:** `Just Fair` — adil untuk driver, customer, dan pengembang.

---

## 2. Latar Belakang

Platform ride-hailing tradisional tidak layak ditiru dari awal karena membawa overhead yang tidak proporsional untuk operator baru:
- Real-time dispatch server
- Routing engine
- Fraud prevention ML
- Support operation
- Compliance reporting
- Third-party API berbayar

Carrier App Project mengambil pendekatan yang lebih realistis: **ride coordination**, bukan **ride-hailing**. Perbedaannya fundamental:
- Ride-hailing: platform yang mengalokasikan driver secara otomatis
- Ride coordination: platform yang mempertemukan supply dan demand, lalu memberikan kontrol kepada kedua pihak

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis
- Launch MVP dalam 3-4 sprint (6-8 minggu development)
- Validasi product-market fit di 1 area pilot
- Capai 1.000 trip selesai dalam 3 bulan pertama
- Biaya infrastruktur MVP < Rp 3 juta/bulan

### 3.2 Build Order MVP
Urutan build yang dikunci untuk pilot:
1. fondasi app, profile, pricing, dan readiness gate
2. presence, discovery, dan home flow
3. booking, incoming order, active trip, cancel/no-show/mismatch
4. history, audit, transaction log, export, dan hardening UI state

Rules:
- jangan lompat ke fitur optional sebelum core order lifecycle stabil
- `Pilot Optional` hanya boleh diaktifkan setelah jalur inti selesai end-to-end

### 3.3 Engineering Board Rule
- Board engineering pilot harus dibagi minimal menjadi:
  - core foundation
  - core presence/home
  - core order lifecycle
  - core hardening
  - pilot optional
- Ticket `Pilot Optional` tidak boleh masuk sprint aktif sebelum exit criteria core sprint terpenuhi

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

### 6.3 Expanded Product Direction (Post-MVP / Bertahap)

Fitur-fitur berikut adalah arah resmi produk setelah fondasi MVP stabil:

- **Freelance driver mode**
  Semua user dapat memakai aplikasi sebagai customer maupun driver. Model ini mendukung orang yang sesekali membawa penumpang untuk menutup biaya bensin atau perjalanan pulang kerja.
- **Community and office rides**
  Booking dapat dipakai untuk nebeng teman kantor atau perjalanan komunitas dengan harga yang dapat dinegosiasikan dalam batas fairness policy produk.
- **Multi-vehicle categories**
  Motor, mobil, bajaj, dan angkot didukung sebagai kelas layanan berbeda. Mobil dan bajaj menggunakan model harga per orang/kursi.

### 6.4 Scope Lock Matrix
| Area | Status | Catatan |
|---|---|---|
| Dual-role onboarding, role switch, basic profile | MVP Pilot | wajib ada |
| Discovery, booking, incoming order, active trip, history | MVP Pilot | core product flow |
| Driver readiness, trust enforcement, audit, transaction log | MVP Pilot | wajib untuk pilot yang fair |
| Cash dan manual transfer | MVP Pilot | payment usable tanpa gateway |
| Auto booking ringan + manual select | MVP Pilot | tanpa broadcast massal |
| Motor dan mobil | MVP Pilot | scope layanan inti |
| Firebase FCM notice | Pilot Optional | aktif bila butuh wake-up saat app background |
| Women preference toggle | Pilot Optional | boleh aktif jika supply dan UX siap |
| Temporary chat | Pilot Optional | tetap off default sampai retention/cleanup siap |
| Bajaj | Phase 2 | sesudah core pilot stabil |
| Background safety tracking + SOS | Phase 2 | butuh validasi baterai dan routing incident |
| OTP / KYC / operator verification | Phase 2 | bila fraud pilot menuntut |
| Payment gateway | Phase 2+ | tetap bukan syarat pilot |
| Angkot fixed route | Phase 2+ | flow berbeda dari personal ride |
| Operator dashboard, cloud backup, auto-settlement | Phase 3+ | tidak boleh bocor ke implementasi pilot |

Rules:
- `MVP Pilot` berarti wajib dipertimbangkan sebagai bagian launch pilot
- `Pilot Optional` berarti boleh diaktifkan hanya jika sudah siap dan harus dijaga lewat feature flag
- `Phase 2+` berarti tidak boleh mengubah kompleksitas core flow pilot
- **Waiting fairness policy**
  Ada batas waiting gratis 5 menit setelah driver tiba. Kelipatan 5 menit berikutnya menambah biaya setara tarif per km. Sebaliknya, bila driver tidak bergerak dari titik awal setelah 5 menit accepted, customer mendapat pengurang tarif yang simetris.
- **Safety and preference features**
  Customer perempuan dapat memilih preferensi driver perempuan. Saat order aktif, app dapat masuk ke mode standby background dengan update lokasi periodik dan SOS.
- **Warm service layer**
  UI dan copywriting mendorong interaksi yang ramah, personal, dan humble: menanyakan kabar, tujuan perjalanan, mengingatkan barang bawaan, dan memastikan tidak ada yang tertinggal.
- **Payment evolution**
  Metode pembayaran berkembang dari cash dan transfer manual ke payment gateway aplikasi dengan pembagian biaya admin yang fair.
- **Push and temporary chat**
  Firebase FCM akan dipakai untuk push notification. Firebase Realtime Database/Storage dapat dipakai untuk chat sementara dan file chat agar local storage tidak terbebani berlebihan.

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
- Home harus selalu menjadi entry point setelah onboarding selesai
- Jika ada active order saat app dibuka ulang, home wajib menampilkan recovery banner ke trip aktif

**Acceptance Criteria:**
- [ ] First launch menampilkan onboarding dengan pilihan role
- [ ] Setelah pilih role, user masuk ke home yang sesuai
- [ ] Switch role berhasil tanpa restart app dan tanpa logout
- [ ] Profil tersimpan persisten setelah app diclose dan dibuka ulang
- [ ] Active order yang belum terminal muncul kembali sebagai banner di home

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
- Home mitra harus menjelaskan alasan gate jika toggle online ditolak
- Status online/offline harus terlihat jelas tanpa user perlu masuk ke layar lain

**Acceptance Criteria:**
- [ ] Toggle online mempublish presence yang bisa dilihat pihak lain
- [ ] Toggle offline menghilangkan nama dari discovery pihak lain dalam < 5 detik
- [ ] Mitra dengan tarif belum diset tidak bisa toggle online (ada error message yang jelas)
- [ ] Presence stale hilang dari list discovery setelah TTL lewat
- [ ] Home mitra menampilkan reason gate saat readiness belum lolos

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
- Customer home harus menampilkan top recommendation yang explainable jika kandidat tersedia
- Customer home harus menyediakan CTA cepat untuk `auto booking` dan akses ke kandidat manual
- Discovery state harus tetap jelas saat lokasi belum aktif, relay putus, atau user sedang offline

**Acceptance Criteria:**
- [ ] Mitra yang online muncul di discovery customer dalam < 10 detik setelah toggle online
- [ ] Discovery menampilkan jarak dan tarif per-km
- [ ] Pull-to-refresh bekerja dan memperbarui data
- [ ] Empty state muncul dengan pesan yang membantu (bukan error blank)
- [ ] Presence yang sudah expired tidak muncul di list
- [ ] Customer home menampilkan top recommendation beserta alasan singkatnya

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
- Jika mitra sedang online tanpa active order, perubahan tarif harus memperbarui presence untuk order berikutnya
- Jika ada active order non-terminal, perubahan tarif tidak boleh mengubah breakdown order yang sedang berjalan
- Pricing settings harus menjelaskan dengan jujur bahwa tarif baru berlaku untuk booking baru, bukan trip aktif

**Acceptance Criteria:**
- [ ] Mitra bisa menyimpan tarif yang valid dan tarif muncul di discovery customer
- [ ] Input di luar range menampilkan error yang jelas
- [ ] Perubahan tarif mitra tercatat di audit event PRICING_UPDATED
- [ ] Customer bisa set offer price, atau tidak (default ikut tarif mitra)
- [ ] Perubahan tarif saat ada active order tidak mengubah harga order aktif
- [ ] Tarif baru muncul ke discovery/order berikutnya setelah save

**Prioritas:** P0

---

### F-006: Estimasi Harga
**Deskripsi:** Sistem menghitung dan menampilkan estimasi biaya perjalanan sebelum order.

**Requirements:**
- Kalkulasi: haversine distance(pickup, destination) × tarif berlaku
- Tarif berlaku: tarif offer customer jika ada, atau tarif mitra
- Jika jarak mitra ke pickup melebihi `3 km`, customer dikenakan **biaya penjemputan tambahan**
- Biaya penjemputan = `(jarak pickup - 3 km) × tarif mitra per km`
- Estimasi harga harus ditampilkan sebagai breakdown:
  - estimasi perjalanan
  - biaya penjemputan tambahan (jika ada)
  - total estimasi
- Label "estimasi" wajib tampil di semua kalkulasi harga
- Update otomatis jika destination atau tarif berubah

**Acceptance Criteria:**
- [ ] Estimasi harga muncul setelah pickup dan destination ditentukan
- [ ] Jika pickup lebih dari 3 km dari mitra terpilih, biaya penjemputan tampil jelas sebelum booking
- [ ] Kalkulasi haversine akurat (unit test wajib pass)
- [ ] Label "estimasi" tampil jelas — bukan "harga final"
- [ ] Jika tarif berubah, estimasi di-recalculate

**Prioritas:** P0

---

### F-007: Booking Flow
**Deskripsi:** Customer membuat dan mengirim order ke mitra.

**Requirements:**
- Customer harus memilih `serviceType` di awal flow (`motor` atau `mobil` untuk MVP pilot)
- Customer isi pickup (GPS auto-fill atau manual pin di map)
- Customer isi destination (search atau manual pin)
- Customer dapat memilih **2 mode booking**:
  - `Manual select`: customer klik salah satu mitra nearby
  - `Auto booking`: app memilih kandidat mitra terbaik secara otomatis dari nearby list
- Booking form harus adaptif terhadap `serviceType`
  - `motor`: rider intent, bawa helm sendiri, bawa jas hujan sendiri
  - `mobil`: jumlah penumpang, rider intent
- Candidate driver harus difilter dulu sebelum ranking atau selection:
  - service type cocok
  - driver readiness valid
  - capacity cukup
  - preference filter jika aktif
  - snapshot masih fresh
- Preview order: mitra, pickup, destination, service type, jarak estimasi, harga estimasi
- Preview order harus menampilkan breakdown final yang relevan:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `gearDiscountAmount` jika ada
  - `paymentMethod`
  - admin fee share jika aktif
  - total estimasi
- Customer confirm dan kirim order
- Order tersimpan lokal dengan status `Requested`
- Signaling dikirim ke mitra via relay
- Timeout 60 detik jika mitra tidak merespons → auto status `Expired`
- `Auto booking` MVP menggunakan ranking yang transparan dan ringan: freshness, jarak ke pickup, dan harga per-km
- `Auto booking` **tidak** boleh broadcast ke banyak mitra sekaligus
- Rating/review dan kualitas kendaraan **belum** dipakai untuk auto ranking di MVP
- Customer harus diberi tahu jika ada biaya penjemputan tambahan sebelum menekan konfirmasi
- Jika `auto booking` retry ke kandidat berikutnya, progress harus terlihat ke customer
- Failure state harus jelas untuk:
  - tidak ada driver cocok
  - preference tidak terpenuhi
  - semua kandidat auto booking reject/timeout
  - driver yang dipilih sudah stale/offline
  - form belum lengkap atau payment belum valid

**Acceptance Criteria:**
- [ ] Order bisa dibuat dan dikirim end-to-end dari customer ke mitra
- [ ] Customer bisa memilih mode `manual select` atau `auto booking`
- [ ] Customer bisa memilih `serviceType` sebelum quote dibangun
- [ ] Form booking berubah sesuai `serviceType`
- [ ] Preview order menampilkan semua detail yang relevan sebelum konfirmasi
- [ ] Kandidat yang tidak eligible tidak ikut masuk ranking/selection
- [ ] Retry `auto booking` terlihat jelas progresnya ke customer
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
- Layar incoming order wajib menampilkan konteks order:
  - `serviceType`
  - `passengerCount` jika relevan
  - `bookingMode` (`manual select` atau `auto booking`)
  - `bookingIntent` (`self` atau `for_other`)
  - `riderDeclaredName` dan `riderPhoneMasked` jika customer memesankan orang lain
  - `paymentMethod`
- Layar incoming order harus menampilkan breakdown:
  - `baseTripEstimatedPrice`
  - estimasi perjalanan
  - jarak mitra ke pickup
  - biaya penjemputan tambahan (jika ada)
  - gear discount info jika relevan
  - admin fee split jika aktif
  - total estimasi yang diterima mitra
- Tombol Accept dan Reject
- Countdown 60 detik yang visible
- Mitra hanya boleh accept jika order masih valid, belum expired, dan mitra belum punya active order lain
- Reject harus tercatat dengan alasan terstruktur minimum: `busy`, `pickup_too_far`, `price_not_suitable`, `suspicious_order`, `undeclared_rider`
- Jika order berasal dari `manual select`, reject/expire mengakhiri attempt dan customer harus memilih ulang
- Jika order berasal dari `auto booking`, reject/expire boleh melanjutkan ke kandidat berikutnya secara berurutan dalam `bookingSessionId` yang sama
- Jika tidak ada respons dalam 60 detik → auto-reject (order kembali ke Expired)

**Acceptance Criteria:**
- [ ] Order masuk muncul di mitra dalam < 5 detik dari pengiriman customer
- [ ] Delegated booking tampil jelas sebagai `for_other` beserta rider declaration yang relevan
- [ ] `serviceType`, payment method, dan passenger context tampil jelas di incoming order
- [ ] Jika ada biaya penjemputan tambahan, nilainya terlihat jelas di layar incoming order
- [ ] Countdown timer tampil dan berjalan mundur
- [ ] Accept mengubah status order ke `Accepted`
- [ ] Reject mengubah status ke `Rejected`
- [ ] Reject reason tercatat untuk audit dan feedback ke customer
- [ ] `Manual select` berhenti setelah reject/expire, sedangkan `auto booking` boleh lanjut ke kandidat berikutnya secara berurutan
- [ ] Auto-expire setelah 60 detik tanpa respons
- [ ] Audit event ORDER_ACCEPTED / ORDER_REJECTED tercatat

**Prioritas:** P0

---

### F-009: Active Trip Screen
**Deskripsi:** Layar utama saat perjalanan sedang berlangsung.

**Requirements:**
- Tampilkan: nama & nomor pihak lain, status perjalanan, milestone aktif, tombol aksi
- Tampilkan konteks trip:
  - `serviceType`
  - `paymentMethod`
  - `bookingIntent`
  - `passengerCount` jika relevan
- Tombol "Buka Maps" (ke pickup untuk mitra, ke destination untuk customer)
- Tombol "Telepon" (buka dialer dengan nomor pihak lain)
- Tombol "WhatsApp" (jika nomor tersedia di WhatsApp)
- Update status: OnTheWay → Arrived at Pickup milestone → Waiting Window → OnTrip → Completed
- Saat milestone `Arrived at Pickup`, layar harus menampilkan waiting timer
- Jika waiting charge atau driver delay deduction aktif, perubahan breakdown harus terlihat
- Breakdown final harus tetap bisa dilihat selama trip aktif:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `waitingChargeAmount`
  - `driverDelayDeductionAmount`
  - `gearDiscountAmount`
- Tombol cancel dengan konfirmasi
- Reason cancel/no-show/mismatch harus tetap bisa dipilih sebelum `OnTrip`
- Sistem harus membedakan jelas:
  - `cancel biasa`
  - `no-show`
  - `mismatch / unsafe cancel`
- `No-show` hanya sah setelah driver mencapai milestone `Arrived at Pickup`
- `Mismatch / unsafe cancel` tetap sah di `Accepted`, `OnTheWay`, atau `Arrived at Pickup`
- Setelah `OnTrip`, cancel hanya untuk kondisi darurat dan harus membawa alasan kuat
- Jalur keluar ini harus punya dampak yang berbeda:
  - `cancel biasa` → audit only
  - `no-show` → boleh memicu waiting fairness dan audit
  - `mismatch / unsafe cancel` → audit + report path + kandidat enforcement

**Acceptance Criteria:**
- [ ] Active trip screen muncul setelah order accepted
- [ ] Tombol maps, telepon, WhatsApp berfungsi
- [ ] Status bisa diupdate oleh kedua pihak
- [ ] Waiting timer muncul setelah driver menandai sudah sampai pickup
- [ ] Breakdown aktif berubah saat fairness component berubah
- [ ] Cancel dengan konfirmasi sebelum dieksekusi
- [ ] No-show, mismatch, dan cancel biasa dibedakan jelas di UI
- [ ] State persisten jika app di-background dan dibuka ulang
- [ ] Audit event untuk setiap transisi status tercatat

**Prioritas:** P0

---

### F-009A: Cancel, No-Show, dan Mismatch Handling
**Deskripsi:** Jalur keluar trip aktif harus fair, eksplisit, dan dapat diaudit.

**Requirements:**
- Reason minimum yang perlu didukung:
  - `user_changed_mind`
  - `no_show`
  - `identity_mismatch`
  - `undeclared_rider`
  - `contact_mismatch`
  - `unsafe_or_suspicious`
  - `pickup_mismatch`
  - `other`
- `No-show` baru boleh dipilih setelah driver mencapai milestone `Arrived at Pickup`
- `Mismatch / unsafe cancel` harus selalu bisa diikuti report flow
- Sistem harus menjelaskan dampak singkat ke user sebelum cancel dieksekusi
- Jika cancel terkait mismatch yang objektif, audit dan trust flow harus menerima reason code yang sama

**Acceptance Criteria:**
- [ ] Reason cancel/no-show/mismatch tampil sesuai stage trip
- [ ] `no_show` tidak bisa dipilih sebelum milestone `Arrived at Pickup`
- [ ] Mismatch cancel menghasilkan audit dan report path yang konsisten

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
- Audit export UX harus menampilkan rentang tanggal, progress export, dan hasil file dengan jelas
- Jika export gagal, alasan error harus tampil jelas tanpa istilah teknis berlebihan

**Acceptance Criteria:**
- [ ] Setiap event wajib menghasilkan audit entry
- [ ] Audit tidak bisa diedit secara manual dari luar app
- [ ] Export menghasilkan file yang bisa dibuka
- [ ] Export ter-guard oleh device auth
- [ ] Audit tidak membesar tak terkendali (rotation per bulan)
- [ ] Export screen menampilkan progress dan hasil file dengan jelas

**Prioritas:** P0 (write), P1 (export UI)

---

### F-012: Riwayat Order
**Deskripsi:** Pengguna bisa melihat riwayat perjalanan yang tersimpan lokal.

**Requirements:**
- List riwayat order dari local storage
- Filter: semua / selesai / dibatalkan
- Tap item untuk lihat detail
- Bisa diakses offline
- Detail history harus menampilkan:
  - service type
  - payment method
  - status akhir
  - breakdown finansial utama
  - reason cancel/no-show/mismatch jika ada
- Riwayat harus membantu user menelusuri kejadian, bukan hanya daftar mentah

**Acceptance Criteria:**
- [ ] Order completed dan canceled muncul di riwayat
- [ ] Detail order bisa dibuka tanpa koneksi
- [ ] Filter berfungsi
- [ ] Detail history menampilkan breakdown dan reason akhir bila ada

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
- Komisi dihitung hanya dari `baseTripEstimatedPrice`, bukan dari `pickupSurchargeAmount`
- Biaya penjemputan tambahan sepenuhnya milik mitra dan tidak masuk basis komisi platform di MVP
- Transaction log view harus menampilkan breakdown yang mudah dibaca:
  - order id singkat
  - service type
  - payment method
  - total estimasi
  - base komisi
  - commission amount
  - payment admin fee jika ada

**Acceptance Criteria:**
- [ ] Setiap order completed memiliki transaction log entry
- [ ] Export transaction log tersedia untuk operator
- [ ] Nilai komisi terhitung dan tercatat
- [ ] Transaction log view konsisten dengan breakdown order selesai

**Prioritas:** P1

---

### F-015: Driver Readiness dan Multi-Vehicle Profile
**Deskripsi:** Semua user bisa menjadi driver, tetapi hanya user yang memenuhi syarat minimum yang boleh online sebagai driver.

**Requirements:**
- Profile flow minimum harus terbagi jelas:
  - basic profile
  - driver profile
  - vehicle setup
  - bank account dan favorite addresses
- Driver dapat menyimpan lebih dari satu kendaraan
- Jenis kendaraan minimum yang didukung roadmap: `motor`, `mobil`, `bajaj`, `angkot`
- Data driver yang perlu disimpan lokal:
  - nama lengkap sesuai identitas
  - nomor identitas
  - foto profil
  - daftar kendaraan
  - nomor plat kendaraan
  - status/legalitas SIM
  - kelengkapan helm
  - kelengkapan jas hujan
  - tarif per km
  - rating
  - review ringkas
  - total trip
  - account bank (bisa lebih dari satu)
- Driver motor baru boleh online jika deklarasi helm dua tersedia
- Driver hanya boleh online jika legalitas minimum untuk kendaraan yang aktif telah dinyatakan lengkap
- Verification MVP untuk driver bersifat `minimum-valid`, bukan KYC legal penuh
- Data yang tidak lengkap, tidak konsisten, atau mencurigakan harus ditahan dari status online
- Perubahan field kritikal seperti legal name, identitas, kendaraan aktif, plat, SIM, seat capacity, atau perlengkapan driver harus memicu revalidation readiness
- Saat ada active order non-terminal, field operasional kritikal tidak boleh diubah agar trip yang sedang berjalan tidak ambigu
- Field non-operasional seperti foto profil, rekening bank, dan favorite addresses tetap boleh diubah tanpa mengganggu trip aktif

**Acceptance Criteria:**
- [ ] User bisa memiliki lebih dari satu profil kendaraan
- [ ] Driver motor tanpa helm cadangan tidak bisa `ready to online`
- [ ] Data profil driver persisten di local storage
- [ ] Driver dengan data legal minimum yang tidak lengkap tidak bisa online
- [ ] Driver dengan data mencurigakan masuk status flagged/blocked dan tidak bisa publish presence
- [ ] Perubahan field kritikal memicu evaluasi ulang readiness
- [ ] Active order memblok edit field operasional kritikal

**Prioritas:** P1

### F-015A: Driver Verification Matrix
**Deskripsi:** Sistem membedakan profil driver yang baru deklaratif, minimum-valid, flagged, atau blocked.

**Requirements:**
- Status minimum yang perlu didukung:
  - `draft`: data driver belum lengkap
  - `declared`: data sudah diisi, belum lolos validasi minimum
  - `minimum_valid`: data lolos validasi format dan konsistensi minimum
  - `flagged`: data terlihat janggal dan ditahan dari online
  - `blocked`: data ditolak dari fitur driver sampai ada perbaikan
- `minimum_valid` adalah syarat minimum untuk `ready to online`
- Contoh kondisi `flagged`:
  - plat kosong untuk kendaraan yang memerlukannya
  - nomor identitas format salah
  - jenis kendaraan aktif tidak cocok dengan field readiness
  - data helm/SIM bertentangan
- Contoh kondisi `blocked`:
  - pola data palsu berulang
  - mismatch berat yang berulang di lapangan
  - deklarasi kendaraan/legalitas yang jelas tidak masuk akal

**Acceptance Criteria:**
- [ ] Driver tidak bisa online bila verification status masih `draft` atau `declared`
- [ ] Driver `minimum_valid` bisa masuk flow readiness
- [ ] Driver `flagged` dan `blocked` tidak bisa publish presence sebagai driver

---

### F-016: Fair Waiting Policy
**Deskripsi:** Sistem menerapkan aturan tunggu yang adil untuk driver dan customer.

**Requirements:**
- Setelah driver tiba di pickup, 5 menit pertama gratis
- Setiap kelipatan 5 menit berikutnya menambah biaya tunggu setara 1x tarif per km yang berlaku
- Jika driver tidak bergerak dari titik awal selama > 5 menit setelah order accepted, customer mendapat pengurang tarif dengan formula simetris
- Waiting charge dan waiting deduction harus terlihat di order breakdown

**Acceptance Criteria:**
- [ ] Driver melihat waiting timer setelah status tiba di pickup
- [ ] Customer melihat waiting charge atau waiting deduction secara transparan
- [ ] Audit event fairness tercatat saat charge/deduction terjadi

**Prioritas:** P1

---

### F-017: Safety Preference dan Driver Recommendation
**Deskripsi:** Produk memberi kontrol lebih besar pada customer untuk memilih opsi yang aman dan bernilai.

**Requirements:**
- Customer perempuan dapat mengaktifkan toggle preferensi driver perempuan saat booking
- Nilai toggle tersimpan di cache untuk booking berikutnya
- Preferensi ini bersifat opt-in dan tidak aktif secara default
- Jika tidak ada driver perempuan eligible, sistem harus jujur memberi tahu bahwa supply tidak tersedia; tidak boleh diam-diam fallback tanpa penjelasan
- Sistem menampilkan top recommendation driver berdasarkan kombinasi yang transparan:
  - freshness snapshot
  - jarak driver ke pickup
  - total estimasi biaya customer
  - kecocokan service type / kendaraan
  - trust/readiness status
  - preferensi driver perempuan jika aktif
- Rating/review dipakai untuk recommendation hanya setelah source of truth cukup matang
- Recommendation tidak boleh menyembunyikan opsi lain; customer tetap bisa melihat daftar kandidat yang lebih lengkap

**Acceptance Criteria:**
- [ ] Toggle preferensi driver perempuan tersedia dan persisten lokal
- [ ] Jika supply driver perempuan tidak ada, user mendapat pesan yang jelas
- [ ] Recommendation menjelaskan alasan rekomendasi secara transparan
- [ ] Customer tetap bisa melihat kandidat lain di luar top recommendation

**Prioritas:** P1

---

### F-018: Rating Default dan Warm Interaction
**Deskripsi:** Produk mendorong pengalaman hangat dan apresiatif tanpa membebani user.

**Requirements:**
- Secara default setiap trip selesai diberi rating 5 bintang
- Jika customer memberi rating manual, rating manual menggantikan default
- Setelah trip `Completed`, app menampilkan post-trip feedback sheet yang ringan dan tidak memaksa
- Rating manual berupa 1-5 bintang, dengan review singkat opsional
- Jika customer menutup sheet atau melewati flow tanpa input manual, sistem membekukan rating default 5
- Review teks pada MVP diperlakukan sebagai catatan pengalaman, bukan sinyal publik untuk ranking otomatis
- App menampilkan micro-copy yang ramah, humble, dan personal di titik interaksi penting
- App mengingatkan barang bawaan dan keselamatan secara kontekstual
- Tone matrix minimum per layar harus jelas:
  - onboarding: menyambut dan menenangkan
  - customer home: membantu memilih tanpa menekan
  - driver home: menghargai kesiapan dan effort driver
  - incoming order: jelas, cepat, tidak panik
  - active trip: menenangkan dan kontekstual
  - post-trip feedback: apresiatif dan ringan
  - error/empty state: jujur, membantu, tidak menyalahkan user

**Acceptance Criteria:**
- [ ] Trip tanpa input rating manual tetap menghasilkan rating 5
- [ ] Trip dengan rating manual memakai rating manual
- [ ] Post-trip feedback sheet dapat dilewati tanpa menghambat penyelesaian trip
- [ ] Review teks opsional tidak mengubah ranking recommendation di MVP
- [ ] Copy utama konsisten dengan tone hangat dan sopan
- [ ] Layar utama memakai tone yang konsisten sesuai peran dan konteks

**Prioritas:** P1

---

### F-019: Rider Gear Discount
**Deskripsi:** Customer yang membawa perlengkapan sendiri dapat memperoleh harga lebih ringan untuk layanan motor.

**Requirements:**
- Jika customer membawa helm sendiri, ada potongan Rp 500 per km
- Jika kondisi hujan dan customer membawa jas hujan sendiri, ada tambahan potongan Rp 500 per km
- Informasi ini harus terlihat ke driver di incoming order
- Potongan hanya berlaku untuk kategori kendaraan yang relevan, terutama motor

**Acceptance Criteria:**
- [ ] Driver melihat status helm/jas hujan milik customer pada order yang relevan
- [ ] Breakdown harga menampilkan gear discount secara jelas

**Prioritas:** P1

---

### F-020: Payment Evolution
**Deskripsi:** Sistem pembayaran berkembang bertahap dari yang paling ringan sampai yang paling terintegrasi.

**Requirements:**
- Metode pembayaran yang direncanakan:
  - cash
  - transfer manual
  - payment gateway aplikasi
- Untuk payment gateway aplikasi, biaya admin dibagi dua antara driver dan customer
- Metode pembayaran harus dipilih sebelum trip dimulai
- Untuk `cash` dan `transfer manual`, aplikasi hanya mencatat pilihan metode bayar dan nilai transaksi
- Untuk `gateway`, preview pembayaran wajib menampilkan:
  - subtotal trip
  - pickup surcharge
  - waiting charge atau deduction
  - gear discount
  - total admin fee
  - customer admin fee share
  - partner admin fee share
- Basis komisi platform tetap hanya dari `baseTripEstimatedPrice`
- `gateway` tidak menjadi prasyarat MVP pilot dan harus bisa dimatikan via feature flag

**Acceptance Criteria:**
- [ ] Payment method tampil di review order
- [ ] Metode cash dan transfer manual bisa ditandai tanpa gateway integration
- [ ] Jika `gateway` aktif, fee split customer/driver terlihat jelas sebelum konfirmasi
- [ ] Metode bayar tersimpan sebagai bagian order dan transaction log

**Prioritas:** P1

---

### F-021: Push Notification, Temporary Chat, dan SOS
**Deskripsi:** Sistem menambah komunikasi dan safety layer dengan biaya serendah mungkin.

**Requirements:**
- Firebase Cloud Messaging dipakai untuk push notification dasar
- Firebase Realtime Database/Storage dapat dipakai untuk chat sementara dan file chat sementara
- Data chat bersifat temporary dan tidak menjadi source of truth utama
- Contact reveal hanya boleh terjadi setelah order `Accepted` dan hanya untuk dua pihak pada order aktif
- Temporary chat hanya boleh aktif setelah contact reveal berhasil dan selalu terikat ke `orderId`
- Temporary chat berakhir saat order terminal atau setelah TTL pendek berakhir
- Jika temporary chat tidak aktif atau gagal, call/WhatsApp tetap menjadi fallback utama
- Saat order aktif, app dapat masuk ke mode standby/background service terbatas untuk update lat/long periodik dan SOS
- Push notification hanya dipakai untuk event penting seperti incoming order, response order, atau SOS-related notice
- Temporary chat wajib punya retention policy yang pendek dan jelas, misalnya auto-expire 24 jam setelah order terminal
- File chat tidak boleh menjadi arsip permanen produk di MVP
- Background tracking tidak boleh dipakai untuk discovery background terus-menerus; hanya untuk active order
- Update lokasi background harus hemat baterai dan bersifat periodik minimum, target awal 60 detik sekali bila OS mengizinkan
- Matrix delivery event harus jelas:
  - `presence` dan `order signaling` via realtime relay
  - `incoming order`, `order response`, dan notice penting saat app background via FCM bila tersedia
  - `history`, `transaction log`, `audit`, dan feedback tetap local-first
- Push notification tidak boleh menjadi source of truth status order; push hanya wake-up/notice layer
- SOS wajib membawa:
  - orderId jika ada
  - actorUserId
  - serviceType
  - lokasi terakhir
  - teks singkat alasan bahaya

**Acceptance Criteria:**
- [ ] Push notification bisa dipakai untuk order penting saat app tidak foreground
- [ ] Contact reveal tidak terjadi sebelum order diterima
- [ ] Temporary chat hanya tersedia untuk pasangan order aktif
- [ ] Temporary chat punya TTL/retention policy yang jelas
- [ ] Call/WhatsApp tetap tersedia saat temporary chat dimatikan
- [ ] Matrix event relay/push/local terdokumentasi dan konsisten
- [ ] SOS mengirim lokasi dan keterangan bahaya minimum
- [ ] Background safety mode tidak mengaktifkan discovery background
- [ ] User diberi penjelasan bahwa chat dan tracking ini bersifat terbatas saat active order

**Prioritas:** P2

---

### 8.1A Service Matrix

| Service Type | Model Harga | Aturan Utama | Kelayakan Driver | Status Produk |
|---|---|---|---|---|
| `motor` | `per_vehicle` per km | 1 penumpang utama, pickup surcharge, gear discount, waiting fairness | SIM aktif, plat aktif, helm dua wajib | MVP Pilot |
| `mobil` | `per_seat` per km | harga dasar untuk penumpang pertama + tambahan per penumpang per km | SIM aktif, plat aktif, seat capacity jelas | MVP Pilot |
| `bajaj` | `per_seat` per km | serupa mobil tetapi kapasitas lebih kecil dan tarif tambahan penumpang wajib jelas | legalitas kendaraan aktif, seat capacity jelas | Phase 2 |
| `angkot` | `fixed_price` / rute tetap | tidak mengikuti model pricing order personal penuh | legalitas kendaraan aktif, rute/kapasitas jelas | Phase 2+ |

Aturan penguncian scope:
- `MVP Pilot` dikunci ke `motor` dan `mobil`
- `bajaj` dan `angkot` tetap bagian arah produk, tetapi tidak boleh mempersulit core order flow MVP
- Gear discount hanya berlaku untuk `motor`
- Women preference filter berlaku untuk service yang supply drivernya memungkinkan
- Waiting fairness berlaku untuk semua service personal ride, kecuali angkot fixed-route yang akan punya policy terpisah

### 8.1C Booking Enhancement Scope
- MVP pilot booking flow dikunci untuk:
  - `service selector`
  - `adaptive booking form`
  - `filtered candidate set`
  - `final quote builder`
  - `auto-book retry progress`
  - `clear failure states`
- Enhancement ini diprioritaskan sebelum fitur visual sekunder atau rekomendasi yang lebih kompleks

### 8.1B Active Trip Lifecycle

Lifecycle aktif yang dikunci untuk MVP pilot:
1. `Accepted`
   Driver sudah menerima order. App mulai memonitor apakah driver bergerak wajar dari titik awal.
2. `OnTheWay`
   Driver menekan aksi berangkat ke pickup.
3. `Arrived at Pickup` milestone
   Bukan status order baru, tetapi milestone operasional yang menyalakan waiting timer.
4. `Waiting Window`
   5 menit pertama gratis untuk customer.
5. `Waiting Charge Steps`
   Setelah grace period habis, setiap kelipatan 5 menit menambah waiting charge setara 1x tarif per km yang berlaku.
6. `OnTrip`
   Customer sudah naik dan trip ke destination dimulai.
7. `Completed`
   Trip selesai, breakdown final dibekukan, rating default 5 bintang disiapkan, dan transaction log ditulis.

Aturan fairness lifecycle:
- Jika driver belum bergerak secara material setelah 5 menit sejak `Accepted`, customer berhak mendapat `driver delay deduction`
- `waiting charge` dan `driver delay deduction` tidak boleh aktif pada interval waktu yang sama
- Cancel karena mismatch, no-show, atau unsafe condition tetap boleh terjadi di `Accepted`, `OnTheWay`, atau `Arrived at Pickup`
- Breakdown akhir wajib memisahkan:
  - `baseTripEstimatedPrice`
  - `pickupSurchargeAmount`
  - `waitingChargeAmount`
  - `driverDelayDeductionAmount`
  - `gearDiscountAmount`

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

### 9.5A Error dan Empty State Principles
- Empty state tidak boleh terlihat seperti error
- Error state tidak boleh membuat user kehilangan konteks terakhir yang masih valid
- Setiap state utama minimal harus punya satu CTA yang jelas:
  - retry
  - buka settings
  - kembali ke trip aktif
  - ubah profile/pricing
- Saat sistem masuk `mode terbatas`, app tetap harus jujur menjelaskan fitur apa yang sementara tidak tersedia

### 9.6 Biaya
- Tidak ada third-party berbayar di MVP
- Relay server < Rp 2 juta/bulan pada beban pilot

### 9.7 UX dan Visual Direction
- Warna soft dan bersih
- Border seminimal mungkin
- Shadow tipis dan tidak berat
- Nada interaksi harus humble, hangat, dan menenangkan
- Surface utama harus terasa ringan: card bersih, jarak lega, dan hierarki jelas
- Aksi penting seperti `booking`, `accept`, atau `go online` boleh menonjol, tetapi status biasa tidak perlu agresif
- Visual system harus konsisten lintas role: customer dan mitra terasa satu produk, bukan dua aplikasi berbeda

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

### 10.1 Active Trip Milestones
- `Arrived at Pickup` diperlakukan sebagai milestone aktif di dalam flow `OnTheWay`, bukan status order baru
- Waiting timer baru boleh mulai setelah milestone `Arrived at Pickup`
- Customer no-show, mismatch rider, atau kondisi tidak aman dapat mengakhiri flow sebelum `OnTrip`
- Setelah `OnTrip`, waiting fairness tidak lagi berjalan; yang berlaku hanya trip completion atau cancel darurat

---

## 11. Data Entities (Minimal)

```typescript
// Profil pengguna
type UserProfile = {
  userId: string              // UUID lokal
  displayName: string
  phoneNumber?: string
  legalFullName?: string
  identityNumber?: string
  profilePhotoUri?: string
  driverReadinessStatus?: 'draft' | 'declared' | 'minimum_valid' | 'flagged' | 'blocked'
  genderDeclaration?: 'female' | 'male' | 'unspecified'
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
  createdAt: string
  updatedAt: string
}

type VehicleProfile = {
  vehicleId: string
  vehicleType: 'motor' | 'mobil' | 'bajaj' | 'angkot'
  plateNumber?: string
  pricingMode?: 'per_vehicle' | 'per_seat' | 'fixed_price'
  seatCapacity?: number
  additionalPassengerPricePerKm?: number
  verificationStatus?: 'draft' | 'declared' | 'minimum_valid' | 'flagged' | 'blocked'
}

type BankAccount = {
  bankName: string
  accountNumberMasked: string
  accountHolderName: string
}

type SavedAddress = {
  label: string
  latitude: number
  longitude: number
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
  serviceType?: VehicleProfile['vehicleType']
  pricingMode?: VehicleProfile['pricingMode']
  passengerCount?: number
  paymentMethod?: 'cash' | 'manual_transfer' | 'gateway'
  pickup: LocationPoint
  destination: LocationPoint
  distanceEstimateKm: number
  pricePerKmApplied: number
  waitingChargeAmount?: number
  driverDelayDeductionAmount?: number
  gearDiscountAmount?: number
  paymentAdminFeeTotal?: number
  customerAdminFeeShare?: number
  partnerAdminFeeShare?: number
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
  paymentMethod?: 'cash' | 'manual_transfer' | 'gateway'
  paymentAdminFeeTotal?: number
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

### 16.1 MVP Wireflow Ringkas
- `First install`:
  onboarding → role selection → basic profile → pricing awal jika role mitra → home sesuai role
- `Customer journey utama`:
  customer home → booking form → review quote → waiting response → active trip → post-trip feedback → history
- `Mitra journey utama`:
  mitra home → go online → incoming order → active trip → history / kembali ke home
- `Recovery journey`:
  app restart saat ada order aktif → recovery banner di home → active trip
- `Support journey`:
  home → profile / pricing settings / history / audit export

---

## 17. Ringkasan Keputusan Produk

Carrier App Project dibangun sebagai **single cross-platform mobile app**, dual role, local-first, dengan:
- pricing transparency sebagai core differentiator,
- external handoff untuk maps/call/chat,
- anti-abuse dasar sebagai keharusan MVP,
- transaction log untuk monetisasi,
- audit lokal sebagai fondasi kepercayaan,
- dan arah produk `Just Fair` yang memperluas fairness ke pricing, waiting, safety, dan tone interaksi.

MVP sengaja tidak membangun backend berat, routing engine, payment gateway, atau chat sistem. Validasi dilakukan dahulu — lalu scale dengan evidence.

---

*Versi: 1.0 | CEO-reviewed | Approved for execution*
