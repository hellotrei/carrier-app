# BRD — Carrier App Project

**Versi:** 1.0 (CEO-reviewed)
**Owner:** CEO / CTO / Product Direction
**Project:** Carrier App Project
**Motto:** Just Fair
**Previous Working Name:** TRIP
**Document Type:** Business Requirements Document (BRD)
**Status:** Approved for product and engineering execution

---

## Catatan CEO untuk Tim

> BRD versi awal sudah menangkap arah teknis dengan baik. Namun sebuah BRD yang matang harus bisa menjawab tiga pertanyaan sekaligus: **Kenapa bisnis ini ada? Siapa yang membayar siapa? Dan bagaimana kita tahu kalau ini berhasil?**
>
> Versi ini menambahkan dimensi yang hilang: monetisasi, go-to-market, path regulasi, dan definisi sukses yang lebih bisnis-first. Arah teknisnya tetap sama — local-first, single app, dual role — tetapi sekarang dibingkai dalam konteks bisnis yang lebih lengkap.

---

## 1. Executive Summary

Carrier App Project adalah platform koordinasi transportasi berbasis mobile yang mempertemukan **customer** (penumpang) dan **mitra** (pengemudi) dalam **satu aplikasi** dengan pendekatan **local-first, transparan, dan biaya operasional minimal**.

Carrier App Project bukan replika mini Gojek/Grab. Produk ini adalah **kategori baru**: ride coordination platform yang dirancang untuk area dan komunitas yang kurang terlayani oleh platform besar, dengan proposisi nilai yang berbeda:

- **Untuk mitra:** kontrol lebih besar atas tarif, transparansi penuh atas order, beban operasional ringan
- **Untuk customer:** transparansi harga sejak awal, koordinasi langsung, proses booking sederhana
- **Untuk operator/pengembang:** infrastruktur ringan, biaya rendah, cepat diluncurkan
- **Untuk ekosistem lokal:** membuka model freelance driver, nebeng pulang kerja, dan perjalanan komunitas yang fair

**Motto produk:** `Just Fair` — adil untuk driver, customer, dan pengembang.

**Fase awal Carrier App Project berfokus pada validasi produk-market fit** di 1-2 area pilot yang terseleksi, sebelum ekspansi lebih luas.

---

## 2. Latar Belakang dan Justifikasi Bisnis

### 2.1 Mengapa Masalah Ini Layak Diselesaikan

Platform ride-hailing tradisional membawa overhead besar yang secara struktural merugikan tiga pihak sekaligus:

- **Operator/pengembang** menanggung biaya server dispatch, routing, ML, fraud prevention, compliance, support, dan third-party berbayar — semua ini harus ada sebelum rupiah pertama masuk.
- **Mitra** menghadapi potongan efektif yang terasa lebih dari angka nominal, sistem algoritmik tidak transparan, penalti yang tidak jelas, dan hampir nol kontrol atas kondisi kerja.
- **Customer** mendapat harga yang tidak konsisten, tidak bisa memilih driver, dan friction koordinasi yang sering membuat frustasi.

### 2.2 Ruang yang Ditinggalkan Platform Besar

Platform besar (Gojek, Grab) beroperasi secara ekonomis hanya di kota besar dengan density tinggi. Di kota tier 2-3 dan area suburban, mereka hadir tetapi supply-demand sering tidak seimbang. Di sinilah TRIP punya ruang nyata.

### 2.3 Proposisi Nilai TRIP

| Dimensi | Platform Besar | TRIP |
|---------|---------------|------|
| Kontrol tarif mitra | Algoritmik, tidak transparan | Mitra set sendiri, visible |
| Kontrol tarif customer | Fixed / surge pricing | Customer set offer per-km |
| Infrastruktur operator | Server berat, biaya tinggi | Local-first, relay minimal |
| Pilihan komunikasi | In-app proprietary | WhatsApp/dialer yang sudah ada |
| Histori data | Tersimpan di server platform | Tersimpan di device pengguna |
| Target area | Kota besar, density tinggi | Kota menengah, area underserved |

