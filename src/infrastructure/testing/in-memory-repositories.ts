import type { ActivityDetail } from "@/src/domain/entities/activity";
import type { BodyMeasurement, Goal } from "@/src/domain/entities/progress";
import type { User } from "@/src/domain/entities/user";
import type {
  ActivityFilters,
  ActivityRepository,
  CreateActivityInput,
  UpdateActivityInput,
} from "@/src/domain/repositories/activity-repository";
import type {
  CreateBodyMeasurementInput,
  CreateGoalInput,
  ProgressRepository,
  UpdateBodyMeasurementInput,
  UpdateGoalInput,
} from "@/src/domain/repositories/progress-repository";
import type { UpsertGoogleUserInput, UserRepository } from "@/src/domain/repositories/user-repository";

const now = () => new Date().toISOString();

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findByGoogleSubject(googleSubject: string) {
    return [...this.users.values()].find((user) => user.googleSubject === googleSubject && !user.deletedAt) ?? null;
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput) {
    const existing = await this.findByGoogleSubject(input.googleSubject);
    if (existing) {
      const updated: User = {
        ...existing,
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl ?? null,
        timezone: input.timezone ?? existing.timezone,
        updatedAt: now(),
        deletedAt: null,
      };
      this.users.set(updated.id, updated);
      return updated;
    }

    const createdAt = now();
    const created: User = {
      id: `user-${this.users.size + 1}`,
      googleSubject: input.googleSubject,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
      timezone: input.timezone ?? "Asia/Jakarta",
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    this.users.set(created.id, created);
    return created;
  }
}

export class InMemoryActivityRepository implements ActivityRepository {
  private readonly activities = new Map<string, ActivityDetail>();

  async findById(id: string, userId: string) {
    const activity = this.activities.get(id);
    return activity && activity.userId === userId && !activity.deletedAt ? activity : null;
  }

  async findByUser(userId: string, filters: ActivityFilters = {}) {
    let rows = [...this.activities.values()].filter((activity) => activity.userId === userId && !activity.deletedAt);
    if (filters.type) rows = rows.filter((activity) => activity.activityType === filters.type);
    if (filters.dateFrom) rows = rows.filter((activity) => activity.activityDate >= filters.dateFrom!);
    if (filters.dateTo) rows = rows.filter((activity) => activity.activityDate <= filters.dateTo!);
    return rows
      .sort((a, b) => b.activityDate.localeCompare(a.activityDate) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, filters.limit ?? 100);
  }

  async create(input: CreateActivityInput) {
    const createdAt = now();
    const base = {
      id: input.id,
      userId: input.userId,
      activityType: input.activityType,
      activityDate: input.activityDate,
      durationSeconds: input.durationSeconds,
      notes: input.notes ?? null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    const activity: ActivityDetail = input.activityType === "RUN"
      ? {
          ...base,
          activityType: "RUN",
          gym: null,
          run: {
            activityId: input.id,
            distanceMeters: input.distanceMeters,
            runType: input.runType,
            location: input.location ?? null,
            rpe: input.rpe ?? null,
            elevationGainMeters: input.elevationGainMeters ?? null,
          },
        }
      : {
          ...base,
          activityType: "GYM",
          run: null,
          gym: {
            activityId: input.id,
            title: input.title,
            location: input.location ?? null,
            exercises: input.exercises.map((exercise, exerciseIndex) => {
              const exerciseId = `${input.id}-exercise-${exerciseIndex + 1}`;
              return {
                id: exerciseId,
                activityId: input.id,
                exerciseName: exercise.exerciseName,
                muscleGroup: exercise.muscleGroup,
                sequenceNumber: exerciseIndex + 1,
                sets: exercise.sets.map((set, setIndex) => ({
                  id: `${exerciseId}-set-${setIndex + 1}`,
                  exerciseId,
                  setNumber: setIndex + 1,
                  reps: set.reps,
                  weightKg: set.weightKg,
                  rpe: set.rpe ?? null,
                  completed: set.completed ?? true,
                })),
              };
            }),
          },
        };
    this.activities.set(input.id, activity);
    return activity;
  }

  async update(id: string, userId: string, input: UpdateActivityInput) {
    const existing = await this.findById(id, userId);
    if (!existing) throw new Error("Activity not found");
    if (existing.activityType !== input.activityType) throw new Error("Activity type cannot be changed");
    this.activities.delete(id);
    const recreated = await this.create({ ...input, id, userId } as CreateActivityInput);
    return { ...recreated, createdAt: existing.createdAt };
  }

  async remove(id: string, userId: string) {
    const existing = await this.findById(id, userId);
    if (!existing) throw new Error("Activity not found");
    this.activities.set(id, { ...existing, updatedAt: now(), deletedAt: now() });
  }
}

export class InMemoryProgressRepository implements ProgressRepository {
  private readonly measurements = new Map<string, BodyMeasurement>();
  private readonly goals = new Map<string, Goal>();

