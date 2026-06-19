# JejakSehat

JejakSehat adalah Progressive Web App untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan. Project ini menggunakan Google Sheets sebagai penyimpanan awal dengan arsitektur yang disiapkan untuk migrasi ke PostgreSQL.

## Status

Project sedang berada pada **Phase 1 — Authentication**.

Sudah tersedia:

- Next.js App Router dan TypeScript
- Responsive landing page dan login page
- PWA manifest, service worker, dan offline fallback
- Auth.js dengan Google OAuth
- JWT session dengan UUID internal pengguna
- User upsert ke Google Sheets berdasarkan Google subject
- Protected dashboard dan endpoint current user
- API health endpoint
- Domain entities dan repository contracts
- Google Sheets schema dan initializer
- Prisma schema untuk PostgreSQL
- Data provider selector melalui environment variable
- CI untuk lint, typecheck, tests, dan production build

Belum tersedia:

- CRUD gym dan lari
- Dashboard statistik aktivitas
- Deployment production
- PostgreSQL persistence adapter

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Auth.js
- Google OAuth
- Google Sheets API
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

API tersedia di:

```text
GET /api/v1/health
GET /api/v1/me
```

`/api/v1/me` membutuhkan session yang valid.

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

Command tersebut membuat tab dan header database JejakSehat secara otomatis.

## Strategi Database

Penyimpanan dipilih melalui:

```env
DATA_PROVIDER=sheets
```

Ketika migrasi selesai:

```env
DATA_PROVIDER=postgres
```

UI dan business logic tidak boleh mengakses Google Sheets atau Prisma secara langsung. Seluruh akses data harus melewati repository contract.

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