---

## 3. Problem Statement

### 3.1 Dari Sisi Pengembang/Operator
- Biaya infrastruktur ride-hailing tradisional sangat tinggi sebelum ada revenue
- Ketergantungan pada API berbayar (maps, OTP, notifikasi) membesar seiring skala
- Kebutuhan tim spesialis (ML, dispatch, compliance) tidak proporsional untuk operator kecil-menengah
- Time-to-market lambat karena kompleksitas teknis tinggi

### 3.2 Dari Sisi Mitra
- Potongan platform terasa tidak fair dan tidak transparan
- Order distribution algoritmik tidak bisa diaudit oleh mitra
- Tidak ada kontrol atas kondisi kerja
- Ketergantungan penuh pada platform untuk seluruh pendapatan

### 3.3 Dari Sisi Customer
- Harga tidak konsisten, surge pricing terasa tidak adil
- Tidak bisa memilih driver yang diinginkan
- Koordinasi penjemputan sering bermasalah
- Tidak ada jalur komunikasi langsung yang nyaman dengan driver

---

## 4. Product Vision

> **"Jadikan koordinasi transportasi sesederhana ngobrol dengan tetangga yang tahu jalan."**

Carrier App Project membangun ekosistem transportasi berbasis kepercayaan dan transparansi, di mana driver dan customer bertemu secara langsung dengan aturan yang jelas, tanpa overhead platform yang berlebihan.

**Visi jangka panjang (3 tahun):** Carrier App Project menjadi infrastruktur ride coordination untuk 50+ kota tier 2-3 di Indonesia, dioperasikan oleh operator lokal dengan model white-label atau franchise ringan, dengan total mitra aktif yang memberi pendapatan sustainable bagi ekosistem.

---

## 5. Product Goals

### 5.1 Goals Bisnis
- Validasi product-market fit di 1-2 area pilot dalam 6 bulan pertama
- Mencapai unit economics positif (biaya operasional per order < pendapatan komisi per order) dalam 12 bulan
- Membangun pipeline 200+ mitra aktif di area pilot sebelum launch customer
- Menekan biaya infrastruktur teknologi di bawah Rp 5 juta/bulan pada fase MVP

### 5.2 Goals Pengguna
- Customer menemukan mitra online dalam **< 60 detik** dari buka app
- Customer memahami estimasi harga sebelum order dikirim
- Mitra dapat mengatur tarif dan menerima order dengan **< 5 tap**
- Kedua pihak dapat terhubung langsung tanpa perlu tool tambahan

### 5.3 Goals Teknis
- Satu codebase untuk Android dan iOS
- Local-first storage sebagai source of truth utama
- Tidak menyimpan histori lokasi penuh di database terpusat
- Relay backend ringan yang bisa dioperasikan dengan biaya < Rp 2 juta/bulan
- Fitur inti usable dengan koneksi 3G sekalipun

---

## 6. Model Bisnis dan Monetisasi

> **Ini adalah bagian yang paling krusial dan yang paling sering hilang di dokumen teknis. TRIP harus punya model pendapatan sejak hari pertama — meski kecil.**

### 6.1 Model Pendapatan Utama: Komisi per Perjalanan

TRIP mengambil **komisi dari setiap perjalanan yang selesai**, dalam batas regulasi Indonesia (KP 1001/2022):

- **Biaya layanan platform:** 10-12% dari nilai perjalanan (di bawah batas 15%)
- **Biaya dukungan mitra (opsional):** 2-3% untuk program asuransi dan dukungan operasional

**Catatan penting:** Komisi ini **hanya dipungut saat perjalanan selesai**. Tidak ada biaya pendaftaran, biaya langganan, atau biaya tersembunyi untuk mitra maupun customer di fase awal.

### 6.2 Model Pembayaran

Fase MVP:
- **Cash** — mitra menerima pembayaran langsung dari customer, platform tidak terlibat dalam alur uang
- **Transfer manual** — customer dan driver menyelesaikan transfer di luar flow settlement aplikasi
- Platform hanya mencatat nilai transaksi untuk audit dan perhitungan komisi

