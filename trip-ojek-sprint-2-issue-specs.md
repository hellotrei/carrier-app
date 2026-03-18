# Carrier App Project

## Sprint 2 Issue Specs

Dokumen ini memecah backlog sprint 2 menjadi issue spec yang bisa langsung dieksekusi agent atau engineer berikutnya.

Prinsip sprint 2:
- fokus pada presence, discovery, dan home flow
- core relay sudah mulai dipakai, tetapi belum masuk order signaling penuh
- hasil sprint 2 harus membuat app siap untuk order core di sprint 3

---

## ENG-005

### Judul
`ENG-005` Supabase relay integration dan presence gateway

### Tujuan
Menyediakan jalur realtime minimum agar user bisa publish presence dan melakukan discovery nearby secara reliabel.

### Scope
- setup Supabase client untuk environment dev/staging/prod
- `PresenceGateway` implementation
- subscribe / publish / unpublish presence
- radius, TTL, dan freshness baseline
- relay connected state minimum

### Out of Scope
- order request/response signaling
- FCM wake-up notice
- temporary chat

### Dependency
- `ENG-004`

### Deliverable Minimum
- user mitra bisa publish presence snapshot
- customer bisa subscribe presence mitra
- stale snapshot tidak dipakai di discovery
- relay availability bisa dipantau di app state

### Completion Criteria
- presence gateway sudah nyata, bukan mock
- publish/unpublish bisa dipanggil dari flow UI sprint 2
- discovery punya data mentah yang siap difilter dan dirender

### Catatan Implementasi
- jalur source of truth tetap di local-first; relay hanya coordination layer
- jangan campur contract presence dengan contract order signal

---

## ENG-006

### Judul
`ENG-006` Go online/offline dan anti-abuse validation

### Tujuan
Membuat mitra bisa online secara aman dan customer/mitra bisa melihat state availability yang benar.

### Scope
- `goOnline` use case
- `goOffline` use case
- validasi koordinat, velocity, rate limit minimum
- integrasi `validateOnlineReadiness()`
- UI gate reason untuk online failure

### Out of Scope
- booking flow
- incoming order
- push notification

### Dependency
- `ENG-005`

### Deliverable Minimum
- mitra bisa toggle online/offline
- toggle online gagal jika readiness belum lolos
- anti-abuse minimum berjalan sebelum publish presence
- audit event minimum untuk online/offline dan violation tersedia

### Completion Criteria
- toggle online/offline mengubah presence secara benar
- user mendapat gate reason yang jelas bila online ditolak
- violation anti-abuse tidak mengubah app jadi crash atau state ambigu

### Catatan Implementasi
- jangan longgarkan gate readiness demi demo
- error state harus mengikuti matrix `limited_mode`, `driver_gate`, dan state terkait lain yang sudah dikunci

---

## ENG-007

### Judul
`ENG-007` Customer home, discovery list, dan recommendation card

### Tujuan
Membuat customer punya layar utama yang berguna untuk melihat mitra nearby dan memulai journey booking.

### Scope
- customer home screen
- discovery list nearby mitra
- top recommendation card
- service type quick selector
- empty state / offline state / location required state
- CTA ke booking form

### Out of Scope
- booking form penuh
- order review
- women preference optional rollout

### Dependency
- `ENG-006`

### Deliverable Minimum
- customer home menampilkan:
  - greeting
  - role switch entry
  - recovery banner bila ada active order
  - service selector
  - recommendation card
  - nearby mitra list
- discovery state bisa membedakan:
  - ready
  - empty
  - location required
  - offline

### Completion Criteria
- customer bisa melihat kandidat nearby yang fresh dan eligible
- top recommendation punya alasan singkat yang explainable
- home tetap informatif walau lokasi belum aktif atau relay down

### Catatan Implementasi
- empty discovery adalah state normal, bukan error
- visual hierarchy harus mengikuti design token dan core components yang sudah dikunci

---

## ENG-008

### Judul
`ENG-008` Driver home, online gate, dan recovery banner

### Tujuan
Membuat mitra punya layar utama yang jelas untuk melihat readiness, toggling online, dan jalur kembali ke trip aktif.

### Scope
- driver home screen
- readiness summary
- online/offline toggle UI
- online gate reason rendering
- nearby demand list sederhana
- recovery banner ke active trip
- shortcut ke profile / pricing correction

### Out of Scope
- incoming order screen
- accept/reject logic
- contact reveal

### Dependency
- `ENG-006`

### Deliverable Minimum
- driver home menampilkan:
  - greeting
  - role switch entry
  - readiness summary
  - toggle online/offline
  - gate reason jika belum ready
  - nearby demand list sederhana
  - recovery banner bila ada active order
- driver dapat diarahkan ke profile atau pricing jika readiness belum lolos

### Completion Criteria
- driver bisa paham dalam satu layar apakah ia siap online atau belum
- state active order mendapat prioritas lebih tinggi dari discovery biasa
- home mitra siap menjadi entry point ke incoming order sprint 3 tanpa redesign besar

### Catatan Implementasi
- copy gate harus hormat dan tidak menghakimi driver
- jangan masukkan incoming order ke sprint ini walau sudah ada relay

---

## Order of Execution

1. `ENG-005`
2. `ENG-006`
3. `ENG-007`
4. `ENG-008`

Rule:
- jangan mulai `ENG-009` sebelum `ENG-008` selesai
- jika ada waktu sisa sprint 2, pakai untuk merapikan discovery state, home UX, dan recovery banner, bukan membuka order signaling penuh
