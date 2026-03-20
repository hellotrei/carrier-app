# Carrier Dependency Policy

**Versi:** 1.0  
**Status:** Active baseline  
**Scope:** Dependency allowlist, conditional list, dan denylist untuk implementasi React Native MVP

---

## Tujuan

Policy ini dibuat untuk menjaga tiga hal:
- upgrade React Native tetap murah
- attack surface tetap kecil
- dependency choice konsisten dengan New Architecture dan local-first posture

---

## Prinsip Umum

- Default repo adalah **dependency minimal**
- Utamakan package yang:
  - aktif dirawat
  - kompatibel dengan New Architecture
  - tidak memaksa fallback ke bridge legacy
  - tidak membawa SDK berat tanpa kebutuhan jelas
- Utility kecil lebih baik ditulis internal daripada menarik package tambahan

---

## Allowlist Inti

Dependency berikut boleh dianggap baseline yang sehat untuk MVP, selama versi final dicek saat scaffold:

### Runtime Core
- `react`
- `react-native`
- `typescript`
- `@react-native/typescript-config`

### Navigation
- `@react-navigation/native`
- `@react-navigation/native-stack`

### State
- `zustand`

### Storage / Device Security
- `op-sqlite`
- secure storage package yang sehat untuk Keychain/Keystore boundary

### Relay / Push
- `@supabase/supabase-js`
- `@react-native-firebase/app`
- `@react-native-firebase/messaging`

### Validation / Serialization
- `zod`
- MessagePack package yang maintenance-nya sehat dan kompatibel dengan RN modern

### Device Integrations
- `react-native-biometrics`

### Tooling
- `eslint`
- `prettier`
- `@typescript-eslint/*`

---

## Conditional List

Dependency berikut **boleh dipakai hanya jika ada alasan jelas**:

### Maps Rendering
- `react-native-maps`

Gunakan hanya jika:
- kebutuhan visual map in-app benar-benar sudah disetujui
- ukuran bundle dan native maintenance cost diterima

### Reanimated / Gesture Heavy UI
- `react-native-reanimated`
- `react-native-gesture-handler`

Gunakan hanya jika:
- ada interaksi yang memang memerlukan gesture atau animation layer yang lebih maju
- tim siap menanggung kompleksitas debugging tambahan

### Network Hardening
- pinning/TLS helper library

Gunakan hanya jika:
- endpoint benar-benar dikendalikan tim
- ada keputusan hardening yang lebih spesifik dari baseline ATS/Network Security Config

### Crash / Analytics SDK
- crash reporting
- product analytics

Gunakan hanya jika:
- data minimization, masking, dan environment policy sudah jelas
- event taxonomy sudah disetujui

---

## Denylist

Dependency berikut tidak boleh menjadi default choice:

### Legacy / High-Coupling Native Packages
- package yang belum jelas kompatibel dengan New Architecture
- package yang bergantung pada API internal `react-native/Libraries/*`

### Generic Utility Bloat
- lodash penuh untuk kebutuhan kecil
- package date/formatting besar tanpa kebutuhan nyata
- package helper yang hanya menggantikan 10-20 baris util internal

### State Overreach
- state management tambahan di luar baseline tanpa alasan kuat
- library cache/query yang mendorong source of truth pindah dari local-first storage ke memory/network cache

### UI Kit Besar
- design system pihak ketiga yang membawa banyak opinion dan native surface area
- “super app UI kit” yang membuat tiny components internal tidak relevan

### Chat / Realtime Overbuild
- SDK chat permanen berat
- realtime framework tambahan selain relay/push yang sudah dipilih

### Security Theater
- obfuscation-only SDK yang tidak menjawab data minimization atau boundary issue
- dependency keamanan yang menambah kompleksitas tanpa kontrol nyata yang bisa diverifikasi

---

## Review Gate Sebelum Menambah Dependency

Setiap dependency baru harus dijawab dengan format berikut:

1. Masalah apa yang diselesaikan?
2. Kenapa tidak cukup ditulis internal?
3. Apakah kompatibel dengan New Architecture?
4. Apakah menambah native surface area?
5. Apakah menyentuh data sensitif, logging, network, atau auth boundary?
6. Siapa owner review-nya?

Jika jawaban 3, 4, atau 5 lemah, dependency sebaiknya ditolak.

---

## Import Rules

- Import hanya dari API publik package
- Dilarang import dari path internal React Native
- Dilarang membuat wrapper generik yang menyembunyikan dependency risk tanpa menambah boundary yang jelas

---

## Exit Criteria Sebelum Scaffold

Sebelum project di-bootstrap, tim harus sudah punya:
- daftar package inti yang benar-benar dipakai
- alasan tertulis untuk semua package conditional
- daftar package yang sengaja ditolak
- owner yang bertanggung jawab terhadap upgrade dependency inti