Fase selanjutnya (post-validation):
- **QRIS/payment gateway** via integrasi payment yang ringan
- Sistem komisi otomatis via settlement periodik ke rekening mitra
- Biaya admin payment gateway dibagi dua secara simetris antara customer dan driver

Rule bisnis pembayaran:
- Basis komisi platform tetap dari `baseTripEstimatedPrice`, bukan dari biaya admin payment
- Jika metode bayar `cash` atau `transfer manual`, aplikasi tidak boleh mengklaim settlement berhasil secara otomatis
- Jika metode bayar `gateway`, breakdown biaya admin harus terlihat sebelum customer mengonfirmasi order

### 6.3 Revenue Projection (Konservatif, Area Pilot)

Asumsi:
- 100 mitra aktif, rata-rata 5 trip/hari per mitra
- Rata-rata nilai trip: Rp 15.000
- Komisi TRIP: 10%

Kalkulasi:
- 100 × 5 × Rp 1.500 = **Rp 750.000/hari**
- = **~Rp 22.500.000/bulan**

Dengan biaya operasional relay + server minimal, ini sudah **cash flow positif** di fase pilot.

### 6.4 Path Monetisasi Jangka Menengah

- **Operator/franchise fee:** biaya lisensi untuk operator daerah yang ingin menjalankan TRIP di area mereka
- **Premium placement:** mitra bisa membayar untuk visibilitas lebih tinggi di discovery (opsional, harus transparan)
- **Data insights (aggregate, anonymous):** laporan demand per area untuk pemerintah daerah atau penelitian

---

## 7. Go-To-Market Strategy

### 7.1 Fase 0: Persiapan (sebelum launch)

**Target:** Bangun supply sebelum demand.

Akuisisi 50-100 mitra di 1 area pilot melalui:
- Pendekatan langsung ke komunitas ojek pangkalan setempat
- Kerjasama dengan komunitas online pengemudi ojek lokal
- Demo sederhana: tunjukkan bahwa tarif lebih transparan dan tidak ada sistem penalti algoritmik

**Area pilot yang ideal:**
- Kota menengah (populasi 200rb - 1jt) dengan penetrasi Gojek/Grab rendah-sedang
- Komunitas ojek lokal yang masih aktif
- Area yang bisa dijangkau tim untuk support langsung (initially)

### 7.2 Fase 1: Soft Launch (bulan 1-3)

- Launch terbatas untuk customer di area pilot yang sudah ada supply mitra
- Fokus pada word-of-mouth dan community-based marketing
- Tidak ada iklan berbayar — fokus pada kualitas pengalaman

**KPI utama Fase 1:**
- 500+ trip selesai
- 70%+ completion rate
- < 20% cancel rate dari sisi mitra

### 7.3 Fase 2: Stabilisasi dan Ekspansi Terbatas (bulan 4-9)

- Perbaiki friction point dari feedback Fase 1
- Ekspansi ke 2-3 area baru berdasarkan pelajaran dari pilot
- Mulai uji model komisi otomatis

### 7.4 Fase 3: Scale Decision (bulan 10-18)

- Evaluasi apakah model bisa di-franchise ke operator lokal
- Pertimbangkan integrasi pembayaran digital
- Bangun playbook onboarding mitra yang bisa direplikasi

---

## 8. Product Principles

1. **Single App, Dual Role**
   Satu aplikasi untuk customer dan mitra. Tidak perlu dua app terpisah.

2. **Local-First by Default**
   Data utama pengguna berada di perangkat sendiri. Ini adalah keunggulan privasi, bukan keterbatasan.

3. **Transparent Pricing, Always**
   Tarif per-km dan estimasi total harga selalu tampil sebelum order. Tidak ada surprise charge.

4. **Mitra Is a Partner, Not an Asset**
   TRIP tidak memperlakukan mitra sebagai aset yang bisa dialokasikan sesuka algoritma. Mitra memiliki kontrol nyata.

