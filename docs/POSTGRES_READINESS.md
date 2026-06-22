# PostgreSQL Readiness

Phase 8 menyiapkan JejakSehat agar bisa berpindah dari Google Sheets ke PostgreSQL tanpa mengubah UI atau business logic.

## Provider switch

Provider dipilih melalui environment variable:

```env
DATA_PROVIDER=sheets
```

atau:

```env
DATA_PROVIDER=postgres
```

Default tetap `sheets` agar development lama tidak rusak ketika environment belum diubah.

## PostgreSQL adapters

Adapter PostgreSQL tersedia untuk:

- User repository.
- Activity repository.
- Progress repository.

Semua adapter mengikuti contract domain yang sama dengan Google Sheets:

- User ID selalu berasal dari session atau repository, bukan dari browser input bebas.
- Activity menggunakan soft delete.
- Gym activity membawa session, exercises, dan sets.
- Running activity membawa distance, pace source data, RPE, location, dan elevation.
- Body measurements menggunakan soft delete.
- Goal baru dengan tipe sama akan menonaktifkan goal aktif sebelumnya.

## Migration readiness commands

### 1. Validasi Google Sheets

```bash
npm run sheets:validate
```

Script ini memeriksa:

- Tab wajib tersedia.
- Header sesuai schema.
- Jumlah baris per tab.
- Schema version yang digunakan aplikasi.

Jika tab atau header hilang, script keluar dengan kode gagal.

### 2. Generate Prisma client

```bash
npm run db:generate
```

Jalankan ulang setelah perubahan `prisma/schema.prisma`.

### 3. Dry-run PostgreSQL

```bash
npm run db:dry-run
```

Script ini tidak menulis data. Pemeriksaan yang dilakukan:

- `DATABASE_URL` tersedia.
- `DIRECT_URL` tersedia.
- Prisma client bisa membuka koneksi.
- Tabel utama bisa dibaca untuk menghitung record.

### 4. Reconciliation report

```bash
npm run db:reconcile
```

Script ini membandingkan jumlah baris Google Sheets dan PostgreSQL untuk:

- users
- activities
- gym_sessions
- gym_exercises
- gym_sets
- runs
- body_measurements
- goals

Jika ada selisih, script keluar dengan kode gagal agar provider tidak dipindahkan sebelum data direview.

## Safe migration checklist

1. Backup Google Sheets.
2. Jalankan `npm run sheets:validate`.
3. Provision PostgreSQL.
4. Isi `DATABASE_URL` dan `DIRECT_URL`.
5. Jalankan `npm run db:generate`.
6. Jalankan Prisma migration.
7. Import data Sheets ke PostgreSQL dengan script migration di Phase 9.
8. Jalankan `npm run db:dry-run`.
9. Jalankan `npm run db:reconcile`.
10. Deploy preview dengan `DATA_PROVIDER=postgres`.
11. Smoke test login, dashboard, activity CRUD, progress CRUD, dan goals.
12. Baru switch production provider.

## Rollback plan

Jika preview PostgreSQL bermasalah:

1. Set kembali `DATA_PROVIDER=sheets`.
2. Redeploy aplikasi.
3. Pastikan Google Sheets tetap menjadi source of truth.
4. Jangan freeze spreadsheet sampai reconciliation PostgreSQL bersih.

## Current limitations

Phase 8 belum melakukan import data aktual. Phase ini hanya menyiapkan adapter, validation, dry-run, dan reconciliation tooling.

Import script dan production cutover masuk Phase 9.
