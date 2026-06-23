# Cline Local Setup Guide

Panduan ini dipakai saat melanjutkan JejakSehat dengan Cline di VS Code lokal.

## 1. Pull project terbaru

```bash
git checkout main
git fetch origin
git pull origin main
npm install
npm run db:generate
```

## 2. Buat `.env.local`

```bash
cp .env.example .env.local
```

Minimal local development saat masih memakai Google Sheets:

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

Buat `AUTH_SECRET` lokal:

```bash
openssl rand -base64 32
```

Gunakan `DATA_PROVIDER=sheets` sampai database PostgreSQL live benar-benar siap.

## 3. Google OAuth local callback

Tambahkan callback berikut di Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

Untuk Vercel preview atau production, callback mengikuti domain deploy:

```text
https://nama-domain.vercel.app/api/auth/callback/google
```

## 4. Google Sheets setup

Jika spreadsheet belum punya tab/schema:

```bash
npm run sheets:init
```

Validasi struktur:

```bash
npm run sheets:validate
```

Pastikan spreadsheet dibagikan sebagai Editor ke email service account.

## 5. Jalankan project

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## 6. Verification sebelum commit

Minimal:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Jika mengubah PWA/mobile/offline:

```bash
npm install --no-save @playwright/test@1.61.0 @lhci/cli@0.15.1
npx playwright install chromium
npx playwright test
npx lhci autorun --config=./lighthouserc.json
```

Jika mengubah migrasi database:

```bash
npm run sheets:validate
npm run db:generate
npm run db:dry-run
npm run db:reconcile
```

`db:dry-run` dan `db:reconcile` hanya jalan kalau `DATABASE_URL`, `DIRECT_URL`, dan credential Sheets sudah benar.

## 7. Cara kerja dengan Cline

Disarankan:

1. Buka VS Code di root project.
2. Pastikan `.clinerules` terbaca.
3. Berikan Cline satu task kecil per sesi.
4. Minta Cline membaca `docs/CLINE_PROJECT_CONTEXT.md` sebelum coding.
5. Minta Cline menjalankan verification commands yang relevan.
6. Review diff sebelum commit.

Contoh instruksi awal ke Cline:

```text
Baca .clinerules, docs/CLINE_PROJECT_CONTEXT.md, docs/CLINE_TASK_BACKLOG.md, README.md, dan docs/ROADMAP.md. Setelah itu bantu kerjakan task berikut secara incremental. Jangan ubah arsitektur repository/provider tanpa alasan kuat. Jangan baca atau commit file .env.
```

## 8. Error yang paling sering

### Google OAuth callback mismatch

Gejala: login gagal atau redirect error.

Cek:

```text
http://localhost:3000/api/auth/callback/google
```

harus terdaftar di Google Cloud Console.

### Format private key rusak

Gunakan format satu baris dengan `\n` di `.env.local`:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Spreadsheet belum dishare

Share Google Spreadsheet ke:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
```

sebagai Editor.

### Provider salah

Untuk local stabil:

```env
DATA_PROVIDER=sheets
```

Jangan pakai `postgres` sebelum database, Prisma migration, dan env benar.