5. **Lightweight by Design**
   Setiap fitur dievaluasi dari dampak biaya operasional. Kalau ada cara lebih ringan, pilih itu.

6. **Trust Through Transparency**
   Audit lokal, riwayat order yang bisa diekspor, dan mekanisme dispute yang jelas adalah pondasi kepercayaan.

7. **Build for the Field, Not for the Demo**
   Koneksi 3G, ponsel mid-range, baterai 20% — produk harus bekerja dalam kondisi nyata di lapangan, bukan hanya di kantor.

8. **Just Fair**
   Setiap aturan produk harus adil untuk tiga pihak sekaligus: driver, customer, dan pengembang. Tidak boleh ada biaya, punishment, atau fitur yang berat sebelah.

9. **No Work, No Pay**
   Driver tidak boleh menerima penalti hanya karena sedang offline. Kehadiran online adalah pilihan sadar, bukan kewajiban permanen.

10. **Warmth Wins**
   Produk harus terasa ramah, humble, dan hangat. Interaksi tidak boleh terasa dingin seperti dispatch machine semata.

---

## 9. Scope

### 9.1 In Scope — MVP

**Core Experience:**
- Satu aplikasi mobile untuk customer dan mitra
- Onboarding role selection dan role switching
- Customer: lihat mitra online sekitar, atur titik jemput/antar, tetapkan tarif offer per-km
- Mitra: atur tarif dasar per-km, aktifkan online, terima/tolak order
- Estimasi harga berdasarkan jarak (haversine) dan tarif yang berlaku
- Status order: pending, accepted, on the way, on trip, completed, canceled

**Communication (External Handoff):**
- Buka Google Maps / app maps default untuk navigasi
- Buka dialer untuk telepon langsung
- Buka WhatsApp jika nomor tersedia

**Audit & Keamanan Lokal:**
- Folder `AUDIT` lokal per device
- Riwayat order, event tarif, event status, metadata handoff
- Lock via PIN/biometric perangkat untuk akses data sensitif

**Monetisasi Dasar:**
- Pencatatan nilai transaksi per order
- Log komisi yang harusnya dipungut (untuk rekap manual di fase awal)

### 9.3 Strategic Expansion Direction

Fase setelah MVP akan mematangkan Carrier App Project ke arah berikut:

- **Freelance driver economy**
  Pengguna biasa bisa beralih menjadi driver ketika memang siap membawa penumpang, misalnya saat pulang kerja untuk menutup biaya bensin.
- **Community ride coordination**
  Skenario nebeng teman kantor atau perjalanan komunitas dengan harga yang bisa dinegosiasi tetap didukung dalam koridor fairness policy produk.
- **Multi-vehicle service**
  Motor, mobil, bajaj, dan angkot didukung sebagai kategori kendaraan yang berbeda. Motor bersifat personal ride, sedangkan mobil/bajaj/angkot punya model harga per kursi/orang.
- **Seat-based pricing**
  Untuk mobil dan bajaj, driver dapat menetapkan tarif dasar per km untuk 1 penumpang pertama dan tarif tambahan per penumpang per km.
- **Fair waiting**
  Setelah driver tiba di pickup, 5 menit pertama gratis. Setiap kelipatan 5 menit berikutnya dapat menambah waiting charge. Sebaliknya, jika driver tidak bergerak dari titik awal setelah accepted, customer mendapat pengurang tarif dengan formula simetris.
- **Safety preferences**
  Customer perempuan dapat mengaktifkan preferensi driver perempuan untuk setiap pemesanan.
- **Friendly service layer**
  Aplikasi aktif mengingatkan barang bawaan, kondisi perjalanan, dan percakapan kecil yang sopan untuk membangun rasa aman dan nyaman.
- **Safety active-order mode**
  Saat order aktif, aplikasi dapat masuk ke mode standby background terbatas untuk update lokasi periodik dan SOS.

### 9.2 Out of Scope — MVP

