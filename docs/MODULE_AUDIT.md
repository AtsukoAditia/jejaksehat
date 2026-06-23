# JejakSehat Module Audit

Audit ini merangkum status modul berdasarkan README, roadmap, source code, scripts, dan dokumentasi project.

## Status umum

JejakSehat sudah menyelesaikan modul inti aplikasi:

- Authentication architecture.
- Activity persistence.
- Gym tracker.
- Running tracker.
- Body progress.
- Health goals.
- Dashboard insights.
- PWA hardening.
- PostgreSQL readiness.
- Cline local AI workflow.

Project berikutnya masuk tahap live credential verification, deployment, dan migrasi data production.

## Module checklist

| Modul | Status | Catatan |
|---|:---:|---|
| Foundation | Selesai | Next.js, TypeScript, Tailwind, health endpoint, domain contract, Sheets schema, Prisma schema |
| Authentication | Kode selesai | Auth.js, Google OAuth, JWT session, protected dashboard, user upsert; masih perlu live credential test |
| Google Sheets persistence | Kode selesai | User, activity, progress, goals; masih perlu live write test |
| Activity API | Selesai | Collection/item API, validation, ownership, soft delete, PATCH |
| Gym Tracker | Selesai | Create, history, detail, edit metadata, individual exercise/set editor, soft delete, previous workout comparison |
| Running Tracker | Selesai | Create, history, detail, full edit, pace, RPE, location, elevation, soft delete |
| Body Progress | Selesai | Measurement CRUD, latest metric, delta, lightweight charts |
| Health Goals | Selesai | Weekly workout, weekly running distance, target weight, update, deactivate, soft delete |
| Dashboard | Selesai | Weekly summary, duration, distance, volume, active days, recent activities, goals, streak |
| PWA Hardening | Selesai di CI | Manifest, icons, install prompt, iOS guidance, app shortcuts, service worker, offline page, privacy cache policy |
| PostgreSQL Readiness | Selesai secara kode/tooling | Prisma repositories, provider switch, validation, dry-run, reconciliation; belum full import/cutover |
| Cline Local AI Workflow | Selesai | Rules, ignore file, setup, context, backlog, prompts |

## Masih kurang sebelum production

### 1. Live local verification

Belum ada bukti live credential test untuk:

- Google OAuth.
- Google Sheets write/read.
- PostgreSQL connection.

Local verification harus dilakukan menggunakan `.env.local` pribadi dan tidak boleh memasukkan secret ke repository.

### 2. Production deployment

Belum ada deployment production ke Vercel atau provider lain.

Deployment perlu:

- Environment variables production.
- Google OAuth callback production.
- Smoke test login.
- Smoke test Sheets atau PostgreSQL provider.
- HTTPS PWA install check.

### 3. Phase 9 migration

Belum tersedia full import script dari Google Sheets ke PostgreSQL.

Yang masih harus dibuat:

- `scripts/import-sheets-to-postgres.ts`
- dry-run import mode
- idempotency strategy
- duplicate ID handling
- import summary
- provider switch smoke test
- freeze spreadsheet as backup

### 4. Physical PWA test

CI sudah menguji mobile viewport dan Lighthouse, tetapi belum ada test perangkat fisik:

- Android Chrome install.
- iOS Safari Add to Home Screen.
- Standalone login.
- Offline behavior setelah install.

### 5. Encrypted offline write queue

Offline write queue belum dibuat dan tidak boleh ditambahkan sembarangan karena data aplikasi termasuk data kesehatan personal.

Perlu desain khusus untuk:

- enkripsi lokal
- expiry
- conflict resolution
- duplicate prevention
- clear queue
- consent user

## Kesimpulan

Secara fitur aplikasi inti, JejakSehat sudah lengkap untuk dicoba di local dengan Google Sheets.

Yang belum selesai bukan modul UI utama, melainkan tahap operasional:

1. Credential live test.
2. Deployment.
3. Migrasi PostgreSQL production.
4. Physical-device PWA validation.
5. Offline queue yang aman.
