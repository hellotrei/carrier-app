# Carrier App Project

## Sprint 1 Issue Specs

Dokumen ini memecah backlog sprint 1 menjadi issue spec yang bisa langsung dieksekusi agent atau engineer berikutnya.

Prinsip sprint 1:
- fokus hanya pada fondasi pilot
- belum menyentuh relay, discovery, atau order signaling
- semua hasil sprint 1 harus mendukung gate `ready / not ready` dengan jelas

---

## ENG-001

### Judul
`ENG-001` Bootstrap app, navigation, dan SQLite init

### Tujuan
Menyediakan jalur start aplikasi yang stabil dari app launch sampai keputusan awal `onboarding / home / recovery`.

### Scope
- inisialisasi app startup
- root navigation minimum
- SQLite init dan app settings baseline
- bootstrap state untuk:
  - first install
  - existing profile
  - active order recovery pointer

### Out of Scope
- relay integration
- discovery
- order signaling
- screen business logic selain routing dasar

### Dependency
- tidak ada

### Deliverable Minimum
- bootstrap path `launch -> bootstrap`
- root route untuk:
  - `onboarding`
  - `customer_home`
  - `driver_home`
  - `active_trip`
- SQLite berhasil diinisialisasi sebelum repository dipakai
- app settings minimum tersedia untuk menyimpan role aktif dan active order pointer

### Completion Criteria
- app bisa start tanpa crash pada first install
- app bisa menentukan user harus ke onboarding atau home
- jika ada active order non-terminal di local state, bootstrap memprioritaskan recovery path

### Catatan Implementasi
- jangan tambahkan dependency baru selain yang memang sudah dipilih di dokumen
- navigation cukup minimum, tidak perlu polish UI penuh

---

## ENG-002

### Judul
`ENG-002` Repository inti dan migration baseline

### Tujuan
Menyediakan local persistence minimum agar sprint berikutnya tidak membangun flow di atas mock state.

### Scope
- migration baseline SQLite
- `UserRepository`
- `PricingRepository`
- `OrderRepository`
- `AuditRepository` baseline
- `TransactionRepository` baseline

### Out of Scope
- audit binary full export implementation
- CSV export final
- relay storage

### Dependency
- `ENG-001`

### Deliverable Minimum
- schema awal untuk user, pricing, orders, app settings
- pointer active order bisa disimpan dan dibaca ulang
- profile dan pricing bisa save/load/update
- order baseline bisa save/load/update/list history
- audit manifest baseline tersedia untuk append event nanti
- transaction log baseline tersedia untuk record/list nanti

### Completion Criteria
- contract repository sudah nyata, bukan placeholder
- migration baseline bisa dipakai app bootstrap
- entity inti sprint 1 dan sprint 2 punya storage path yang jelas

### Catatan Implementasi
- ikuti type dan contract yang sudah dikunci di TSD
- jangan desain schema untuk phase 2 lebih dulu

---

## ENG-003

### Judul
`ENG-003` Onboarding, role switch, dan permission lokasi

### Tujuan
Membuat user baru bisa masuk ke app dengan flow awal yang jelas dan persisten.

### Scope
- onboarding intro minimum
- role selection
- role switch dari home
- permission lokasi foreground flow
- state denial / blocked / granted yang jelas

### Out of Scope
- nearby discovery
- online toggle
- relay-driven location behavior

### Dependency
- `ENG-001`

### Deliverable Minimum
- first install masuk onboarding
- user bisa pilih role utama
- active roles dan current role tersimpan lokal
- role switch tersedia dari home
- permission lokasi punya state:
  - granted
  - denied
  - blocked

### Completion Criteria
- setelah onboarding, user masuk ke home sesuai role
- role switch tidak perlu restart app
- denial lokasi tidak membuat app buntu; user tetap bisa lanjut ke state yang relevan

### Catatan Implementasi
- copy belum perlu final, tapi harus sudah mengikuti tone dasar
- permission screen harus informatif, bukan sekadar modal OS

---

## ENG-004

### Judul
`ENG-004` Basic profile, pricing settings, dan readiness gate

### Tujuan
Membuat user bisa menyimpan data minimum dan sistem sudah tahu kapan mitra belum boleh online.

### Scope
- basic profile screen
- pricing settings screen
- profile mutation minimum
- pricing validation minimum
- `validateDriverReadiness()`
- `validateOnlineReadiness()` integration ke gate UI

### Out of Scope
- go online / go offline ke relay
- discovery list
- incoming order

### Dependency
- `ENG-002`
- `ENG-003`

### Deliverable Minimum
- profile dasar bisa disimpan:
  - display name
  - legal full name bila dibutuhkan
  - gender declaration
  - favorite address baseline
- pricing bisa disimpan:
  - partner price per km
  - customer offer per km
- mitra yang belum lolos readiness mendapat gate reason yang jelas
- perubahan field kritikal diperlakukan sesuai aturan readiness

### Completion Criteria
- user bisa isi profile dan pricing tanpa mock storage
- mitra belum bisa dianggap `ready` bila syarat minimum belum terpenuhi
- gate reason bisa ditampilkan di home mitra pada sprint berikutnya tanpa redesign logic

### Catatan Implementasi
- pricing update pada sprint ini cukup lokal dulu
- belum perlu publish presence

---

## Order of Execution

1. `ENG-001`
2. `ENG-002`
3. `ENG-003`
4. `ENG-004`

Rule:
- jangan mulai `ENG-005` sebelum `ENG-004` selesai
- jika ada waktu sisa sprint 1, pakai untuk merapikan readiness gate dan bootstrap recovery, bukan membuka relay/discovery
