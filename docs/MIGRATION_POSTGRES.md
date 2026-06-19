# Migration to PostgreSQL

## Tujuan

Memindahkan data dari Google Sheets ke PostgreSQL tanpa mengubah UI, API contract, atau business rules.

## Prasyarat

- Semua record memakai UUID.
- Header spreadsheet sesuai `src/infrastructure/sheets/schema.ts`.
- Prisma schema sudah divalidasi.
- Tidak ada relasi yang memakai nomor baris spreadsheet.
- Backup spreadsheet tersedia.

## Tahapan

1. Aktifkan maintenance mode untuk operasi tulis.
2. Salin spreadsheet sebagai backup.
3. Jalankan validator data Sheets.
4. Provision PostgreSQL.
5. Jalankan Prisma migration.
6. Import `users`.
7. Import `activities`.
8. Import detail gym dan lari.
9. Import body measurements dan goals.
10. Verifikasi jumlah record, UUID, dan foreign key.
11. Ubah environment variable menjadi:

```env
DATA_PROVIDER=postgres
```

12. Deploy dan jalankan smoke test.
13. Pertahankan spreadsheet sebagai backup read-only.

## Urutan Import

```text
users
activities
gym_sessions
runs
gym_exercises
gym_sets
body_measurements
goals
```

## Larangan

- Jangan memakai dual-write permanen.
- Jangan membuat UUID baru selama import.
- Jangan menghapus spreadsheet segera setelah cutover.
- Jangan melanjutkan jika ada duplicate UUID atau missing relation.

## Rollback

Sebelum ada data baru yang hanya tersimpan di PostgreSQL, aplikasi dapat dikembalikan dengan:

```env
DATA_PROVIDER=sheets
```

Setelah PostgreSQL menerima data produksi baru, rollback harus memakai prosedur rekonsiliasi data, bukan sekadar mengganti environment variable.
