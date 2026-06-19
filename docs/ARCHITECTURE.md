# Architecture

JejakSehat menggunakan satu aplikasi Next.js full-stack. Google Sheets menjadi penyimpanan awal, sedangkan PostgreSQL disiapkan sebagai database berikutnya.

## Layer

```text
UI / App Router
      ↓
Route Handlers / API v1
      ↓
Application Services
      ↓
Repository Interfaces
      ↓
Sheets Adapter | PostgreSQL Adapter
```

## Aturan Utama

- UI tidak mengakses Google Sheets atau Prisma secara langsung.
- Route Handler menangani autentikasi, validasi, dan response HTTP.
- Business rules ditempatkan di application service.
- Repository interface berada di domain layer.
- Adapter Sheets dan PostgreSQL memakai kontrak yang sama.
- Identitas pengguna diperoleh dari session server.

## Data Provider

```env
DATA_PROVIDER=sheets
```

Nilai yang didukung adalah `sheets` dan `postgres`.

## Directory Guide

```text
app/                         Pages dan API
src/domain/                  Entities dan repository interfaces
src/application/             Use cases dan services
src/infrastructure/sheets/   Google Sheets implementation
src/infrastructure/postgres/ PostgreSQL implementation
src/components/              UI components
prisma/                      PostgreSQL schema dan migrations
scripts/                     Setup dan migration scripts
docs/                        Dokumentasi
```

## Baseline

- Credential hanya disimpan di environment variables.
- Google Sheets API hanya dipanggil dari server.
- Semua record memakai UUID internal.
- Email tidak digunakan sebagai foreign key.
- Endpoint private harus memvalidasi session dan ownership.
- Service worker tidak melakukan cache terhadap `/api/*`.

## API Versioning

```text
/api/v1
```

Endpoint foundation:

```text
GET /api/v1/health
```
