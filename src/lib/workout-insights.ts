import type { ActivityDetail, GymActivityDetail } from "@/src/domain/entities/activity";
import { gymVolume } from "./activity-metrics";

export interface WorkoutStreak {
  current: number;
  longest: number;
  totalActiveDays: number;
  latestActivityDate: string | null;
}

export interface MetricComparison {
  current: number;
  previous: number;
  delta: number;
  percentChange: number | null;
}

export interface ExerciseComparison {
  exerciseName: string;
  currentVolumeKg: number;
  previousVolumeKg: number;
  deltaVolumeKg: number;
  currentBestWeightKg: number;
  previousBestWeightKg: number;
  deltaBestWeightKg: number;
}

export interface GymWorkoutComparison {
  previous: GymActivityDetail;
  duration: MetricComparison;
  volume: MetricComparison;
  sets: MetricComparison;
  exercises: MetricComparison;
  exerciseComparisons: ExerciseComparison[];
}

const DAY_MS = 86_400_000;

function toUtcDay(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function dayDifference(later: string, earlier: string): number {
  return Math.round((toUtcDay(later) - toUtcDay(earlier)) / DAY_MS);
}

export function jakartaDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function calculateWorkoutStreak(
  activities: ActivityDetail[],
  today = jakartaDateKey(),
): WorkoutStreak {
  const dates = [...new Set(activities.map((activity) => activity.activityDate))].sort();
  if (dates.length === 0) {
    return { current: 0, longest: 0, totalActiveDays: 0, latestActivityDate: null };
  }

  let longest = 1;
  let running = 1;
  for (let index = 1; index < dates.length; index += 1) {
    if (dayDifference(dates[index], dates[index - 1]) === 1) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 1;
    }
  }

  const descending = [...dates].reverse();
  const latest = descending[0];
  const latestGap = dayDifference(today, latest);
  let current = latestGap === 0 || latestGap === 1 ? 1 : 0;

  if (current > 0) {
    for (let index = 1; index < descending.length; index += 1) {
      if (dayDifference(descending[index - 1], descending[index]) !== 1) break;
      current += 1;
    }
  }

  return {
    current,
    longest,
    totalActiveDays: dates.length,
    latestActivityDate: latest,
  };
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ");
}

function totalSets(activity: GymActivityDetail): number {
  return activity.gym.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
}

function compareMetric(current: number, previous: number): MetricComparison {
  const delta = Number((current - previous).toFixed(2));
  return {
    current,
    previous,
    delta,
    percentChange: previous === 0 ? null : Number(((delta / previous) * 100).toFixed(1)),
  };
}

function exerciseVolume(exercise: GymActivityDetail["gym"]["exercises"][number]): number {
  return exercise.sets.reduce(
    (total, set) => total + (set.completed ? set.reps * set.weightKg : 0),
    0,
  );
}

function exerciseBestWeight(exercise: GymActivityDetail["gym"]["exercises"][number]): number {
  return exercise.sets.reduce(
    (best, set) => (set.completed ? Math.max(best, set.weightKg) : best),
    0,
  );
}

export function findPreviousComparableWorkout(
  current: GymActivityDetail,
  activities: ActivityDetail[],
): GymActivityDetail | null {
  const title = normalize(current.gym.title);
  return activities
    .filter((activity): activity is GymActivityDetail => activity.activityType === "GYM")
    .filter((activity) => activity.id !== current.id && normalize(activity.gym.title) === title)
    .filter(
      (activity) =>
        activity.activityDate < current.activityDate ||
        (activity.activityDate === current.activityDate && activity.createdAt < current.createdAt),
    )
    .sort(
      (a, b) =>
        b.activityDate.localeCompare(a.activityDate) || b.createdAt.localeCompare(a.createdAt),
    )[0] ?? null;
}

export function compareGymWorkouts(
  current: GymActivityDetail,
  previous: GymActivityDetail,
): GymWorkoutComparison {
  const previousExercises = new Map(
    previous.gym.exercises.map((exercise) => [normalize(exercise.exerciseName), exercise]),
  );

  const exerciseComparisons = current.gym.exercises
    .map((exercise): ExerciseComparison | null => {
      const earlier = previousExercises.get(normalize(exercise.exerciseName));
      if (!earlier) return null;
      const currentVolumeKg = exerciseVolume(exercise);
      const previousVolumeKg = exerciseVolume(earlier);
      const currentBestWeightKg = exerciseBestWeight(exercise);
      const previousBestWeightKg = exerciseBestWeight(earlier);
      return {
        exerciseName: exercise.exerciseName,
        currentVolumeKg,
        previousVolumeKg,
        deltaVolumeKg: Number((currentVolumeKg - previousVolumeKg).toFixed(2)),
        currentBestWeightKg,
        previousBestWeightKg,
        deltaBestWeightKg: Number((currentBestWeightKg - previousBestWeightKg).toFixed(2)),
      };
    })
    .filter((comparison): comparison is ExerciseComparison => comparison !== null);

  return {
    previous,
    duration: compareMetric(current.durationSeconds, previous.durationSeconds),
    volume: compareMetric(gymVolume(current), gymVolume(previous)),
    sets: compareMetric(totalSets(current), totalSets(previous)),
    exercises: compareMetric(current.gym.exercises.length, previous.gym.exercises.length),
    exerciseComparisons,
  };
}
