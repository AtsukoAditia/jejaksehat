# Cline Project Context — JejakSehat

## Product summary

JejakSehat adalah PWA untuk mencatat:

- Aktivitas gym.
- Aktivitas lari.
- Progress tubuh.
- Target kesehatan.
- Workout streak.
- Previous workout comparison.

Database awal memakai Google Sheets. Arsitektur sudah disiapkan untuk PostgreSQL melalui repository provider.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Auth.js
- Google OAuth
- Google Sheets API
- Prisma ORM
- PostgreSQL readiness
- Zod
- Playwright
- Lighthouse CI
- Vercel target deployment

## Provider architecture

Provider dipilih dengan:

```env
DATA_PROVIDER=sheets
```

atau:

```env
DATA_PROVIDER=postgres
```

Factory ada di:

```text
src/infrastructure/repositories/user-repository.ts
src/infrastructure/repositories/activity-repository.ts
src/infrastructure/repositories/progress-repository.ts
```

Contracts ada di:

```text
src/domain/repositories/user-repository.ts
src/domain/repositories/activity-repository.ts
src/domain/repositories/progress-repository.ts
```

Implementasi Sheets:

```text
src/infrastructure/sheets/
```

Implementasi PostgreSQL:

```text
src/infrastructure/postgres/
```

Rule utama: UI tidak boleh tahu provider apa yang dipakai.

## Domain modules

### User

- Google OAuth subject.
- Email, name, avatar.
- Internal UUID.
- Timezone default Asia/Jakarta.

### Activity

Dua tipe:

```text
GYM
RUN
```

Gym memiliki:

- Session title.
- Location.
- Multiple exercises.
- Multiple sets.
- Individual exercise/set editor.
- Reps, weight, RPE, completed.
- Previous workout comparison.

Run memiliki:

- Distance meters.
- Run type.
- Location.
- RPE.
- Elevation gain.
- Full edit flow.

### Progress

Body measurement:

- Weight kg.
- Body fat percent.
- Waist cm.
- Notes.

Goals:

- Weekly workouts.
- Weekly running distance.
- Target weight.

### Dashboard

- Weekly summary.
- Goal progress.
- Workout streak.
- Recent activities.

### PWA

- Install prompt.
- Icons.
- Offline fallback.
- Network banner.
- Private data cache exclusion.

## Important files

```text
README.md
docs/MODULE_AUDIT.md
docs/ROADMAP.md
docs/POSTGRES_READINESS.md
docs/PWA_HARDENING.md
docs/PHASE6_COMPLETION.md
prisma/schema.prisma
app/manifest.ts
public/sw.js
```

## Current completed phases

- Phase 0 Foundation
- Phase 1 Authentication code
- Phase 2 Activity Persistence
- Phase 3 Gym Tracker
- Phase 4 Running Tracker
- Phase 5 Body Progress and Goals
- Phase 6 Dashboard Completion
- Phase 7 PWA Hardening
- Phase 8 PostgreSQL Readiness

## Current known gaps

- Live Google OAuth credential test.
- Live Google Sheets credential test.
- Live PostgreSQL credential test.
- Full Sheets to PostgreSQL import script.
- Vercel production deployment.
- Physical Android/iOS install test.
- Encrypted offline write queue.

## UI principles

- Mobile-first.
- Health-focused visual language.
- Emerald, teal, lime, and warm neutral palette.
- Avoid admin-dashboard feeling.
- Keep copy encouraging but not guilt-inducing.
- Touch targets should be comfortable on mobile.
- Respect reduced motion.

## Security principles

- Never trust browser user IDs.
- Always derive ownership from Auth.js session.
- Use soft delete for user health data.
- Do not cache private API or dashboard data.
- Do not expose secrets through logs, docs, test snapshots, or generated artifacts.

## Testing principles

Use pure helper tests for calculations and provider behavior.

Existing test themes:

- Activity metrics.
- Progress metrics.
- Workout insights.
- Provider contracts.
- PWA cache contract.

Do not weaken tests to make CI pass.
