import type { WorkoutStreak } from "@/src/lib/workout-insights";

export function WorkoutStreakCard({ streak }: { streak: WorkoutStreak }) {
  const message =
    streak.current >= 7
      ? "Konsistensi kuat. Jaga recovery agar ritmenya tetap sehat."
      : streak.current >= 3
        ? "Ritme mulai terbentuk. Satu hari pada satu waktu."
        : streak.current > 0
          ? "Jejak aktif. Lanjutkan tanpa memaksakan tubuh."
          : "Belum ada streak aktif. Satu sesi hari ini bisa memulainya.";

  return (
    <article className="streak-card">
      <div className="streak-flame" aria-hidden="true">✦</div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow">Workout streak</p>
        <div className="mt-2 flex items-baseline gap-2">
          <strong>{streak.current}</strong>
          <span>hari beruntun</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{message}</p>
      </div>
      <dl className="streak-meta">
        <div><dt>Terpanjang</dt><dd>{streak.longest} hari</dd></div>
        <div><dt>Hari aktif</dt><dd>{streak.totalActiveDays}</dd></div>
      </dl>
    </article>
  );
}
