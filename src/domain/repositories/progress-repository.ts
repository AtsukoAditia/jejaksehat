import type { BodyMeasurement, Goal, GoalType } from "../entities/progress";

export interface CreateBodyMeasurementInput {
  id: string;
  userId: string;
  measuredAt: string;
  weightKg: number;
  bodyFatPercent?: number | null;
  waistCm?: number | null;
  notes?: string | null;
}

export type UpdateBodyMeasurementInput = Omit<CreateBodyMeasurementInput, "id" | "userId">;

export interface CreateGoalInput {
  id: string;
  userId: string;
  goalType: GoalType;
  targetValue: number;
  unit: string;
  periodType: "WEEKLY" | "ONGOING";
  startDate: string;
  endDate?: string | null;
  isActive?: boolean;
}

export type UpdateGoalInput = Omit<CreateGoalInput, "id" | "userId">;

export interface ProgressRepository {
  findMeasurementsByUser(userId: string, limit?: number): Promise<BodyMeasurement[]>;
  findMeasurementById(id: string, userId: string): Promise<BodyMeasurement | null>;
  createMeasurement(input: CreateBodyMeasurementInput): Promise<BodyMeasurement>;
  updateMeasurement(id: string, userId: string, input: UpdateBodyMeasurementInput): Promise<BodyMeasurement>;
  removeMeasurement(id: string, userId: string): Promise<void>;

  findGoalsByUser(userId: string, activeOnly?: boolean): Promise<Goal[]>;
  findGoalById(id: string, userId: string): Promise<Goal | null>;
  createGoal(input: CreateGoalInput): Promise<Goal>;
  updateGoal(id: string, userId: string, input: UpdateGoalInput): Promise<Goal>;
  removeGoal(id: string, userId: string): Promise<void>;
}
