# Carrier App Project

## Sprint 4 Issue Specs

Dokumen ini memecah backlog sprint 4 menjadi issue spec yang bisa langsung dieksekusi agent atau engineer berikutnya.

Prinsip sprint 4:
- fokus pada hardening pilot
- sprint ini menutup loop order core dengan history, feedback, audit, export, dan UI state yang rapi
- sprint ini tidak boleh membuka fitur phase 2 atau optional yang mengganggu launch pilot

---

## ENG-013

### Judul
`ENG-013` History, post-trip feedback, dan transaction log

### Tujuan
Membuat hasil trip yang sudah terminal bisa ditelusuri user dan menghasilkan catatan transaksi dasar untuk operasional pilot.

### Scope
- history list
- history detail
- post-trip feedback sheet
- default rating policy
- manual rating override
- transaction log recording
- transaction log list minimum

### Out of Scope
- audit export bundle
- CSV export final
- operator dashboard

### Dependency
- `ENG-012`

### Deliverable Minimum
- order terminal muncul di history
- history detail menampilkan breakdown finansial dan reason terminal
- post-trip feedback bisa submit manual rating atau skip
- skip feedback tetap menghasilkan default rating `5`
- transaction log tercatat saat trip `Completed`

### Completion Criteria
- user bisa melihat history tanpa koneksi aktif
- feedback tidak menghambat penutupan order
- transaction log konsisten dengan data order selesai

### Catatan Implementasi
- review teks tetap catatan lokal/produk, bukan ranking signal MVP
- jangan ubah source of truth order menjadi transaction log

---

## ENG-014

### Judul
`ENG-014` Audit writer, audit export, dan CSV export

### Tujuan
Membuat audit dan rekap transaksi benar-benar bisa dipakai untuk tracing dan operasional pilot.

### Scope
- audit binary writer
- manifest indexing
- audit export bundle
- device auth guard untuk audit export
- transaction log CSV export
- export success / failure state minimum

### Out of Scope
- cloud backup
- operator dashboard
- server-side log aggregation

### Dependency
- `ENG-013`

### Deliverable Minimum
- event penting benar-benar ditulis ke audit
- audit manifest bisa melacak file event
- export `.tripaudit` bisa dibuat
- export CSV transaction log bisa dibuat
- export punya progress, success state, dan failure state minimum

### Completion Criteria
- audit trail bisa diexport tanpa merusak data lokal
- export failure tidak membuat app masuk state rusak
- hasil export punya path/file yang jelas untuk share sheet atau tracing operator

### Catatan Implementasi
- audit export tetap local-first
- kalau device auth belum available, ikuti fallback policy yang sudah dikunci di dokumen

---

## ENG-015

### Judul
`ENG-015` Error mapping, empty states, copy tone, dan design system hardening

### Tujuan
Merapikan pengalaman pilot supaya flow yang sudah jadi terasa konsisten, tenang, dan mudah dipahami di kondisi normal maupun buruk.

### Scope
- implementasi error mapping dasar ke UI state
- empty state utama
- mode terbatas / offline state
- copy/tone alignment untuk layar utama
- design token dan core component hardening
- recovery banner consistency

### Out of Scope
- redesign besar
- eksperimen visual baru
- phase 2 feature UI

### Dependency
- `ENG-012`

### Deliverable Minimum
- state penting punya UI yang konsisten:
  - location required
  - relay unavailable
  - profile not ready
  - invalid price
  - export failed
  - handoff failed
  - empty discovery
- customer home dan driver home mengikuti tone/copy matrix
- core components mengikuti design system boundary

### Completion Criteria
- flow inti tidak terasa berbeda-beda secara visual/copy antar screen
- error dan empty state tidak membingungkan user
- context valid terakhir tetap terjaga saat error state muncul

### Catatan Implementasi
- prioritasnya adalah coherence, bukan polish kosmetik berlebihan
- jika waktu terbatas, utamakan state yang berada di critical path pilot

---

## ENG-016

### Judul
`ENG-016` Recovery hardening dan production log sanitization

### Tujuan
Menutup risiko pilot dengan memastikan recovery order stabil dan logging produksi tetap aman.

### Scope
- hardening recovery flow
- hardening restore active order path
- sanitized debug/error logging untuk prod
- review logging field agar tidak bocor data sensitif

### Out of Scope
- observability backend
- remote crash analytics redesign
- server-side incident tooling

### Dependency
- `ENG-012`

### Deliverable Minimum
- recovery path ke active trip lebih tahan terhadap edge case
- log prod tidak menulis nomor penuh, koordinat mentah, atau payload sensitif
- error yang sama tidak membuat repeated noisy logs yang merusak tracing

### Completion Criteria
- restart app saat ada order aktif tetap mengarah ke state yang masuk akal
- log prod cukup untuk tracing tanpa melanggar boundary data sensitif
- hardening tidak mengubah contract flow yang sudah dikunci di sprint 3

### Catatan Implementasi
- fokus pada stabilitas pilot, bukan membangun observability platform
- jika ada tradeoff, pilih perilaku yang aman dan mudah ditrace

---

## Order of Execution

1. `ENG-013`
2. `ENG-014`
3. `ENG-015`
4. `ENG-016`

Rule:
- sprint 4 hanya boleh memoles dan menguatkan flow pilot yang sudah ada
- jangan buka fitur optional atau phase 2 sebelum `ENG-014` dan recovery hardening dianggap cukup aman untuk pilot
