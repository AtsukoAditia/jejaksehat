import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { DeleteMeasurementButton } from "@/src/components/delete-measurement-button";
import { GoalManager } from "@/src/components/goal-manager";
import { ProgressChart } from "@/src/components/progress-chart";
import type { ActivityDetail } from "@/src/domain/entities/activity";
import type { BodyMeasurement, Goal } from "@/src/domain/entities/progress";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";
import { calculateGoalProgress, measurementDelta } from "@/src/lib/progress-metrics";

export const metadata: Metadata = { title: "Progress Tubuh" };

function formatDelta(value: number | null, unit: string): string {
  if (value == null) return "Belum ada pembanding";
  if (value === 0) return `Stabil 0 ${unit}`;
  return `${value > 0 ? "+" : ""}${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${unit}`;
}

export default async function ProgressPage() {
  const session = await auth();
  let measurements: BodyMeasurement[] = [];
  let goals: Goal[] = [];
  let activities: ActivityDetail[] = [];
  let unavailable = false;

  try {
    [measurements, goals, activities] = await Promise.all([
      getProgressRepository().findMeasurementsByUser(session!.user!.id!, 100),
      getProgressRepository().findGoalsByUser(session!.user!.id!, false),
      getActivityRepository().findByUser(session!.user!.id!, { limit: 100 }),
    ]);
  } catch {
    unavailable = true;
  }

  const latest = measurements[0];
  const previous = measurements[1];
  const activeGoals = goals.filter((goal) => goal.isActive);
  const goalProgress = activeGoals.map((goal) => calculateGoalProgress(goal, activities, measurements));
  const targetWeight = activeGoals.find((goal) => goal.goalType === "TARGET_WEIGHT");

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Progress personal</p><h1 className="page-title">Tubuhmu bukan sekadar angka.</h1><p className="page-subtitle max-w-2xl">Catat secara konsisten, lihat arah perubahan, dan gunakan target sebagai panduan—bukan tekanan.</p></div>
        <Link href="/dashboard/progress/measurements/new" className="primary-action">＋ Catat pengukuran</Link>
      </header>

      {unavailable && <div className="error-banner">Data progress belum dapat dibaca. Konfigurasi Google Sheets akan diuji nanti.</div>}

      <section className="progress-hero">
        <div>
          <span className="hero-kicker">KONDISI TERBARU</span>
          {latest ? (
            <><h2>{latest.weightKg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}<small> kg</small></h2><p>Diukur {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(`${latest.measuredAt}T00:00:00`))}{targetWeight ? ` · Target ${targetWeight.targetValue.toLocaleString("id-ID")} kg` : ""}</p></>
          ) : (
            <><h2>Mulai dari hari ini.</h2><p>Pengukuran pertama akan menjadi baseline perjalananmu.</p></>
          )}
        </div>
        <div className="progress-rings" aria-hidden="true"><span>{latest ? "◎" : "＋"}</span></div>
      </section>

      <section className="body-stats-grid" aria-label="Ringkasan tubuh terbaru">
        <article className="body-stat"><span>Berat badan</span><strong>{latest ? `${latest.weightKg.toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg` : "—"}</strong><small className={(measurementDelta(latest, previous, "weightKg") ?? 0) > 0 ? "delta-up" : "delta-down"}>{formatDelta(measurementDelta(latest, previous, "weightKg"), "kg")}</small></article>
        <article className="body-stat"><span>Body fat</span><strong>{latest?.bodyFatPercent != null ? `${latest.bodyFatPercent.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%` : "—"}</strong><small className={(measurementDelta(latest, previous, "bodyFatPercent") ?? 0) > 0 ? "delta-up" : "delta-down"}>{formatDelta(measurementDelta(latest, previous, "bodyFatPercent"), "%")}</small></article>
        <article className="body-stat"><span>Lingkar pinggang</span><strong>{latest?.waistCm != null ? `${latest.waistCm.toLocaleString("id-ID", { maximumFractionDigits: 2 })} cm` : "—"}</strong><small className={(measurementDelta(latest, previous, "waistCm") ?? 0) > 0 ? "delta-up" : "delta-down"}>{formatDelta(measurementDelta(latest, previous, "waistCm"), "cm")}</small></article>
      </section>

      <section>
        <div className="section-title-row"><div><p className="eyebrow">Tren pengukuran</p><h2>Lihat arah, bukan fluktuasi harian</h2></div></div>
        <div className="trend-grid mt-4">
          <ProgressChart measurements={measurements} metric="weightKg" label="Berat badan" unit="kg" tone="green" />
          <ProgressChart measurements={measurements} metric="bodyFatPercent" label="Body fat" unit="%" tone="teal" />
          <ProgressChart measurements={measurements} metric="waistCm" label="Lingkar pinggang" unit="cm" tone="lime" />
        </div>
      </section>

      <section>
        <div className="section-title-row"><div><p className="eyebrow">Target kesehatan</p><h2>Arah yang sedang kamu tuju</h2></div></div>
        <div className="mt-4"><GoalManager progress={goalProgress} /></div>
      </section>

      <section>
        <div className="section-title-row"><div><p className="eyebrow">Riwayat</p><h2>Catatan pengukuran</h2></div><Link href="/dashboard/progress/measurements/new" className="text-link">Tambah baru →</Link></div>
        {measurements.length > 0 ? (
          <div className="measurement-list mt-4">
            {measurements.map((item) => (
              <article key={item.id} className="measurement-row">
                <div className="measurement-date"><strong>{new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(new Date(`${item.measuredAt}T00:00:00`))}</strong><span>{new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(new Date(`${item.measuredAt}T00:00:00`))}</span></div>
                <div className="measurement-values"><div><span>Berat</span><strong>{item.weightKg} kg</strong></div><div><span>Body fat</span><strong>{item.bodyFatPercent != null ? `${item.bodyFatPercent}%` : "—"}</strong></div><div><span>Pinggang</span><strong>{item.waistCm != null ? `${item.waistCm} cm` : "—"}</strong></div></div>
                <div className="measurement-actions"><Link href={`/dashboard/progress/measurements/${item.id}/edit`}>Edit</Link><DeleteMeasurementButton measurementId={item.id} /></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-4"><span>📈</span><h3>Belum ada pengukuran</h3><p>Mulai dengan berat badan. Body fat dan lingkar pinggang dapat ditambahkan nanti.</p><Link href="/dashboard/progress/measurements/new" className="primary-action">Catat baseline</Link></div>
        )}
      </section>
    </div>
  );
}
