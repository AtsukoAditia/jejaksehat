import type { ActivityDetail, GymExercise, GymSet } from "@/src/domain/entities/activity";
import type { BodyMeasurement, Goal, GoalPeriodType, GoalType } from "@/src/domain/entities/progress";
import type { User } from "@/src/domain/entities/user";

type DateLike = Date | string | null;
type DecimalLike = number | string | { toString(): string } | null;

export function dateKey(value: DateLike): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export function isoDate(value: DateLike): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

export function nullableIsoDate(value: DateLike): string | null {
  if (!value) return null;
  return isoDate(value);
}

export function decimalNumber(value: DecimalLike): number {
  if (value === null) return 0;
  return Number(value.toString());
}

export function nullableDecimalNumber(value: DecimalLike): number | null {
  if (value === null) return null;
  return decimalNumber(value);
}

export function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function mapUser(row: {
  id: string;
  googleSubject: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): User {
  return {
    id: row.id,
    googleSubject: row.googleSubject,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    timezone: row.timezone,
    createdAt: isoDate(row.createdAt),
    updatedAt: isoDate(row.updatedAt),
    deletedAt: nullableIsoDate(row.deletedAt),
  };
}

export function mapBodyMeasurement(row: {
  id: string;
  userId: string;
  measuredAt: Date;
  weightKg: DecimalLike;
  bodyFatPercent: DecimalLike;
  waistCm: DecimalLike;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): BodyMeasurement {
  return {
    id: row.id,
    userId: row.userId,
    measuredAt: dateKey(row.measuredAt),
    weightKg: decimalNumber(row.weightKg),
    bodyFatPercent: nullableDecimalNumber(row.bodyFatPercent),
    waistCm: nullableDecimalNumber(row.waistCm),
    notes: row.notes,
    createdAt: isoDate(row.createdAt),
    updatedAt: isoDate(row.updatedAt),
    deletedAt: nullableIsoDate(row.deletedAt),
  };
}

export function mapGoal(row: {
  id: string;
  userId: string;
  goalType: string;
  targetValue: DecimalLike;
  unit: string;
  periodType: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): Goal {
  return {
    id: row.id,
    userId: row.userId,
    goalType: row.goalType as GoalType,
    targetValue: decimalNumber(row.targetValue),
    unit: row.unit,
    periodType: row.periodType as GoalPeriodType,
    startDate: dateKey(row.startDate),
    endDate: row.endDate ? dateKey(row.endDate) : null,
    isActive: row.isActive,
    createdAt: isoDate(row.createdAt),
    updatedAt: isoDate(row.updatedAt),
    deletedAt: nullableIsoDate(row.deletedAt),
  };
}

export function mapActivityDetail(row: {
  id: string;
  userId: string;
  activityType: "GYM" | "RUN";
  activityDate: Date;
  durationSeconds: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  gymSession?: {
    activityId: string;
    title: string;
    location: string | null;
    exercises: Array<{
      id: string;
      activityId: string;
      exerciseName: string;
      muscleGroup: string;
      sequenceNumber: number;
      sets: Array<{
        id: string;
        exerciseId: string;
        setNumber: number;
        reps: number;
        weightKg: DecimalLike;
        rpe: DecimalLike;
        completed: boolean;
        deletedAt?: Date | null;
      }>;
      deletedAt?: Date | null;
    }>;
  } | null;
  run?: {
    activityId: string;
    distanceMeters: number;
    runType: string;
    location: string | null;
    rpe: DecimalLike;
    elevationGainMeters: number | null;
  } | null;
}): ActivityDetail {
  const base = {
    id: row.id,
    userId: row.userId,
    activityType: row.activityType,
    activityDate: dateKey(row.activityDate),
    durationSeconds: row.durationSeconds,
    notes: row.notes,
    createdAt: isoDate(row.createdAt),
    updatedAt: isoDate(row.updatedAt),
    deletedAt: nullableIsoDate(row.deletedAt),
  };

  if (row.activityType === "RUN") {
    if (!row.run) throw new Error(`Run details missing for activity ${row.id}`);
    return {
      ...base,
      activityType: "RUN",
      gym: null,
      run: {
        activityId: row.run.activityId,
        distanceMeters: row.run.distanceMeters,
        runType: row.run.runType,
        location: row.run.location,
        rpe: nullableDecimalNumber(row.run.rpe),
        elevationGainMeters: row.run.elevationGainMeters,
      },
    };
  }

  if (!row.gymSession) throw new Error(`Gym details missing for activity ${row.id}`);
  return {
    ...base,
    activityType: "GYM",
    run: null,
    gym: {
      activityId: row.gymSession.activityId,
      title: row.gymSession.title,
      location: row.gymSession.location,
      exercises: row.gymSession.exercises
        .filter((exercise) => !exercise.deletedAt)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
        .map((exercise): GymExercise => ({
          id: exercise.id,
          activityId: exercise.activityId,
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup,
          sequenceNumber: exercise.sequenceNumber,
          sets: exercise.sets
            .filter((set) => !set.deletedAt)
            .sort((a, b) => a.setNumber - b.setNumber)
            .map((set): GymSet => ({
              id: set.id,
              exerciseId: set.exerciseId,
              setNumber: set.setNumber,
              reps: set.reps,
              weightKg: decimalNumber(set.weightKg),
              rpe: nullableDecimalNumber(set.rpe),
              completed: set.completed,
            })),
        })),
    },
  };
}
