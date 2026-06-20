# JejakSehat Roadmap

## Phase 0 — Foundation

- [x] Next.js, TypeScript, Tailwind CSS
- [x] Responsive landing page
- [x] API versioning dan health endpoint
- [x] PWA manifest
- [x] Service worker dan offline fallback
- [x] Domain entities dan repository contract
- [x] Google Sheets relational schema
- [x] Google Sheets initializer
- [x] Prisma PostgreSQL schema
- [x] Migration strategy documentation
- [ ] Production deployment ke Vercel

## Phase 1 — Authentication

- [x] Auth.js setup
- [x] Google OAuth
- [x] JWT session
- [x] User upsert melalui repository
- [x] Protected dashboard routes
- [x] Logout
- [x] Authorization tests
- [x] Google Cloud OAuth setup documentation
- [ ] Live OAuth credential test

## Phase 2 — Activity Persistence

- [x] Sheets user repository
- [x] Compound Sheets activity repository
- [x] Repository provider factory
- [x] Zod validation untuk gym dan lari
- [x] Authenticated collection dan item API
- [x] Ownership filtering berdasarkan session user ID
- [x] Batched writes untuk activity dan detail
- [x] Soft delete
- [x] PATCH endpoint
- [ ] Live Google Sheets credential test
- [ ] Retry policy untuk rate limit
- [ ] PostgreSQL activity adapter

## Phase 3 — Gym Tracker

- [x] Create gym session
- [x] Multiple exercises
- [x] Multiple sets
- [x] Workout history dan filter
- [x] Workout detail
- [x] Edit tanggal, durasi, nama sesi, lokasi, dan catatan
- [x] Soft delete
- [ ] Edit individual exercise dan set
- [ ] Previous workout comparison

## Phase 4 — Running Tracker

- [x] Create running activity
- [x] Pace calculation
- [x] Running history dan filter
- [x] Running detail
- [x] Run type, RPE, location, dan elevation
- [x] Edit running activity
- [x] Soft delete

## Phase 5 — Body Progress dan Goals

- [x] Body measurements CRUD
- [x] Weight, body fat, dan waist trend charts
- [x] Latest measurement dan delta comparison
- [x] Weekly workout target
- [x] Running distance target
- [x] Target weight untuk naik atau turun berat
- [x] Goal create, update, deactivate, dan soft delete
- [x] Goal progress calculation dari activity dan measurement
- [x] Mobile-first progress interface
- [ ] Live Google Sheets credential test
- [ ] PostgreSQL progress adapter

## Phase 6 — Dashboard

- [x] Weekly activity summary
- [x] Workout duration
- [x] Running distance
- [x] Gym volume
- [x] Active days
- [x] Recent activities
- [x] Goal progress
- [ ] Workout streak

## Phase 7 — PWA Hardening

- [ ] PNG icons 192 dan 512
- [ ] Install prompt
- [ ] Mobile acceptance tests
- [ ] Lighthouse review
- [ ] Accessibility review
- [ ] Offline submission design

## Phase 8 — PostgreSQL Readiness

- [ ] PostgreSQL adapters
- [ ] Sheets validation script
- [ ] Migration dry-run script
- [ ] Provider contract tests
- [ ] Record reconciliation report

## Phase 9 — PostgreSQL Migration

- [ ] Provision PostgreSQL
- [ ] Run Prisma migrations
- [ ] Import and verify data
- [ ] Switch `DATA_PROVIDER`
- [ ] Production smoke test
- [ ] Freeze spreadsheet as read-only backup
