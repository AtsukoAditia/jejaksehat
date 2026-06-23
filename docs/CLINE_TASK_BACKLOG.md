# Cline Task Backlog — JejakSehat

Gunakan file ini untuk memilih task kecil saat bekerja dengan Cline lokal.

## Completed recently

### Individual gym exercise/set editor

Status: selesai.

Yang sudah tersedia:

- Edit nama gerakan.
- Edit kelompok otot.
- Edit reps.
- Edit beban.
- Edit RPE.
- Edit status completed.
- Tambah dan hapus set.
- Tambah dan hapus gerakan.
- Submit melalui `PATCH /api/v1/activities/:id`.

## Priority 1 — Local live verification

### Task 1.1 — Test Google OAuth locally

Goal:

- Pastikan login Google berjalan di `http://localhost:3000`.

Checklist:

- `.env.local` berisi `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
- Callback lokal terdaftar di Google Cloud Console.
- Login redirect ke dashboard.
- Session memiliki internal user ID.
- Logout bekerja.

Do not commit:

- OAuth client secret.
- Screenshot berisi email pribadi.

### Task 1.2 — Test Google Sheets live write

Goal:

- Pastikan user upsert, activity, progress, dan goal benar-benar menulis ke Sheets.

Checklist:

- Spreadsheet dishare ke service account.
- `npm run sheets:validate` hijau.
- Login membuat row user.
- Catat gym membuat rows di activities, gym_sessions, gym_exercises, gym_sets.
- Edit gym mengubah exercise dan set dengan benar.
- Catat lari membuat rows di activities dan runs.
- Catat body measurement membuat row di body_measurements.
- Buat goal membuat row di goals.

## Priority 2 — Phase 9 import script

Goal:

- Build full import from Google Sheets to PostgreSQL.

Suggested scripts:

```text
scripts/import-sheets-to-postgres.ts
```

Requirements:

- Read all Sheets tabs.
- Validate headers before import.
- Import users first.
- Import activities.
- Import gym sessions, exercises, and sets.
- Import runs.
- Import body measurements.
- Import goals.
- Support dry-run mode.
- Support idempotency or fail clearly on duplicate IDs.
- Print summary table.
- Do not delete existing PostgreSQL records automatically.

Suggested command:

```bash
npm run db:import:dry-run
npm run db:import
```

## Priority 3 — Vercel preview deployment

Goal:

- Deploy JejakSehat preview and test OAuth callback.

Checklist:

- Set Vercel env variables.
- Add preview callback URL to Google OAuth.
- Verify login.
- Verify Sheets access.
- Verify PWA manifest and service worker over HTTPS.

Do not commit:

- Vercel env values.
- OAuth secrets.
- Database URLs.

## Priority 4 — Physical PWA install tests

Goal:

- Validate install behavior on actual devices.

Android Chrome:

- Open deployed URL.
- Confirm install prompt appears.
- Install app.
- Launch from home screen.
- Login works in standalone mode.
- Offline page appears when disconnected.

iOS Safari:

- Open deployed URL.
- Use Share → Add to Home Screen.
- Launch from icon.
- Login works in standalone mode.
- Safe-area layout looks correct.

## Priority 5 — Encrypted offline write queue research

Goal:

- Design safe offline submission for health data.

Do not implement directly until design is approved.

Design requirements:

- Local encryption.
- Queue expiry.
- Duplicate prevention.
- Conflict resolution.
- Clear user consent.
- Manual retry and clear queue.
- No silent permanent storage of health data.

## Good Cline task format

Use this format when asking Cline:

```text
Task: <one focused feature/fix>
Context files to read:
- .clinerules
- docs/CLINE_PROJECT_CONTEXT.md
- docs/CLINE_TASK_BACKLOG.md
- relevant source files
Constraints:
- Do not touch unrelated files
- Do not read or commit .env
- Keep DATA_PROVIDER=sheets default
Verification:
- npm run lint
- npm run typecheck
- npm test
- npm run build
Expected output:
- Summary of changed files
- Commands run
- Anything untested
```
