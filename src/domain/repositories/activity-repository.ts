import type { ActivityDetail, ActivityType } from "../entities/activity";

export interface ActivityFilters {
  type?: ActivityType;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface GymSetInput {
  reps: number;
  weightKg: number;
  rpe?: number | null;
  completed?: boolean;
}

export interface GymExerciseInput {
  exerciseName: string;
  muscleGroup: string;
  sets: GymSetInput[];
}

interface ActivityBaseInput {
  userId: string;
  activityDate: string;
  durationSeconds: number;
  notes?: string | null;
}

export interface CreateGymActivityInput extends ActivityBaseInput {
  id: string;
  activityType: "GYM";
  title: string;
  location?: string | null;
  exercises: GymExerciseInput[];
}

export interface CreateRunActivityInput extends ActivityBaseInput {
  id: string;
  activityType: "RUN";
  distanceMeters: number;
  runType: string;
  location?: string | null;
  rpe?: number | null;
  elevationGainMeters?: number | null;
}

export type CreateActivityInput = CreateGymActivityInput | CreateRunActivityInput;
export type UpdateActivityInput =
  | Omit<CreateGymActivityInput, "id" | "userId">
  | Omit<CreateRunActivityInput, "id" | "userId">;

export interface ActivityRepository {
  findById(id: string, userId: string): Promise<ActivityDetail | null>;
  findByUser(userId: string, filters?: ActivityFilters): Promise<ActivityDetail[]>;
  create(input: CreateActivityInput): Promise<ActivityDetail>;
  update(id: string, userId: string, input: UpdateActivityInput): Promise<ActivityDetail>;
  remove(id: string, userId: string): Promise<void>;
}
