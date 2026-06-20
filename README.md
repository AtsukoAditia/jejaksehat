# JejakSehat

JejakSehat adalah Progressive Web App untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan. Project ini menggunakan Google Sheets sebagai penyimpanan awal dengan arsitektur yang disiapkan untuk migrasi ke PostgreSQL.

## Status

Project telah menyelesaikan **Phase 5 — Body Progress dan Goals**.

Sudah tersedia:

- Next.js App Router, React, dan TypeScript
- Responsive landing page, login page, dan authenticated app shell
- PWA manifest, service worker, dan offline fallback
- Auth.js dengan Google OAuth dan JWT session
- UUID internal pengguna serta user upsert ke Google Sheets
- Protected dashboard dan API versioning `/api/v1`
- Google Sheets activity repository untuk gym dan lari
- Multiple exercise dan set untuk gym
- Running distance, pace, RPE, location, dan elevation
- Activity history, detail, edit, filter, dan soft delete
- Body measurement CRUD untuk berat, body fat, dan lingkar pinggang
- Lightweight progress charts tanpa dependency chart tambahan
- Weekly workout goal, weekly running distance goal, dan target weight
- Target weight progress untuk fase naik maupun turun berat
- Goal create, update, deactivate, dan soft delete
- Goal progress pada halaman Progress dan dashboard utama
- Zod validation, ownership checks, dan repository abstraction
- Prisma schema sebagai rangka PostgreSQL
- CI untuk lint, typecheck, automated tests, dan production build

Belum tersedia:

- Live Google OAuth dan Google Sheets credential test
- Individual gym exercise/set editor
- Workout streak
- PWA hardening dan mobile acceptance test
- Production deployment
- PostgreSQL persistence adapters

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Auth.js
- Google OAuth
- Google Sheets API
- Zod
- Prisma ORM
- PostgreSQL untuk tahap migrasi
- Vercel

## Menjalankan Project

```bash
npm install
cp .env.example .env.local
npm run sheets:init
npm run dev
```

Buka `http://localhost:3000`.

## API

```text
GET    /api/v1/health
GET    /api/v1/me

GET    /api/v1/activities
POST   /api/v1/activities
GET    /api/v1/activities/:id
PATCH  /api/v1/activities/:id
DELETE /api/v1/activities/:id

GET    /api/v1/body-measurements
POST   /api/v1/body-measurements
GET    /api/v1/body-measurements/:id
PATCH  /api/v1/body-measurements/:id
DELETE /api/v1/body-measurements/:id

GET    /api/v1/goals
POST   /api/v1/goals
GET    /api/v1/goals/:id
PATCH  /api/v1/goals/:id
DELETE /api/v1/goals/:id
```

Endpoint selain health membutuhkan session valid. User ID selalu berasal dari session Auth.js dan tidak diterima dari browser.

## Environment Variables

```env
NEXT_PUBLIC_APP_NAME=JejakSehat
NEXT_PUBLIC_APP_URL=http://localhost:3000

AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_TRUST_HOST=true

DATA_PROVIDER=sheets

GOOGLE_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

DATABASE_URL=
DIRECT_URL=
```

Jangan commit file `.env`, OAuth secret, atau credential service account ke repository.

## Google Authentication

Panduan Google Cloud, callback URL, environment variables, dan troubleshooting tersedia di:

```text
docs/GOOGLE_AUTH_SETUP.md
```

Callback lokal Auth.js:

```text
http://localhost:3000/api/auth/callback/google
```

## Inisialisasi Google Sheets

1. Buat Google Spreadsheet kosong.
2. Buat service account di Google Cloud.
3. Aktifkan Google Sheets API.
4. Bagikan spreadsheet kepada email service account sebagai Editor.
5. Isi environment variables Google Sheets.
6. Jalankan:

```bash
npm run sheets:init
```

Command tersebut membuat tab dan header database JejakSehat secara otomatis, termasuk `body_measurements` dan `goals`.

## Strategi Database

Penyimpanan saat ini dipilih melalui:

```env
DATA_PROVIDER=sheets
```

Ketika adapter PostgreSQL selesai:

```env
DATA_PROVIDER=postgres
```

UI dan business logic tidak mengakses Google Sheets atau Prisma secara langsung. Seluruh akses data melewati repository contract.

## Dokumentasi

- `docs/ARCHITECTURE.md`
- `docs/DATA_SCHEMA.md`
- `docs/GOOGLE_AUTH_SETUP.md`
- `docs/MIGRATION_POSTGRES.md`
- `docs/ROADMAP.md`

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run sheets:init
npm run db:generate
npm run db:migrate
npm run db:studio
```

## License

MIT