- Payment gateway dan wallet internal
- Promo dan discount engine
- OTP SMS berbayar
- In-app VoIP dan chat real-time
- In-app routing/navigation engine
- Centralized live dispatch engine
- Dynamic pricing algorithm
- Rating/reputation system kompleks
- Enterprise admin dashboard
- Compliance reporting otomatis
- Komisi otomatis / auto-settlement

---

## 10. Target Users dan Segmentasi

### 10.1 Customer (Penumpang)

**Primary segment — MVP:**
Pengguna di kota menengah yang mau memesan ojek tapi supply Gojek/Grab di area mereka sering tidak ada atau lama.

**Secondary segment:**
Pengguna yang lebih prefer komunikasi langsung dengan driver dan transparansi harga.

**Bukan target MVP:**
Pengguna di Jakarta/Surabaya pusat kota yang sudah punya banyak pilihan — mereka butuh alasan kuat untuk berpindah ekosistem.

### 10.2 Mitra (Driver)

**Primary segment — MVP:**
Pengemudi ojek yang sudah aktif (ojek pangkalan, atau mitra platform lain paruh waktu) yang frustrasi dengan sistem algoritmik dan ingin penghasilan tambahan yang lebih terkontrol.

**Bukan target MVP:**
Driver full-time yang 100% bergantung pada platform — mereka butuh supply order konsisten yang belum bisa dijanjikan TRIP di fase awal.

### 10.3 Operator Daerah (Target Jangka Menengah)

Individu atau badan usaha lokal yang ingin mengoperasikan TRIP di area mereka sebagai franchise atau white-label.

---

## 11. Proposed Product Model

### 11.1 Positioning

TRIP pada fase awal adalah:

> **Ride Coordination Platform — local-first, transparent, community-driven**

Bukan:
> ~~Fully centralized ride-hailing marketplace~~

Bukan juga:
> ~~Pure P2P app tanpa infrastruktur sama sekali~~

### 11.2 Perbedaan Kunci dengan Ojek Online Tradisional

| Aspek | Ojek Online Tradisional | TRIP |
|-------|------------------------|------|
| Dispatch | Algoritma terpusat | Direct match by proximity |
| Tarif | Platform-defined | Mitra + customer define |
| Data lokasi | Disimpan di server platform | Ephemeral, lokal di device |
| Komunikasi | In-app proprietary | WhatsApp/dialer |
| Payment | Platform settlement | Cash (fase awal) |
| Komisi | 15-30% | 10-12% (sesuai regulasi) |
| Area target | Kota besar, density tinggi | Kota menengah, underserved |

---

## 12. Regulatory Compliance Path

### 12.1 Kerangka Regulasi yang Berlaku

- **KP 1001/2022:** Batas komisi 15% + 5% kesejahteraan
- **UU PDP No. 27/2022:** Perlindungan data pribadi
- **Regulasi transportasi lokal:** Izin operasional per daerah

### 12.2 Pendekatan Compliance TRIP

**Fase MVP (lokal, skala kecil):**
- Beroperasi dalam kerangka agen/perantara informal di area pilot
- Dokumentasikan semua transaksi untuk audit trail
- Tidak perlu lisensi platform formal jika masih dalam skala pilot terbatas

**Fase Scale:**
- Daftarkan TRIP sebagai platform ojek online resmi sesuai prosedur Kemenhub
- Implementasikan reporting dashboard sesuai KP 1001/2022
- Tunjuk DPO jika platform mulai melakukan pemantauan sistematis berskala besar

### 12.3 Keunggulan Compliance dari Arsitektur Local-First

TRIP secara struktural lebih mudah comply dengan UU PDP karena:
- Tidak menyimpan histori lokasi penuh di server
- Data pribadi berada di kontrol pengguna sendiri
- Minimal data processing di sisi platform

Ini harus dikomunikasikan sebagai **nilai lebih** kepada pengguna dan regulator.

---

## 13. Assumptions dan Constraints

### 13.1 Assumptions

