# Carrier Docs

Folder ini menampung dokumen perencanaan dan spesifikasi inti Carrier. Source code React Native sudah aktif di root repository, dan folder `docs/` tetap menjadi source of truth untuk scope, arsitektur, dan urutan implementasi.

## Urutan baca yang disarankan

1. `carrier-brd.md`
   Konteks bisnis dan arah besar produk.

2. `carrier-prd.md`
   Scope produk, fitur, MVP lock, dan keputusan product-level.

3. `carrier-sdd.md`
   Desain sistem dan arsitektur implementasi.

4. `carrier-tsd.md`
   Kontrak teknis, type, state, dan aturan implementasi detail.

5. `carrier-architecture-decision-pack.md`
   Baseline keputusan arsitektur implementasi React Native, boundary kode, dan security posture.

6. `carrier-folder-blueprint.md`
   Struktur folder final dan boundary ownership untuk scaffold React Native.

7. `carrier-dependency-policy.md`
   Allowlist, conditional list, dan denylist dependency untuk menjaga efisiensi dan keamanan repo.

8. `carrier-concept-diagram.md`
   Diagram konsep ringkas untuk mental model lokal vs relay vs audit.

9. `carrier-research-report.md`
   Catatan riset dan referensi tambahan.

## Issue specs per sprint

- `carrier-sprint-1-issue-specs.md`
- `carrier-sprint-2-issue-specs.md`
- `carrier-sprint-3-issue-specs.md`
- `carrier-sprint-4-issue-specs.md`

File issue spec dipakai next agent atau engineer untuk eksekusi per sprint tanpa harus menerjemahkan ulang backlog.

## Status singkat

Repo ini tidak lagi berada di fase dokumen-only.

Yang sudah ada:
- BRD, PRD, SDD, TSD, dan issue specs per sprint
- source code React Native di root repo
- flow order sprint 3 sudah hidup dan di-harden
- flow sprint 4 untuk history, feedback, audit, export, dan recovery hardening sudah hidup
- local-first persistence dan native export gateway
- navigation boundary yang sudah dipisah: `AppNavigator`, `RootNavigation`, dan route containers di `src/app/navigation/screens`
- contract payload FCM minimum sudah mulai dikunci di app layer untuk `incoming_order`, `order_response`, `trip_update`, `trip_terminal`, dan `sos_notice`

Yang masih berlangsung:
- penyempurnaan relay/signaling penuh
- infra dan hardening yang benar-benar production-ready
- final polish untuk pilot launch

## Status sprint implementasi

- Sprint 1 dan Sprint 2: source of truth tetap di dokumen/spec
- Sprint 3 (`ENG-009` s.d. `ENG-012`): sudah terimplementasi di repo
- Sprint 4 (`ENG-013` s.d. `ENG-016`): sudah terimplementasi di repo dan sedang masuk fase hardening pilot

## Catatan

- Semua dokumen `.md` sengaja dipusatkan di folder ini.
- Source code React Native hidup di root repository, tetapi keputusan scope dan arsitektur tetap harus mengacu ke dokumen di folder ini.
- Jika ada agent baru, arahkan pembacaan mulai dari file ini lalu lanjut ke PRD, SDD, TSD, dan issue specs sprint yang relevan.
