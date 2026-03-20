# Research Report — Ruang Masalah Platform Ojek Online di Indonesia
## Analisis & CEO Review: Implikasi untuk Carrier

**Versi:** 1.0 (CEO-reviewed)
**Status:** Final — dasar keputusan strategi produk dan bisnis Carrier

---

## Catatan CEO

> Setelah membaca laporan riset awal ini secara menyeluruh, saya ingin mempertegas beberapa hal kepada seluruh tim sebelum masuk ke detail. Laporan ini **sudah solid secara akademis**, tetapi ada beberapa blind spot bisnis yang perlu diselesaikan sebelum dokumen ini layak dijadikan fondasi keputusan produk.
>
> Pertama: riset ini terlalu banyak mendeskripsikan masalah platform besar (Gojek/Grab) dan kurang menjawab pertanyaan: **"apakah Carrier benar-benar memiliki ruang yang layak untuk ditempati di antara kekosongan yang ada?"**
>
> Kedua: ada kecenderungan dokumen ini memperlakukan pendekatan "local-first, no-heavy-backend" sebagai solusi universal. Padahal di lapangan, **pendekatan itu sendiri membawa kelas masalah baru** yang harus kita akui dan antisipasi sejak awal — bukan setelah MVP diluncurkan.
>
> Ketiga: dokumen ini hampir tidak membahas **monetisasi** dan **unit economics** untuk Carrier sendiri — padahal itulah inti dari apakah bisnis ini bisa hidup jangka panjang.
>
> Review ini melengkapi laporan riset asli dengan perspektif bisnis dan keputusan strategis yang hilang.

---

## 1. Konteks Operasional yang Membentuk Ruang Masalah

Platform ojek online bukan sekadar UI pemesanan. Ini adalah **marketplace geospasial real-time** yang terus-menerus mencocokkan dua populasi bergerak — penumpang dan pengemudi — di bawah banyak tujuan sekaligus: waktu tunggu, utilisasi pengemudi, keadilan distribusi order, penanganan pembatalan, keselamatan, dan efisiensi biaya.

Pada skala besar, lapisan dispatch/matching sangat berat secara komputasi: cost matrix, shortest-path real-time, refresh saat kondisi berubah. Inilah sumber biaya infrastruktur yang dominan di platform tradisional.

Namun yang sering diabaikan: **masalah ini tidak hanya ada pada skala besar.** Bahkan di skala kecil pun, marketplace dua sisi memerlukan:
- mekanisme discovery yang reliable,
- protokol order yang tidak ambiguous,
- perlindungan terhadap fraud dan spoofing,
- mekanisme dispute yang dapat dipercaya oleh kedua pihak.

Tanpa keempat hal ini, produk tidak akan dipercaya — berapapun besarnya diskon atau semenarik apapun UI-nya.

### 1.1 Kerangka Regulasi Indonesia yang Berlaku

Regulator Indonesia membatasi biaya platform untuk ojek online:

- **Biaya sewa penggunaan aplikasi:** maksimal **15%** dari tarif perjalanan
- **Biaya dukungan kesejahteraan:** maksimal **5%** tambahan, dengan tujuan penggunaan yang ditentukan (asuransi keselamatan, pusat dukungan, bantuan operasional)
- **Tarif:** dibatasi rentang batas bawah/atas per-km dan tarif minimum, berdasarkan zonasi (Zona I/II/III)

Kerangka ini juga mengharuskan pelaporan berkala, dashboard regulasi, dan laporan keuangan yang diaudit untuk platform yang beroperasi di skala tertentu.

**Implikasi untuk Carrier:** Model monetisasi Carrier harus dirancang dari awal untuk **fit dalam kerangka 15%+5% ini**, bukan sebagai afterthought compliance. Setiap keputusan pricing harus mengantisipasi batas regulasi ini.

### 1.2 Rezim Perlindungan Data (UU PDP No. 27/2022)

Platform ride-hailing memproses data pribadi sensitif: jejak lokasi, artefak identitas/KYC, telemetri perilaku, catatan pembayaran. UU PDP mengatur:

- konsep pengendali dan pemroses data,
- kewajiban DPO saat pemantauan sistematis berskala besar,
- kesiapan respons insiden.

