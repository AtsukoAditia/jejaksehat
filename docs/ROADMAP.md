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

## Phase 2 — Persistence Adapters

- [x] Sheets user repository
- [ ] Sheets activity repository
- [x] Repository factory
- [ ] Data validation dengan Zod
- [ ] Mock repository untuk tests
- [ ] Error mapping dan retry policy

## Phase 3 — Gym Tracker

- [ ] Create gym session
- [ ] Multiple exercises
- [ ] Multiple sets
- [ ] Workout history
- [ ] Workout detail
- [ ] Edit dan soft delete
- [ ] Previous workout comparison

## Phase 4 — Running Tracker

- [ ] Create running activity
- [ ] Pace calculation
- [ ] Running history
- [ ] Detail, edit, dan soft delete
- [ ] Run type dan RPE

## Phase 5 — Body Progress dan Goals

- [ ] Body measurements CRUD
- [ ] Progress charts
- [ ] Weekly workout target
- [ ] Running distance target
- [ ] Target weight

## Phase 6 — Dashboard

- [ ] Weekly activity summary
- [ ] Workout duration
- [ ] Running distance
- [ ] Workout streak
- [ ] Goal progress
- [ ] Recent activities

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
