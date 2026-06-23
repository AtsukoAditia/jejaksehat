# JejakSehat

JejakSehat adalah Progressive Web App untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan. Project ini menggunakan Google Sheets sebagai penyimpanan awal dengan arsitektur yang disiapkan untuk migrasi ke PostgreSQL.

## Status

Project telah menyelesaikan **Phase 8 — PostgreSQL Readiness** dan sudah siap untuk **local live verification** menggunakan Google OAuth serta Google Sheets credential asli.

Sudah tersedia:

- Next.js App Router, React, TypeScript, dan responsive authenticated app shell
- Auth.js dengan Google OAuth, JWT session, UUID internal, dan protected routes
- Google Sheets repositories untuk user, gym, lari, body measurement, dan goals
- PostgreSQL repositories untuk user, activity, body measurement, dan goals
- `DATA_PROVIDER=sheets` dan `DATA_PROVIDER=postgres` melalui provider factory
- Activity history, detail, filter, edit, validation, ownership check, dan soft delete
- Multiple exercise/set untuk gym serta pace, RPE, location, dan elevation untuk lari
- Individual gym exercise/set editor untuk mengubah gerakan, set, reps, beban, RPE, dan status completed
- Previous gym workout comparison untuk durasi, volume, set, gerakan, dan beban terbaik
- Current dan longest workout streak berbasis hari aktif unik
- Body measurement CRUD dan lightweight progress charts
- Weekly workout goal, running distance goal, dan target weight dua arah
- Dashboard activity summary, streak, goal progress, dan recent activities
- Installable PWA manifest dengan PNG, maskable, dan Apple touch icons
- App shortcuts, browser install prompt, serta Safari iOS install guidance
- Versioned service worker cache dengan exclusion untuk API dan data kesehatan privat
- Network status, privacy-aware offline fallback, safe-area, dan reduced-motion support
- Provider contract tests dengan in-memory fixtures
- Sheets validation, PostgreSQL dry-run, dan reconciliation commands
- Playwright acceptance untuk viewport 320px dan Pixel 5
- Lighthouse accessibility, best-practices, SEO, dan performance review dalam CI
- Prisma schema sebagai rangka PostgreSQL
- Cline local AI workflow docs dan project guardrails

Belum tersedia:

- Live Google OAuth credential test
- Live Google Sheets credential test
- Live PostgreSQL credential test
- Full data import script dari Sheets ke PostgreSQL
- Physical Android dan iOS install test
- Encrypted offline write queue
- Production deployment

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
- PostgreSQL
- Playwright dan Lighthouse CI
- Vercel

## Menjalankan Project

```bash
npm install
cp .env.example .env.local
npm run db:generate
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

Jangan commit file `.env`, OAuth secret, database URL, atau credential service account ke repository.

## Local Verification Flow

Setelah `.env.local` diisi:

```bash
npm run db:generate
npm run sheets:init
npm run sheets:validate
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Test manual yang perlu dilakukan sebelum deployment:

1. Login Google di local.
2. Pastikan user masuk ke spreadsheet.
3. Catat aktivitas gym.
4. Edit gerakan dan set gym.
5. Catat aktivitas lari.
6. Catat body measurement.
7. Buat goal.
8. Cek dashboard streak, goal progress, dan recent activity.
9. Cek previous workout comparison dengan dua sesi gym bernama sama.

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

## PostgreSQL Readiness

Default provider tetap Google Sheets:

```env
DATA_PROVIDER=sheets
```

Untuk preview PostgreSQL:

```env
DATA_PROVIDER=postgres
```

Command readiness:

```bash
npm run sheets:validate
npm run db:generate
npm run db:dry-run
npm run db:reconcile
```

Detail workflow, checklist, dan rollback tersedia di `docs/POSTGRES_READINESS.md`.

## Kebijakan PWA dan Offline

Service worker menyimpan public shell dan static assets. Request `/api/*`, session response, dashboard pribadi, aktivitas, measurement, serta goal tidak disimpan ke cache.

Offline write queue belum diterapkan. Pengguna harus kembali online untuk mencatat data agar tidak terjadi duplicate submission, conflict, atau penyimpanan data kesehatan tanpa perlindungan memadai.

Detail tersedia di `docs/PWA_HARDENING.md`.

## Cline Local AI Workflow

Cline menggunakan aturan project dari `.clinerules` dan daftar file yang tidak boleh dibaca dari `.clineignore`.

Baca dokumen berikut sebelum melanjutkan development lokal dengan AI:

- `docs/CLINE_LOCAL_SETUP.md`
- `docs/CLINE_PROJECT_CONTEXT.md`
- `docs/CLINE_TASK_BACKLOG.md`
- `docs/CLINE_PROMPTS.md`

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

UI dan business logic tidak mengakses Google Sheets atau Prisma secara langsung. Seluruh akses data melewati repository contract.

Phase 8 belum melakukan import data aktual. Full import dan cutover production masuk Phase 9.

## Dokumentasi

- `docs/ARCHITECTURE.md`
- `docs/CLINE_LOCAL_SETUP.md`
- `docs/CLINE_PROJECT_CONTEXT.md`
- `docs/CLINE_TASK_BACKLOG.md`
- `docs/CLINE_PROMPTS.md`
- `docs/DATA_SCHEMA.md`
- `docs/GOOGLE_AUTH_SETUP.md`
- `docs/MIGRATION_POSTGRES.md`
- `docs/MODULE_AUDIT.md`
- `docs/PHASE6_COMPLETION.md`
- `docs/POSTGRES_READINESS.md`
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