- Pengguna bersedia memberikan izin lokasi
- Mayoritas target mitra memiliki smartphone Android mid-range dan koneksi 3G/4G
- WhatsApp terpasang di mayoritas device target
- Google Maps terpasang di mayoritas device target Android
- Mitra target bersedia menerima pembayaran cash di fase awal
- Relay lightweight dapat dioperasikan di bawah Rp 2 juta/bulan

### 13.2 Constraints

- Komisi tidak boleh melewati 15% dari nilai trip (regulasi)
- Tidak boleh membangun in-house routing engine atau call stack di MVP
- Budget infrastruktur awal sangat terbatas
- Tim pengembangan harus bisa move fast — tidak ada luxury untuk arsitektur over-engineered

---

## 14. Business Rules

| ID | Rule |
|----|------|
| BR-001 | Komisi TRIP maksimal 12% dari nilai perjalanan yang selesai |
| BR-002 | Mitra dapat menetapkan tarif per-km sendiri |
| BR-003 | Customer dapat menetapkan tarif offer per-km |
| BR-004 | Estimasi harga harus tampil sebelum order dikirim |
| BR-005 | Platform tidak menyimpan histori lokasi penuh di server |
| BR-006 | Setiap event penting wajib masuk audit lokal |
| BR-007 | Routing, call, dan chat menggunakan app eksternal yang sudah ada di perangkat |
| BR-008 | Order hanya dianggap selesai jika customer dan mitra mengkonfirmasi |
| BR-009 | Satu order aktif per pasangan customer-mitra pada satu waktu |
| BR-010 | Data mitra dan customer tidak dijual atau dibagikan ke pihak ketiga |
| BR-011 | Semua user dapat mengaktifkan mode customer dan driver dalam satu aplikasi |
| BR-012 | Tidak ada penalti hanya karena driver offline; punishment hanya boleh lahir dari perilaku bermasalah yang terverifikasi |
| BR-013 | Driver baru boleh online jika data kendaraan, legalitas, dan kelengkapan minimum untuk jenis kendaraannya sudah valid |
| BR-014 | Motor wajib punya helm tambahan; mobil/bajaj/angkot wajib mendukung model kapasitas penumpang yang jelas |
| BR-015 | Waiting policy harus simetris: customer bisa dikenai biaya tunggu setelah batas gratis, dan customer juga berhak mendapat pengurang jika driver terlalu lama diam setelah accept |
| BR-016 | Untuk mobil/bajaj, tarif dapat terdiri dari tarif dasar per km dan tarif tambahan per penumpang per km |
| BR-017 | Customer perempuan dapat mengaktifkan preferensi driver perempuan sebagai toggle pemesanan |
| BR-018 | Secara default sistem memberi rating 5 bintang saat trip selesai kecuali customer memberi rating manual |
| BR-019 | Pembayaran yang direncanakan mencakup cash, transfer manual, dan payment gateway dengan biaya admin dibagi dua |
| BR-020 | Maps integration harus memprioritaskan Google Maps dan Apple Maps berbasis latitude/longitude tanpa API berbayar |
| BR-021 | Driver verification MVP bersifat deklaratif dan minimum-valid, bukan KYC legal penuh |
| BR-022 | Data driver yang tidak lengkap, tidak konsisten, atau mencurigakan tidak boleh lolos ke status ready-to-online |

---

## 15. Success Metrics

### 15.1 Metrics Bisnis (6 bulan pertama)
- Total trip selesai: **target 1.000+ trip**
- Mitra aktif (≥1 trip/minggu): **target 80+**
- Customer aktif (≥1 trip/bulan): **target 300+**
- Revenue dari komisi: **target Rp 10 juta+/bulan**
- Biaya operasional backend: **< Rp 3 juta/bulan**

### 15.2 Metrics Produk
- Waktu dari buka app ke order accepted: **target < 3 menit**
- Order completion rate: **target > 70%**
- Order cancel rate (sisi mitra): **target < 15%**
- % customer berhasil menemukan minimal 1 mitra online: **target > 80%**

### 15.3 Metrics Teknis
- Crash-free session rate: **> 99%**
- App startup time: **< 2 detik**
- Discovery render time: **< 3 detik**
- Konsistensi state order: **tidak ada data loss**

