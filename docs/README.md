# Carrier Docs

Folder ini menampung seluruh dokumen perencanaan dan spesifikasi proyek agar root repository tetap bersih untuk source code React Native.

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

## Catatan

- Semua dokumen `.md` sengaja dipusatkan di folder ini.
- Source code React Native nantinya bisa hidup di root repository tanpa tercampur file perencanaan.
- Jika ada agent baru, arahkan pembacaan mulai dari file ini lalu lanjut ke PRD, SDD, dan TSD.
