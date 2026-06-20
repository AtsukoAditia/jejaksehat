import Link from "next/link";
import type { GymWorkoutComparison, MetricComparison } from "@/src/lib/workout-insights";
import { formatDuration } from "@/src/lib/activity-metrics";

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value > 0;
  const neutral = value === 0;
  return (
    <span className={`comparison-delta ${neutral ? "comparison-neutral" : positive ? "comparison-up" : "comparison-down"}`}>
      {positive ? "+" : ""}{value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}{suffix}
    </span>
  );
}

function MetricCard({ label, metric, formatter }: { label: string; metric: MetricComparison; formatter?: (value: number) => string }) {
  const display = formatter ?? ((value: number) => value.toLocaleString("id-ID", { maximumFractionDigits: 2 }));
  return (
    <article className="comparison-metric">
      <span>{label}</span>
      <strong>{display(metric.current)}</strong>
      <div><small>Sebelumnya {display(metric.previous)}</small><Delta value={metric.delta} /></div>
    </article>
  );
}

export function WorkoutComparison({ comparison }: { comparison: GymWorkoutComparison | null }) {
  if (!comparison) {
    return (
      <section className="comparison-empty">
        <span aria-hidden="true">↔</span>
        <div><p className="eyebrow">Perbandingan workout</p><h2>Belum ada sesi pembanding</h2><p>Simpan sesi dengan nama yang sama lagi untuk melihat perubahan volume, durasi, set, dan beban terbaik.</p></div>
      </section>
    );
  }

  const previousDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
    new Date(`${comparison.previous.activityDate}T00:00:00`),
  );

  return (
    <section className="comparison-section">
      <div className="section-title-row">
        <div><p className="eyebrow">Vs workout sebelumnya</p><h2>Apa yang berubah?</h2><p className="mt-1 text-sm text-[var(--muted)]">Dibandingkan dengan sesi {previousDate}.</p></div>
        <Link href={`/dashboard/activities/${comparison.previous.id}`} className="text-link">Buka sesi lama →</Link>
      </div>

      <div className="comparison-grid mt-4">
        <MetricCard label="Durasi" metric={comparison.duration} formatter={formatDuration} />
        <MetricCard label="Volume" metric={comparison.volume} formatter={(value) => `${Math.round(value).toLocaleString("id-ID")} kg`} />
        <MetricCard label="Total set" metric={comparison.sets} />
        <MetricCard label="Gerakan" metric={comparison.exercises} />
      </div>

      {comparison.exerciseComparisons.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] px-4 py-3"><h3 className="font-black">Gerakan yang sama</h3><p className="mt-1 text-xs text-[var(--muted)]">Volume dan beban terbaik dibanding sesi sebelumnya.</p></div>
          <div className="overflow-x-auto">
            <table className="comparison-table">
              <thead><tr><th>Gerakan</th><th>Volume sekarang</th><th>Δ Volume</th><th>Beban terbaik</th><th>Δ Beban</th></tr></thead>
              <tbody>
                {comparison.exerciseComparisons.map((exercise) => (
                  <tr key={exercise.exerciseName}>
                    <td><strong>{exercise.exerciseName}</strong></td>
                    <td>{Math.round(exercise.currentVolumeKg).toLocaleString("id-ID")} kg</td>
                    <td><Delta value={Math.round(exercise.deltaVolumeKg)} suffix=" kg" /></td>
                    <td>{exercise.currentBestWeightKg.toLocaleString("id-ID")} kg</td>
                    <td><Delta value={exercise.deltaBestWeightKg} suffix=" kg" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
