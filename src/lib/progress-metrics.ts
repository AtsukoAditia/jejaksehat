import type { ActivityDetail } from "@/src/domain/entities/activity";
import type { BodyMeasurement, Goal, GoalProgress } from "@/src/domain/entities/progress";
import { isWithinCurrentWeek } from "./activity-metrics";

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function measurementDelta(
  latest: BodyMeasurement | undefined,
  previous: BodyMeasurement | undefined,
  field: "weightKg" | "bodyFatPercent" | "waistCm",
): number | null {
  if (!latest || !previous) return null;
  const current = latest[field];
  const before = previous[field];
  if (current == null || before == null) return null;
  return Number((current - before).toFixed(2));
}

function weeklyWorkoutProgress(goal: Goal, activities: ActivityDetail[]): GoalProgress {
  const currentValue = activities.filter((activity) => isWithinCurrentWeek(activity.activityDate)).length;
  const progressPercent = clampPercent((currentValue / goal.targetValue) * 100);
  return {
    goal,
    currentValue,
    progressPercent,
    remainingValue: Math.max(0, goal.targetValue - currentValue),
    status: progressPercent >= 100 ? "ACHIEVED" : currentValue > 0 ? "IN_PROGRESS" : "NOT_STARTED",
  };
}

function weeklyRunningProgress(goal: Goal, activities: ActivityDetail[]): GoalProgress {
  const currentValue = Number((activities
    .filter((activity) => activity.activityType === "RUN" && isWithinCurrentWeek(activity.activityDate))
    .reduce((total, activity) => total + (activity.activityType === "RUN" ? activity.run.distanceMeters : 0), 0) / 1000).toFixed(2));
  const progressPercent = clampPercent((currentValue / goal.targetValue) * 100);
  return {
    goal,
    currentValue,
    progressPercent,
    remainingValue: Number(Math.max(0, goal.targetValue - currentValue).toFixed(2)),
    status: progressPercent >= 100 ? "ACHIEVED" : currentValue > 0 ? "IN_PROGRESS" : "NOT_STARTED",
  };
}

function targetWeightProgress(goal: Goal, measurements: BodyMeasurement[]): GoalProgress {
  const ordered = [...measurements].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  const latest = ordered.at(-1);
  const baseline = ordered.find((item) => item.measuredAt >= goal.startDate) ?? ordered[0];

  if (!latest || !baseline) {
    return { goal, currentValue: null, progressPercent: 0, remainingValue: null, status: "NOT_STARTED" };
  }

  const target = goal.targetValue;
  const start = baseline.weightKg;
  const current = latest.weightKg;
  const needsLoss = target < start;
  const achieved = needsLoss ? current <= target : current >= target;
  const totalDistance = Math.abs(start - target);
  const movedTowardTarget = needsLoss ? Math.max(0, start - current) : Math.max(0, current - start);
  const progressPercent = achieved || totalDistance === 0 ? 100 : clampPercent((movedTowardTarget / totalDistance) * 100);

  return {
    goal,
    currentValue: current,
    progressPercent,
    remainingValue: achieved ? 0 : Number(Math.abs(current - target).toFixed(2)),
    status: achieved ? "ACHIEVED" : movedTowardTarget > 0 ? "IN_PROGRESS" : "NOT_STARTED",
  };
}

export function calculateGoalProgress(
  goal: Goal,
  activities: ActivityDetail[],
  measurements: BodyMeasurement[],
): GoalProgress {
  if (goal.goalType === "WEEKLY_WORKOUTS") return weeklyWorkoutProgress(goal, activities);
  if (goal.goalType === "WEEKLY_RUNNING_DISTANCE") return weeklyRunningProgress(goal, activities);
  return targetWeightProgress(goal, measurements);
}

export function buildSparklinePoints(
  values: number[],
  width = 320,
  height = 120,
  padding = 10,
): string {
  if (values.length === 0) return "";
  if (values.length === 1) return `${width / 2},${height / 2}`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * usableWidth;
      const y = padding + ((max - value) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