  async findMeasurementsByUser(userId: string, limit = 100) {
    return [...this.measurements.values()]
      .filter((item) => item.userId === userId && !item.deletedAt)
      .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async findMeasurementById(id: string, userId: string) {
    const measurement = this.measurements.get(id);
    return measurement && measurement.userId === userId && !measurement.deletedAt ? measurement : null;
  }

  async createMeasurement(input: CreateBodyMeasurementInput) {
    const createdAt = now();
    const measurement: BodyMeasurement = {
      id: input.id,
      userId: input.userId,
      measuredAt: input.measuredAt,
      weightKg: input.weightKg,
      bodyFatPercent: input.bodyFatPercent ?? null,
      waistCm: input.waistCm ?? null,
      notes: input.notes ?? null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    this.measurements.set(measurement.id, measurement);
    return measurement;
  }

  async updateMeasurement(id: string, userId: string, input: UpdateBodyMeasurementInput) {
    const existing = await this.findMeasurementById(id, userId);
    if (!existing) throw new Error("Measurement not found");
    const updated = { ...existing, ...input, updatedAt: now() };
    this.measurements.set(id, updated);
    return updated;
  }

  async removeMeasurement(id: string, userId: string) {
    const existing = await this.findMeasurementById(id, userId);
    if (!existing) throw new Error("Measurement not found");
    this.measurements.set(id, { ...existing, deletedAt: now(), updatedAt: now() });
  }

  async findGoalsByUser(userId: string, activeOnly = false) {
    return [...this.goals.values()]
      .filter((goal) => goal.userId === userId && !goal.deletedAt && (!activeOnly || goal.isActive))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findGoalById(id: string, userId: string) {
    const goal = this.goals.get(id);
    return goal && goal.userId === userId && !goal.deletedAt ? goal : null;
  }

  async createGoal(input: CreateGoalInput) {
    const updatedAt = now();
    for (const goal of this.goals.values()) {
      if (goal.userId === input.userId && goal.goalType === input.goalType && goal.isActive && !goal.deletedAt) {
        this.goals.set(goal.id, { ...goal, isActive: false, updatedAt });
      }
    }
    const goal: Goal = {
      id: input.id,
      userId: input.userId,
      goalType: input.goalType,
      targetValue: input.targetValue,
      unit: input.unit,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      isActive: input.isActive ?? true,
      createdAt: updatedAt,
      updatedAt,
      deletedAt: null,
    };
    this.goals.set(goal.id, goal);
    return goal;
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput) {
    const existing = await this.findGoalById(id, userId);
    if (!existing) throw new Error("Goal not found");
    if (existing.goalType !== input.goalType) throw new Error("Goal type cannot be changed");
    const updated = { ...existing, ...input, endDate: input.endDate ?? null, isActive: input.isActive ?? true, updatedAt: now() };
    this.goals.set(id, updated);
    return updated;
  }

  async removeGoal(id: string, userId: string) {
    const existing = await this.findGoalById(id, userId);
    if (!existing) throw new Error("Goal not found");
    this.goals.set(id, { ...existing, isActive: false, deletedAt: now(), updatedAt: now() });
  }
}