**Implikasi untuk Carrier:** Pendekatan local-first **mengurangi** beban kepatuhan PDP karena histori lokasi tidak disimpan terpusat — ini adalah **keunggulan struktural** yang harus dikomunikasikan eksplisit kepada pengguna dan regulator. Namun saat Carrier tumbuh dan mulai mengumpulkan data agregat, kewajiban governance tetap akan muncul.

---

## 2. Analisis Masalah Berlapis: Tiga Pihak, Satu Ekosistem

### 2.1 Masalah dari Sisi Pengembang/Operator

**Biaya dan kompleksitas yang tinggi di model tradisional:**

- Server real-time, matching engine, routing engine, observability, anti-fraud, compliance, support
- API pihak ketiga berbasis penggunaan: maps/routing/geocoding (Google Maps Platform), OTP/SMS (Twilio), notifikasi push
- Kebutuhan talenta spesialis: data engineering, ML ops, dispatch fairness tuning
- Beban regulasi: pelaporan berkala, audit keuangan, dashboard regulator

**Namun ada biaya yang sering diremehkan di model "ringan" sekalipun:**

- Cold start problem: marketplace dua sisi memerlukan supply dan demand secara bersamaan agar berguna
- Trust infrastructure: bahkan tanpa server berat, sistem tetap perlu mekanisme untuk memvalidasi identitas dan mencegah abuse
- Support overhead: dispute order, complaint driver, masalah koordinasi — semua ini memerlukan jalur eskalasi yang jelas
- Retention: jika experience tidak konsisten, churn sangat cepat terjadi di kedua sisi

**Kesimpulan CEO:** Model low-backend Carrier **menyelesaikan masalah biaya infrastruktur teknis**, tetapi **tidak otomatis menyelesaikan masalah biaya operasional bisnis** seperti support, trust, dan retention. Anggaran untuk ketiga hal ini harus ada sejak awal.

### 2.2 Masalah dari Sisi Mitra (Driver)

**Masalah yang terdokumentasi:**

- Effective take rate lebih tinggi dari angka nominal (15% regulasi) karena biaya operasional tersembunyi
- Pendapatan tidak stabil akibat variasi demand dan mekanisme distribusi order yang tidak transparan
- Tekanan untuk selalu online mempengaruhi work-life balance
- Ketidakjelasan mekanisme penalti dan bonus
- Ponsel lama atau low-end yang tidak mendukung aplikasi berat
- Aksi kolektif ada tapi representasi formal lemah

**Apa yang diinginkan mitra di lapangan:**

- Kontrol lebih besar atas tarif dan jam kerja
- Transparansi distribusi order
- Jalur komunikasi langsung dengan customer
- Proses sederhana tanpa dashboard rumit
- Penghasilan yang dapat diprediksi

**Implikasi untuk Carrier:** Positioning Carrier kepada mitra harus bukan "platform baru dengan potongan lebih kecil" saja — karena itu mudah ditiru. Positioningnya harus **"kontrol lebih besar, transparansi lebih tinggi, dan beban lebih ringan"**. Ini adalah proposisi nilai yang lebih defensible.

### 2.3 Masalah dari Sisi Customer (Penumpang)

**Masalah yang terdokumentasi:**

- Harga tidak konsisten dan tidak transparan saat surge pricing
- Tidak bisa memilih driver karena alokasi otomatis
- Friction di titik penjemputan (koordinasi meeting point, akurasi pin)
- Masalah trust dan safety (kondisi kendaraan, variasi kualitas)
- Proliferasi biaya tambahan yang mengikis kepercayaan tarif

**Yang sering diabaikan:** Tidak semua customer ingin negosiasi harga. Riset lapangan Jakarta menunjukkan bahwa **banyak pengguna justru memilih ojek online karena menghindari tawar-menawar** dengan ojek pangkalan. Fitur negosiasi harus didesain sebagai **opsional dan struktural** — bukan free-form bargaining.

**Implikasi untuk Carrier:** Customer Carrier bukan hanya mereka yang tidak puas dengan Gojek/Grab. Target yang lebih realistis adalah **segmen pengguna di area dengan supply rendah platform besar** atau **pengguna yang ingin transparansi lebih tinggi** tanpa friction tambahan.

---

