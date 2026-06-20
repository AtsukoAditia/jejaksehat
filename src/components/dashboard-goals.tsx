import Link from "next/link";
import type { GoalProgress } from "@/src/domain/entities/progress";

const labels = {
  WEEKLY_WORKOUTS: "Latihan minggu ini",
  WEEKLY_RUNNING_DISTANCE: "Jarak lari minggu ini",
  TARGET_WEIGHT: "Target berat badan",
} as const;

export function DashboardGoals({ progress }: { progress: GoalProgress[] }) {
  if (progress.length === 0) {
    return (
      <div className="goal-empty">
        <span>◎</span>
        <div><h3>Belum ada target aktif</h3><p>Buat target realistis untuk memberi arah pada aktivitas dan progress tubuhmu.</p><Link href="/dashboard/progress" className="text-link mt-2 inline-block">Atur target →</Link></div>
      </div>
    );
  }

  return (
    <div className="dashboard-goals">
      {progress.map((item) => (
        <Link key={item.goal.id} href="/dashboard/progress" className="dashboard-goal">
          <div className="dashboard-goal-header"><strong>{labels[item.goal.goalType]}</strong><span>{item.progressPercent}%</span></div>
          <div className="goal-track"><span style={{ width: `${item.progressPercent}%` }} /></div>
          <p className="mt-2 text-xs font-bold text-[var(--muted)]">{item.currentValue == null ? "Belum ada data" : `${item.currentValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${item.goal.targetValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${item.goal.unit}`}</p>
        </Link>
      ))}
    </div>
  );
}