---

## 16. Risks

### 16.1 Risiko Bisnis

| Risiko | Tingkat | Mitigasi |
|--------|---------|----------|
| Cold start: supply dan demand tidak seimbang | Tinggi | Akuisisi mitra sebelum launch customer |
| Fraud dan spoofing tanpa anti-fraud kuat | Sedang | Velocity check, rate limiting dari awal |
| Mitra churn karena supply order rendah | Sedang | Komunikasi ekspektasi yang jelas sejak onboarding |
| Regulasi platform baru tidak clear | Rendah | Mulai kecil, bangun relasi dengan regulator daerah |

### 16.2 Risiko Produk

| Risiko | Tingkat | Mitigasi |
|--------|---------|----------|
| Discovery tidak konsisten | Tinggi | Relay tipis reliable + empty state yang informatif |
| Fleksibilitas tarif → friction bargaining | Sedang | Model offer-vs-base, bukan free negotiation |
| Audit hilang jika device rusak | Sedang | Export manual, backup opsional di fase 2 |
| Ekspektasi setara Gojek/Grab | Sedang | Komunikasi positioning TRIP yang jelas sejak onboarding |

---

## 17. MVP Release Plan

### Phase 0 — Internal Readiness (sebelum launch)
- Selesaikan development core MVP
- Rekrut 50-100 mitra pilot
- Siapkan jalur support (WhatsApp number untuk dispute)
- Siapkan dokumentasi untuk pengguna

### Phase 1 — Validation Launch (bulan 1-3)
**Fokus:** Apakah produk bisa digunakan? Apakah mitra dan customer bisa bertransaksi?

Fitur wajib:
- dual role single app,
- location + nearby discovery,
- tarif per-km setting,
- order request/accept/complete,
- external handoff (maps, dialer, WhatsApp),
- audit lokal.

### Phase 2 — Stability & Trust (bulan 4-6)
**Fokus:** Apakah produk bisa dipercaya?

Tambahan:
- anti-spoofing dasar (velocity check, rate limit),
- export audit,
- riwayat order yang lebih lengkap,
- reputasi sederhana (bintang 1-5),
- UX improvement dari feedback phase 1,
- onboarding kelayakan driver dan validasi kendaraan,
- top recommendation driver yang lebih bernilai dari sisi harga dan layanan.

### Phase 3 — Scale Decision (bulan 7-12)
**Fokus:** Apakah model ini bisa direplikasi?

Evaluasi:
- relay service permanen,
- integrasi payment QRIS,
- admin dashboard sederhana untuk operator,
- model franchise/operator daerah,
- waiting fairness automation,
- women preference toggle,
- background safety mode + SOS,
- Firebase-backed push notification dan temporary chat.

---

## 18. Open Questions

1. Area pilot mana yang paling ideal untuk launched pertama? (density, supply ojek, penetrasi kompetitor)
2. Apakah model komisi cash atau digital lebih cocok untuk mitra target di fase awal?
3. Bagaimana struktur tim support di fase awal yang cost-effective?
4. Apakah perlu perjanjian mitra formal sebelum onboarding, atau cukup ToS digital?
5. Bagaimana strategi komunikasi ke mitra pangkalan yang mungkin skeptis terhadap platform baru?

---

## 19. Final Decision

Carrier App Project akan dibangun sebagai **ride coordination platform** — bukan platform ride-hailing tradisional. Dengan pendekatan **single app, dual role, local-first, transparent pricing**, dan **lightweight infrastructure**, produk ini punya peluang nyata untuk menciptakan ekosistem transportasi yang lebih fair, lebih murah dioperasikan, dan lebih dapat dipercaya oleh kedua sisi pasar.

**Kunci keberhasilan bukan pada teknologinya, tetapi pada eksekusi go-to-market dan pembangunan trust di area pilot.**

Teknologi adalah enabler. Bisnis adalah tujuan.

---

*Versi: 1.0 | CEO-reviewed | Approved for execution*
