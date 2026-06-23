# Cline Prompts — JejakSehat

Gunakan prompt berikut di Cline agar hasil kerja lebih stabil dan tidak melebar.

## 1. Initial project scan

```text
Baca .clinerules, README.md, docs/CLINE_PROJECT_CONTEXT.md, docs/CLINE_TASK_BACKLOG.md, docs/ROADMAP.md, dan docs/POSTGRES_READINESS.md.

Setelah membaca, jawab ringkas:
1. Arsitektur project ini.
2. Provider database yang tersedia.
3. Modul yang sudah selesai.
4. Modul yang belum selesai.
5. Verification commands yang wajib dipakai.

Jangan edit file dulu.
```

## 2. Safe coding mode

```text
Kerjakan task berikut secara incremental: <ISI TASK>.

Rules:
- Ikuti .clinerules.
- Jangan baca atau commit .env dan file credential.
- Jangan ubah arsitektur provider tanpa alasan kuat.
- Jangan melemahkan test atau CI.
- Jangan menambah dependency berat tanpa persetujuan.
- Setelah perubahan, jalankan lint, typecheck, test, dan build jika memungkinkan.

Sebelum coding, sebutkan file yang akan kamu baca dan rencana perubahan singkat.
```

## 3. Debug local error

```text
Saya mendapat error berikut saat menjalankan JejakSehat lokal:

<PASTE ERROR>

Tolong:
1. Identifikasi root cause paling mungkin.
2. Cek file relevan.
3. Beri patch minimal.
4. Jangan ubah behavior yang tidak terkait.
5. Jalankan verification yang relevan.
```

## 4. Implement feature with tests

```text
Implementasikan feature berikut: <ISI FEATURE>.

Acceptance criteria:
- <KRITERIA 1>
- <KRITERIA 2>
- <KRITERIA 3>

Tambahkan atau update test yang relevan.
Pastikan tetap mobile-first dan ownership data aman.
Jalankan:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Laporkan file yang berubah dan hasil command.
```

## 5. PostgreSQL migration task

```text
Kita akan mengerjakan bagian PostgreSQL readiness/migration.

Baca:
- .clinerules
- docs/POSTGRES_READINESS.md
- prisma/schema.prisma
- src/domain/repositories/*
- src/infrastructure/postgres/*
- scripts/validate-sheets.ts
- scripts/postgres-dry-run.ts
- scripts/reconcile-records.ts

Task: <ISI TASK>

Constraints:
- Jangan ubah DATA_PROVIDER default dari sheets.
- Jangan butuh live database untuk unit test.
- Migration script harus punya dry-run mode.
- Jangan hapus data PostgreSQL otomatis.
- Jangan commit env atau dump data.
```

## 6. PWA/mobile task

```text
Kita akan mengubah PWA/mobile behavior.

Baca:
- .clinerules
- docs/PWA_HARDENING.md
- app/manifest.ts
- public/sw.js
- app/pwa.css
- tests/e2e/mobile.spec.ts
- tests/pwa-contract.test.ts

Task: <ISI TASK>

Constraints:
- Jangan cache /api/*.
- Jangan cache dashboard private data.
- Perhatikan viewport 320px.
- Perhatikan keyboard focus dan reduced motion.
- Jalankan Playwright dan Lighthouse jika memungkinkan.
```

## 7. Final review prompt

```text
Review seluruh perubahan pada branch ini.

Tolong cek:
1. Apakah ada file rahasia atau local artifact yang ikut berubah?
2. Apakah ada perubahan unrelated?
3. Apakah architecture rules tetap diikuti?
4. Apakah tests memadai?
5. Apakah README/docs perlu update?
6. Apakah ada risiko production?

Jangan edit dulu. Beri daftar temuan dan rekomendasi patch minimal.
```
