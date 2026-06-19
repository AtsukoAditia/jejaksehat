import type { ActivityDashboardSummary, ActivityDetail } from "@/src/domain/entities/activity";

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (hours === 0) return `${minutes} mnt`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours}j ${minutes}m`;
}

export function formatDistance(distanceMeters: number): string {
  return `${(distanceMeters / 1000).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })} km`;
}

export function paceSecondsPerKm(durationSeconds: number, distanceMeters: number): number | null {
  if (durationSeconds <= 0 || distanceMeters <= 0) return null;
  return Math.round(durationSeconds / (distanceMeters / 1000));
}

export function formatPace(durationSeconds: number, distanceMeters: number): string {
  const pace = paceSecondsPerKm(durationSeconds, distanceMeters);
  if (!pace) return "—";
  const minutes = Math.floor(pace / 60);
  const seconds = pace % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export function gymVolume(activity: ActivityDetail): number {
  if (activity.activityType !== "GYM") return 0;
  return activity.gym.exercises.reduce(
    (exerciseTotal, exercise) =>
      exerciseTotal +
      exercise.sets.reduce(
        (setTotal, set) => setTotal + (set.completed ? set.reps * set.weightKg : 0),
        0,
      ),
    0,
  );
}

export function summarizeActivities(activities: ActivityDetail[]): ActivityDashboardSummary {
  return activities.reduce<ActivityDashboardSummary>(
    (summary, activity) => {
      summary.sessionCount += 1;
      summary.totalDurationSeconds += activity.durationSeconds;
      summary.activeDays = new Set([
        ...activities.slice(0, summary.sessionCount).map((item) => item.activityDate),
      ]).size;

      if (activity.activityType === "RUN") {
        summary.runningDistanceMeters += activity.run.distanceMeters;
      } else {
        summary.gymVolumeKg += gymVolume(activity);
      }

      return summary;
    },
    {
      sessionCount: 0,
      totalDurationSeconds: 0,
      runningDistanceMeters: 0,
      gymVolumeKg: 0,
      activeDays: 0,
    },
  );
}

export function isWithinCurrentWeek(activityDate: string, now = new Date()): boolean {
  const target = new Date(`${activityDate}T00:00:00`);
  const day = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return target >= start && target < end;
}