## 3. Analisis Peluang Pasar Carrier

### 3.1 Gap yang Bisa Diisi Carrier

Berdasarkan riset, ada beberapa gap nyata yang belum terisi dengan baik:

| Gap | Ukuran Peluang | Relevansi untuk Carrier |
|-----|----------------|----------------------|
| Kota tier 2-3 dengan supply platform besar rendah | Tinggi | Platform besar fokus pada kota besar — ada ruang di kota menengah |
| Mitra yang lelah dengan sistem algoritmik tertutup | Sedang | Proposisi transparansi Carrier relevan |
| Customer yang butuh koordinasi langsung dengan driver | Sedang | External handoff ke WhatsApp/dialer adalah diferensiasi |
| Operator lokal yang ingin white-label platform ringan | Potensial jangka menengah | Carrier bisa jadi infrastruktur untuk operator daerah |

### 3.2 Ancaman yang Harus Diakui

| Ancaman | Tingkat Risiko | Mitigasi |
|---------|----------------|----------|
| Network effect Gojek/Grab terlalu kuat | Tinggi | Fokus pada segmen/area yang mereka kurang layani |
| Cold start supply-demand di area baru | Tinggi | Strategi akuisisi mitra harus mendahului akuisisi customer |
| Pengguna tidak mau pindah ekosistem (payment, rewards) | Sedang | Carrier tidak perlu payment internal di MVP — justru ini keunggulan |
| Fraud dan abuse tanpa backend anti-fraud | Sedang | Antisipasi sejak desain, bukan afterthought |
| Regulasi untuk platform baru yang belum clear | Rendah-Sedang | Mulai kecil, bangun relasi dengan regulator daerah |

### 3.3 Positioning yang Realistis

Carrier **tidak sedang bersaing dengan Gojek/Grab** secara langsung. Carrier sedang menciptakan kategori baru:

> **"Ride coordination platform untuk area dan komunitas yang underserved oleh platform besar"**

Ini bukan kelemahan — ini adalah strategi go-to-market yang defensible untuk fase awal.

---

## 4. Model Fraud dan Abuse: Realita Lapangan

### 4.1 Pola Fraud yang Terdokumentasi

**Ghost app / location spoofing:** Pelaku memalsukan lokasi untuk menangkap order bernilai tinggi tanpa benar-benar berada di sana. Ini merusak fairness dan kepercayaan ekosistem.

**Order manipulation:** Pembuatan order palsu untuk mengumpulkan bonus, rating manipulation melalui akun palsu.

**Driver no-show:** Menerima order tapi tidak datang untuk mempertahankan posisi di sistem.

### 4.2 Implikasi untuk Carrier (Local-First Architecture)

Model local-first Carrier secara struktur **lebih rentan** terhadap spoofing dibandingkan platform dengan server-side validation. Ini bukan alasan untuk tidak melanjutkan, tetapi harus menjadi **prioritas desain dari awal**, bukan sprint ke-4.

**Kontrol minimum yang wajib ada sejak MVP:**

- Validasi koordinat (range check, velocity check — apakah lokasi bergerak dengan kecepatan yang masuk akal?)
- Rate limiting publish presence dari sisi relay
- Timestamp validation untuk menolak payload lama
- Basic device fingerprinting untuk mendeteksi multi-account abuse

**Kontrol yang bisa ditambah di fase berikutnya:**

- Cross-validation antara lokasi mitra dan customer saat order berjalan
- Anomaly detection sederhana berbasis pola (terlalu banyak cancel, terlalu banyak accept-reject dalam waktu singkat)

---

## 5. Efek Tingkat Kedua: Trade-Off yang Tidak Bisa Dihindari

Setiap keputusan desain membawa trade-off yang harus diakui secara eksplisit:

### 5.1 Negosiasi Harga vs. Kepastian Booking

**Pro negosiasi:** Mitra dan customer punya kontrol lebih. Tarif bisa menyesuaikan kondisi lapangan.

**Kontra negosiasi:** Menambah friction. Meningkatkan waktu booking. Bisa mengulang masalah ojek pangkalan (tawar-menawar yang tidak nyaman).

