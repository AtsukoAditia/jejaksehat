# Data Schema

Google Sheets dibuat menyerupai struktur relasional PostgreSQL agar proses migrasi tidak mengubah kontrak aplikasi.

## Tabs

| Tab | Fungsi |
|---|---|
| `schema_meta` | Versi schema spreadsheet |
| `users` | Identitas internal pengguna |
| `activities` | Tabel induk aktivitas gym dan lari |
| `gym_sessions` | Detail sesi gym |
| `gym_exercises` | Daftar gerakan dalam sesi |
| `gym_sets` | Detail setiap set latihan |
| `runs` | Detail aktivitas lari |
| `body_measurements` | Berat, body fat, dan lingkar pinggang |
| `goals` | Target kesehatan pengguna |

## Relasi

```text
users
  ├── activities
  │     ├── gym_sessions
  │     │      └── gym_exercises
  │     │               └── gym_sets
  │     └── runs
  ├── body_measurements
  └── goals
```

## Aturan Data

- Gunakan UUID sebagai primary key.
- Nomor baris spreadsheet tidak boleh menjadi ID.
- Relasi pengguna memakai `user_id`, bukan email.
- Header menggunakan `snake_case`.
- Timestamp menggunakan ISO 8601.
- Tanggal aktivitas menggunakan format `YYYY-MM-DD`.
- Delete dilakukan dengan mengisi `deleted_at`.
- Pace lari dihitung dari durasi dan jarak, bukan disimpan.
- Data mentah tidak memakai formula spreadsheet.

## Source of Truth

Header spreadsheet didefinisikan di:

```text
src/infrastructure/sheets/schema.ts
```

Struktur PostgreSQL didefinisikan di:

```text
prisma/schema.prisma
```
