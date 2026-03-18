# Carrier App Project

## Sprint 3 Issue Specs

Dokumen ini memecah backlog sprint 3 menjadi issue spec yang bisa langsung dieksekusi agent atau engineer berikutnya.

Prinsip sprint 3:
- fokus pada order core end-to-end
- sprint ini harus menghasilkan jalur utama dari booking draft sampai terminal state
- fitur optional pilot tidak boleh mengganggu stabilitas core order lifecycle

---

## ENG-009

### Judul
`ENG-009` Booking form, quote builder, dan review screen

### Tujuan
Membuat customer bisa memulai pemesanan dengan data yang valid, quote yang transparan, dan review sebelum submit.

### Scope
- booking form
- service type selector
- adaptive fields per service
- booking intent
- draft validation
- quote builder
- review screen

### Out of Scope
- relay signaling
- incoming order screen
- active trip

### Dependency
- `ENG-007`

### Deliverable Minimum
- customer bisa pilih `motor` atau `mobil`
- form mendukung field adaptif:
  - `motor`
  - `mobil`
- quote menampilkan breakdown minimum:
  - base trip
  - pickup surcharge
  - gear discount bila relevan
  - payment method
  - total estimasi
- review screen membekukan field penting sebelum submit

### Completion Criteria
- booking draft valid bisa dibuat secara lokal
- draft invalid ditolak dengan state form yang jelas
- quote dan review sudah siap dikonsumsi oleh signaling sprint 3 tanpa redesign besar

### Catatan Implementasi
- jangan hitung ulang quote diam-diam setelah user confirm
- belum perlu broadcast atau retry network di ticket ini

---

## ENG-010

### Judul
`ENG-010` Order request/response signaling dan waiting response state

### Tujuan
Menyambungkan booking customer ke mitra lewat relay dengan state tunggu yang jelas.

### Scope
- `OrderSignalGateway` request/response minimum
- submit order request
- waiting response state
- timeout 60 detik
- auto booking sequential retry baseline
- response state untuk manual vs auto

### Out of Scope
- incoming order UI final di sisi mitra
- contact reveal
- trip progression

### Dependency
- `ENG-009`

### Deliverable Minimum
- customer bisa submit order request ke target mitra
- state `waiting response` tersedia
- timeout 60 detik berjalan
- manual select dan auto booking punya jalur response yang berbeda sesuai dokumen
- retry state auto booking sudah punya fondasi minimum

### Completion Criteria
- order request benar-benar dikirim via relay
- customer dapat menerima accept/reject/expired response secara konsisten
- auto booking tidak melakukan broadcast ke banyak mitra sekaligus

### Catatan Implementasi
- push notification opsional jangan dijadikan dependency
- source of truth response tetap payload relay dan local order state

---

## ENG-011

### Judul
`ENG-011` Incoming order, accept/reject, dan contact reveal

### Tujuan
Membuat mitra bisa menerima order, mengambil keputusan dengan informasi lengkap, lalu membuka komunikasi yang sah setelah accept.

### Scope
- incoming order screen
- countdown 60 detik
- accept / reject flow
- reject reason
- contact reveal setelah accept
- handoff action enablement setelah reveal

### Out of Scope
- temporary chat
- FCM wake-up optional
- active trip milestone progression

### Dependency
- `ENG-010`

### Deliverable Minimum
- mitra menerima incoming order dari relay
- layar incoming order menampilkan konteks minimum:
  - customer display
  - service type
  - booking intent
  - rider declaration bila ada
  - payment method
  - pickup, destination, dan breakdown biaya
- mitra bisa accept atau reject dengan reason yang benar
- contact reveal hanya terjadi setelah accept dan hanya untuk pasangan order aktif

### Completion Criteria
- accept/reject mengubah order state secara konsisten di kedua sisi
- countdown timeout tidak meninggalkan state ambigu
- nomor penuh tidak bocor sebelum contact reveal

### Catatan Implementasi
- incoming order harus memberi cukup konteks untuk keputusan mitra, jangan terlalu tipis
- contact reveal targeted payload only, tidak masuk discovery cache

---

## ENG-012

### Judul
`ENG-012` Active trip, cancel/no-show/mismatch, dan recovery

### Tujuan
Membuat order yang sudah diterima bisa berjalan sampai terminal state dengan fairness dan jalur keluar yang jelas.

### Scope
- active trip screen
- milestone progression minimum
- waiting state dasar
- cancel flow
- no-show / mismatch boundary
- recovery ke trip aktif saat app restart
- terminal state update

### Out of Scope
- history list final
- audit export UI
- transaction log export

### Dependency
- `ENG-011`

### Deliverable Minimum
- active trip screen muncul setelah order accepted
- milestone utama bisa dilalui:
  - accepted
  - on the way
  - arrived at pickup
  - on trip
  - completed / canceled
- cancel reason mengikuti matrix yang sudah dikunci
- no-show hanya valid setelah arrived at pickup
- mismatch dan unsafe cancel punya jalur reason yang jelas
- app restart bisa kembali ke trip aktif bila order non-terminal masih ada

### Completion Criteria
- satu order bisa berjalan end-to-end dari request sampai terminal
- recovery tidak kehilangan active order yang masih valid
- cancel/no-show/mismatch tidak menghasilkan state ganda atau order menggantung

### Catatan Implementasi
- sprint ini fokus stabilitas order core, bukan polish penuh
- kalau ada waktu sisa, prioritaskan recovery dan terminal consistency

---

## Order of Execution

1. `ENG-009`
2. `ENG-010`
3. `ENG-011`
4. `ENG-012`

Rule:
- jangan mulai `ENG-013` sebelum `ENG-012` selesai
- jika ada waktu sisa sprint 3, pakai untuk hardening order core, bukan membuka fitur optional seperti chat atau women preference
