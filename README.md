# JejakSehat

JejakSehat adalah Progressive Web App untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan. Project ini menggunakan Google Sheets sebagai penyimpanan awal dengan arsitektur yang disiapkan untuk migrasi ke PostgreSQL.

## Status

Project telah menyelesaikan **Phase 7 — PWA Hardening**.

Sudah tersedia:

- Next.js App Router, React, TypeScript, dan responsive authenticated app shell
- Auth.js dengan Google OAuth, JWT session, UUID internal, dan protected routes
- Google Sheets repositories untuk user, gym, lari, body measurement, dan goals
- Activity history, detail, filter, edit, validation, ownership check, dan soft delete
- Multiple exercise/set untuk gym serta pace, RPE, location, dan elevation untuk lari
- Previous gym workout comparison untuk durasi, volume, set, gerakan, dan beban terbaik
- Current dan longest workout streak berbasis hari aktif unik
- Body measurement CRUD dan lightweight progress charts
- Weekly workout goal, running distance goal, dan target weight dua arah
- Dashboard activity summary, streak, goal progress, dan recent activities
- Installable PWA manifest dengan PNG, maskable, dan Apple touch icons
- App shortcuts, browser install prompt, serta Safari iOS install guidance
- Versioned service worker cache dengan exclusion untuk API dan data kesehatan privat
- Network status, privacy-aware offline fallback, safe-area, dan reduced-motion support
- Playwright acceptance untuk viewport 320px dan Pixel 5
- Lighthouse accessibility, best-practices, SEO, dan performance review dalam CI
- Prisma schema sebagai rangka PostgreSQL

Belum tersedia:

- Live Google OAuth dan Google Sheets credential test
- Individual gym exercise/set editor
- Physical Android dan iOS install test
- Encrypted offline write queue
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
- Playwright dan Lighthouse CI
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

## Inisialisasi Google Sheets

1. Buat Google Spreadsheet kosong.
2. Buat service account dan aktifkan Google Sheets API.
3. Bagikan spreadsheet kepada email service account sebagai Editor.
4. Isi environment variables Google Sheets.
5. Jalankan:

```bash
npm run sheets:init
```

Command tersebut membuat tab dan header database JejakSehat secara otomatis.

## Kebijakan PWA dan Offline

Service worker menyimpan public shell dan static assets. Request `/api/*`, session response, dashboard pribadi, aktivitas, measurement, serta goal tidak disimpan ke cache.

Offline write queue belum diterapkan. Pengguna harus kembali online untuk mencatat data agar tidak terjadi duplicate submission, conflict, atau penyimpanan data kesehatan tanpa perlindungan memadai.

Detail tersedia di `docs/PWA_HARDENING.md`.

## Menjalankan Mobile dan Lighthouse Audit

Audit tools dipasang sementara agar tidak mengubah dependency aplikasi:

```bash
npm install --no-save @playwright/test@1.61.0 @lhci/cli@0.15.1
npx playwright install chromium
npm run build
npx playwright test
npx lhci autorun --config=./lighthouserc.json
```

## Strategi Database

Penyimpanan saat ini:

```env
DATA_PROVIDER=sheets
```

Setelah adapter PostgreSQL selesai:

```env
DATA_PROVIDER=postgres
```

UI dan business logic tidak mengakses Google Sheets atau Prisma secara langsung. Seluruh akses data melewati repository contract.

## Dokumentasi

- `docs/ARCHITECTURE.md`
- `docs/DATA_SCHEMA.md`
- `docs/GOOGLE_AUTH_SETUP.md`
- `docs/MIGRATION_POSTGRES.md`
- `docs/PHASE6_COMPLETION.md`
- `docs/PWA_HARDENING.md`
- `docs/ROADMAP.md`

## Verification Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## License

MIT
