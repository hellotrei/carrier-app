# Carrier Folder Blueprint

**Versi:** 1.0  
**Status:** Scaffold target  
**Scope:** Struktur folder final untuk implementasi React Native MVP

---

## Tujuan

Dokumen ini menurunkan boundary arsitektur menjadi struktur folder yang konkret. Targetnya adalah:
- screen tetap tipis
- komponen reusable tidak bercampur dengan flow
- domain logic tidak bocor ke UI
- storage/relay tetap berada di boundary yang jelas

---

## Root Blueprint

```text
carrier-app/
  android/
  ios/
  src/
  assets/
  scripts/
  docs/
  .github/
  package.json
  tsconfig.json
  metro.config.js
  babel.config.js
  eslint.config.js
```

Rules:
- `android/` dan `ios/` hanya berisi konfigurasi native, manifest, capability, dan integration glue
- Jangan letakkan business logic di native layer kecuali benar-benar wajib
- `scripts/` dipakai untuk automation repo, bukan runtime app logic

---

## Src Blueprint

```text
src/
  app/
    bootstrap/
    navigation/
    providers/
    config/
  ui/
    primitives/
    patterns/
    theme/
  core/
    types/
    result/
    errors/
    logger/
    constants/
    utils/
    time/
    validation/
  domain/
    user/
    pricing/
    presence/
    order/
    audit/
    anti-abuse/
    transaction/
  application/
    user/
    pricing/
    presence/
    order/
    audit/
    anti-abuse/
    transaction/
    external/
  data/
    db/
      sqlite/
      migrations/
      mappers/
    repositories/
    storage/
    gateways/
      presence/
      order-signal/
      push/
    relay/
    serializers/
  integrations/
    biometrics/
    filesystem/
    location/
    maps/
    dialer/
    whatsapp/
    network-security/
  features/
    onboarding/
    role-switch/
    permission-location/
    profile/
    pricing-settings/
    home-customer/
    home-mitra/
    booking/
    incoming-order/
    active-trip/
    history/
    audit-export/
    transaction-log/
  state/
    store/
    selectors/
    slices/
    effects/
```

---

## Boundary Rules

### `app/`
- Menangani bootstrap, navigation root, providers, dan config assembly
- Tidak memegang business rules

### `ui/primitives/`
- Tiny reusable components seperti `Text`, `Button`, `Input`, `Stack`, `Surface`, `Icon`
- Tidak boleh import repository, store, gateway, atau use case
- Tidak boleh mengandung copy flow-spesifik

### `ui/patterns/`
- Komponen reusable yang menyusun beberapa primitive
- Contoh: `Card`, `Badge`, `SectionHeader`, `PriceBreakdown`, `RecoveryBanner`
- Boleh menerima data siap render, tetapi tidak boleh query data sendiri

### `ui/theme/`
- Tokens visual: color, spacing, radius, shadow, typography, motion
- Tidak boleh berisi state, API, atau logic domain

### `core/`
- Utility bersama yang aman dipakai lintas boundary
- Tidak boleh berisi logic bisnis produk

### `domain/`
- Source utama untuk entities, value objects, policy, dan state machine
- Harus pure sebisa mungkin
- Tidak boleh tahu React, RN UI, SQLite, atau Supabase

### `application/`
- Menyatukan domain + repository/gateway contracts
- Menjadi pintu masuk use case seperti `submitOrder`, `acceptOrder`, `recordCompletedTrip`
- Tidak boleh berisi rendering concern

### `data/`
- Seluruh akses ke SQLite, secure storage, relay, push, dan serialisasi
- Mapper entity-row dan adapter eksternal hidup di sini
- Tidak boleh langsung dipanggil dari screen

### `integrations/`
- Wrapper OS/device capability
- Harus sempit, defensif, dan mudah diganti

### `features/`
- Tiap feature memiliki screen, container, presenter mapping, dan komponen lokal khusus flow
- Reuse `ui/*` lebih dulu sebelum membuat komponen baru

### `state/`
- Hanya untuk projection UI, session ringan, recovery surface, dan coordination state yang memang perlu reaktif
- Tidak menjadi source of truth histori data bisnis

---

## Feature Blueprint

Contoh struktur per feature:

```text
features/
  booking/
    screens/
    components/
    hooks/
    presenters/
    containers/
    types/
```

Rules:
- `screens/` hanya orchestration UI
- `components/` hanya lokal untuk feature tersebut
- `hooks/` untuk wiring UI, bukan business rule berat
- `presenters/` untuk mapping domain/application result ke UI model
- `containers/` untuk menghubungkan navigation, store, dan use case

---

## Naming Rules

- Gunakan nama folder berbasis domain/fitur, bukan nama engineer atau nama sprint
- Gunakan `kebab-case` untuk folder feature
- Gunakan nama file yang menjelaskan tanggung jawab, misalnya `submit-order.ts`, `price-breakdown.tsx`, `user-repository.ts`
- Hindari file generik seperti `helpers.ts`, `misc.ts`, `temp.ts`

---

## File Ownership Rules

- Jika logic menyentuh order lifecycle, cek dulu `domain/order` lalu `application/order`
- Jika perubahan hanya mengubah tampilan bersama, utamakan `ui/primitives` atau `ui/patterns`
- Jika perubahan menambah IO, tempatkan di `data/` atau `integrations/`, bukan di feature

---

## Anti-Pattern yang Dilarang

- Screen import langsung SQLite client
- Feature import langsung Supabase client
- Primitive UI membaca store global
- Domain entity tahu bentuk row SQLite
- Menaruh reusable component besar di `components/` root tanpa boundary jelas
- Menambah folder `services/` generik yang menjadi tempat campur semua logic

---

## Target Scaffold Minimum

Sebelum implementasi fitur nyata, scaffold minimal harus sudah menyediakan:
- `app/bootstrap`
- `app/navigation`
- `ui/primitives`
- `ui/patterns`
- `ui/theme`
- `core/errors`, `core/result`, `core/logger`
- `domain/order`, `domain/user`
- `application/order`, `application/user`
- `data/db/sqlite`, `data/repositories`, `data/storage`, `data/relay`
- `features/onboarding`, `features/home-customer`, `features/home-mitra`
- `state/store`
