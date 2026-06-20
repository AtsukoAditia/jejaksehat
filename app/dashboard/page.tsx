import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { ActivityCard } from "@/src/components/activity-card";
import { DashboardGoals } from "@/src/components/dashboard-goals";
import type { ActivityDetail } from "@/src/domain/entities/activity";
import type { BodyMeasurement, Goal } from "@/src/domain/entities/progress";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";
import { formatDistance, formatDuration, isWithinCurrentWeek, summarizeActivities } from "@/src/lib/activity-metrics";
import { calculateGoalProgress } from "@/src/lib/progress-metrics";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const displayName = session?.user?.name?.split(" ")[0] ?? "Kamu";
  let activities: ActivityDetail[] = [];
  let measurements: BodyMeasurement[] = [];
  let goals: Goal[] = [];
  let unavailable = false;

  try {
    activities = await getActivityRepository().findByUser(session!.user!.id!, { limit: 100 });
  } catch {
    unavailable = true;
  }

  try {
    [measurements, goals] = await Promise.all([
      getProgressRepository().findMeasurementsByUser(session!.user!.id!, 100),
      getProgressRepository().findGoalsByUser(session!.user!.id!, true),
    ]);
  } catch {
    unavailable = true;
  }

  const weeklyActivities = activities.filter((activity) => isWithinCurrentWeek(activity.activityDate));
  const summary = summarizeActivities(weeklyActivities);
  const recent = activities.slice(0, 4);
  const goalProgress = goals.map((goal) => calculateGoalProgress(goal, activities, measurements));

  return (
    <div className="space-y-7">
      <header className="flex items-end justify-between gap-4">
        <div><p className="eyebrow">Dashboard kesehatan</p><h1 className="page-title">Halo, {displayName} 👋</h1><p className="page-subtitle">Setiap gerakan kecil tetap meninggalkan jejak.</p></div>
        <Link href="/dashboard/activities/new" className="primary-action hidden sm:flex">＋ Catat aktivitas</Link>
      </header>
      <section className="hero-health">
        <div className="relative z-10 max-w-2xl">
          <span className="hero-kicker">JEJAK MINGGU INI</span>
          <h2>{summary.sessionCount > 0 ? `${summary.sessionCount} sesi. Konsistensi sedang dibangun.` : "Mulai jejak sehat pertamamu hari ini."}</h2>
          <p>{summary.sessionCount > 0 ? `Kamu sudah aktif selama ${formatDuration(summary.totalDurationSeconds)} di ${summary.activeDays} hari berbeda.` : "Catat latihan gym atau lari dalam kurang dari satu menit."}</p>
          <Link href="/dashboard/activities/new" className="hero-button">{summary.sessionCount > 0 ? "Tambah sesi" : "Mulai sekarang"} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span>♥</span></div>
      </section>
      {unavailable && <div className="error-banner">Sebagian data belum dapat dibaca. Lengkapi environment Google Sheets saat pengujian nanti.</div>}
      <section className="stats-grid" aria-label="Ringkasan minggu ini">
        <article className="stat-card"><span className="stat-icon stat-icon-green">⌁</span><p>Aktivitas</p><strong>{summary.sessionCount}</strong><small>sesi minggu ini</small></article>
        <article className="stat-card"><span className="stat-icon stat-icon-teal">◷</span><p>Waktu aktif</p><strong>{formatDuration(summary.totalDurationSeconds)}</strong><small>waktu untuk diri sendiri</small></article>
        <article className="stat-card"><span className="stat-icon stat-icon-lime">↗</span><p>Jarak lari</p><strong>{formatDistance(summary.runningDistanceMeters)}</strong><small>total langkah maju</small></article>
        <article className="stat-card"><span className="stat-icon stat-icon-blue">◆</span><p>Volume gym</p><strong>{Math.round(summary.gymVolumeKg).toLocaleString("id-ID")}</strong><small>kilogram terangkat</small></article>
      </section>
      <section>
        <div className="section-title-row"><div><p className="eyebrow">Target aktif</p><h2>Arah minggu ini</h2></div><Link href="/dashboard/progress" className="text-link">Kelola target →</Link></div>
        <div className="mt-4"><DashboardGoals progress={goalProgress} /></div>
      </section>
      <section>
        <div className="section-title-row"><div><p className="eyebrow">Aktivitas terbaru</p><h2>Jejak terakhir</h2></div><Link href="/dashboard/activities" className="text-link">Lihat semua →</Link></div>
        {recent.length > 0 ? <div className="mt-4 grid gap-3">{recent.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div> : <div className="empty-state mt-4"><span>🌱</span><h3>Belum ada jejak</h3><p>Sesi pertamamu tidak perlu sempurna. Yang penting mulai.</p><Link href="/dashboard/activities/new" className="primary-action">Catat aktivitas pertama</Link></div>}
      </section>
    </div>
  );
}
