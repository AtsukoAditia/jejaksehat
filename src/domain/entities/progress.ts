export type GoalType = "WEEKLY_WORKOUTS" | "WEEKLY_RUNNING_DISTANCE" | "TARGET_WEIGHT";
export type GoalPeriodType = "WEEKLY" | "ONGOING";

export interface BodyMeasurement {
  id: string;
  userId: string;
  measuredAt: string;
  weightKg: number;
  bodyFatPercent: number | null;
  waistCm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  goalType: GoalType;
  targetValue: number;
  unit: string;
  periodType: GoalPeriodType;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GoalProgress {
  goal: Goal;
  currentValue: number | null;
  progressPercent: number;
  remainingValue: number | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED";
}
