import type { Activity, ActivityType } from "../entities/activity";

export interface ActivityFilters {
  type?: ActivityType;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  cursor?: string;
}

export interface CreateActivityInput {
  id: string;
  userId: string;
  activityType: ActivityType;
  activityDate: string;
  durationSeconds: number;
  notes?: string | null;
}

export interface UpdateActivityInput {
  activityDate?: string;
  durationSeconds?: number;
  notes?: string | null;
}

export interface ActivityRepository {
  findById(id: string, userId: string): Promise<Activity | null>;
  findByUser(userId: string, filters?: ActivityFilters): Promise<Activity[]>;
  create(input: CreateActivityInput): Promise<Activity>;
  update(id: string, userId: string, input: UpdateActivityInput): Promise<Activity>;
  remove(id: string, userId: string): Promise<void>;
}
