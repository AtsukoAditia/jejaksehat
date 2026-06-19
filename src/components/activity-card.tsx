import Link from "next/link";
import type { ActivityDetail } from "@/src/domain/entities/activity";
import { formatDistance, formatDuration, formatPace, gymVolume } from "@/src/lib/activity-metrics";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ActivityCard({ activity }: { activity: ActivityDetail }) {
  const isRun = activity.activityType === "RUN";
  const title = isRun ? activity.run.runType : activity.gym.title;
  const location = isRun ? activity.run.location : activity.gym.location;

  return (
    <Link href={`/dashboard/activities/${activity.id}`} className="activity-card group">
      <span className={`activity-badge ${isRun ? "activity-badge-run" : "activity-badge-gym"}`} aria-hidden="true">
        {isRun ? "RUN" : "GYM"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="truncate text-lg font-black tracking-tight">{title}</h3>
          <span className="text-xs font-bold text-[var(--muted)]">
            {dateFormatter.format(new Date(`${activity.activityDate}T00:00:00`))}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-[var(--muted)]">{location || "Tanpa lokasi"}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
          <span className="metric-pill">{formatDuration(activity.durationSeconds)}</span>
          {isRun ? (
            <>
              <span className="metric-pill">{formatDistance(activity.run.distanceMeters)}</span>
              <span className="metric-pill">{formatPace(activity.durationSeconds, activity.run.distanceMeters)}</span>
            </>
          ) : (
            <>
              <span className="metric-pill">{activity.gym.exercises.length} gerakan</span>
              <span className="metric-pill">{Math.round(gymVolume(activity)).toLocaleString("id-ID")} kg volume</span>
            </>
          )}
        </div>
      </div>
      <span className="text-xl text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]" aria-hidden="true">›</span>
    </Link>
  );
}