**Keputusan yang disarankan:** Model Carrier bukanlah negosiasi real-time. Model yang lebih tepat adalah **"offer vs. base price matching"** — customer menetapkan batas atas tarif, mitra menetapkan tarif minimum, sistem mencocokkan. Ini transparan, cepat, dan tidak memerlukan bargaining chat.

### 5.2 Local-First vs. Reliability

**Pro local-first:** Biaya infrastruktur rendah, privasi lebih baik, tidak bergantung pada koneksi server.

**Kontra local-first:** Discovery tidak konsisten saat relay down. State sync bermasalah saat kedua device tidak online bersamaan. Audit rentan hilang jika device rusak.

**Keputusan yang disarankan:** Terima trade-off ini secara eksplisit. Komunikasikan kepada pengguna. Siapkan recovery flow yang jelas.

### 5.3 Transparansi Tarif vs. Persepsi Harga Mahal

Ketika tarif per-km tampil eksplisit, pengguna punya referensi untuk membandingkan. Ini bisa menjadi pisau bermata dua — transparansi yang baik tapi persepsi harga bisa lebih sensitif.

**Keputusan yang disarankan:** Tampilkan estimasi total harga (bukan hanya per-km) sebagai angka utama. Per-km sebagai informasi sekunder untuk transparansi.

---

## 6. Implikasi Bisnis untuk Carrier: Ringkasan Eksekutif

### Yang Sudah Tepat

- Pendekatan local-first mengurangi biaya infrastruktur secara signifikan
- External handoff menghindari biaya maps, VoIP, dan chat
- Single app dual-role menekan biaya pengembangan
- Fokus pada transparansi tarif menjawab keluhan nyata pengguna

### Yang Harus Ditambahkan

1. **Strategi monetisasi yang eksplisit** — Carrier harus memiliki model pendapatan yang jelas sejak MVP, bahkan jika sederhana. Tanpa ini, tidak ada path ke sustainability.

2. **Strategi go-to-market yang geographic** — Tentukan 1-2 kota/area pilot sejak awal. Fokus akuisisi mitra sebelum customer. Jangan mencoba cover seluruh Indonesia.

3. **Trust & safety baseline** — Fraud prevention bukan fitur fase 2. Ini harus ada sejak MVP, meski dalam bentuk paling ringan sekalipun.

4. **Jalur dispute yang jelas** — Customer dan mitra harus tahu harus kemana kalau ada masalah. Bahkan jika ini hanya WhatsApp channel atau form sederhana.

5. **Path ke compliance regulasi** — Carrier harus bisa menjawab pertanyaan regulator jika diminta, bahkan di fase awal. Dokumentasi internal harus mengantisipasi ini.

---

## 7. Kesimpulan dan Rekomendasi Strategis

Ruang masalah yang diidentifikasi dalam riset ini **real dan signifikan**. Platform ride-hailing tradisional memang membawa overhead besar yang membuat operator kecil sulit bersaing.

Carrier memiliki **proposisi yang valid**: lebih ringan, lebih transparan, lebih fair untuk mitra dan customer, dengan biaya operasional yang jauh lebih rendah di fase awal.

**Namun keberhasilan Carrier tidak otomatis dari pendekatan teknologinya saja.** Keberhasilan ditentukan oleh:

1. **Eksekusi go-to-market yang sangat focused** — pilih satu area, bangun supply dulu, baru buka untuk customer.

2. **Trust yang dibangun sejak hari pertama** — bahkan tanpa backend berat, Carrier harus menjadi platform yang bisa dipercaya oleh kedua sisi.

3. **Model bisnis yang sustainable** — revenue dari komisi (dalam batas regulasi) harus cukup untuk menutup biaya operasional minimal: relay server, support, dan maintenance.

4. **Iterasi cepat berdasarkan feedback lapangan** — laporan riset ini adalah hipotesis. Validasi nyata hanya terjadi setelah produk ada di tangan pengguna sungguhan.

> **Bottom line CEO:** Carrier punya logika bisnis yang kuat. Eksekusikan dengan focused, mulai kecil tapi benar, dan pastikan monetisasi bukan afterthought.

---

*Dokumen ini merupakan versi revisi dari research report awal Carrier, diperkaya dengan analisis bisnis dan implikasi strategis untuk eksekusi produk. Versi: 1.0 | CEO-reviewed.*
