import { randomUUID } from "node:crypto";
import type {
  ActivityFilters,
  ActivityRepository,
  CreateActivityInput,
  GymExerciseInput,
  UpdateActivityInput,
} from "@/src/domain/repositories/activity-repository";
import { getPrismaClient } from "./client";
import { mapActivityDetail, toDate } from "./mappers";

const detailInclude = {
  gymSession: {
    include: {
      exercises: { include: { sets: true } },
    },
  },
  run: true,
};

function gymChildData(activityId: string, exercises: GymExerciseInput[]) {
  return exercises.map((exercise, exerciseIndex) => {
    const exerciseId = randomUUID();
    return {
      id: exerciseId,
      activityId,
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      sequenceNumber: exerciseIndex + 1,
      sets: {
        create: exercise.sets.map((set, setIndex) => ({
          id: randomUUID(),
          setNumber: setIndex + 1,
          reps: set.reps,
          weightKg: set.weightKg,
          rpe: set.rpe ?? null,
          completed: set.completed ?? true,
        })),
      },
    };
  });
}

export class PostgresActivityRepository implements ActivityRepository {
  private readonly db = getPrismaClient();

  async findById(id: string, userId: string) {
    const activity = await this.db.activity.findFirst({
      where: { id, userId, deletedAt: null },
      include: detailInclude,
    });
    return activity ? mapActivityDetail(activity) : null;
  }

  async findByUser(userId: string, filters: ActivityFilters = {}) {
    const activities = await this.db.activity.findMany({
      where: {
        userId,
        deletedAt: null,
        activityType: filters.type,
        activityDate: {
          gte: filters.dateFrom ? toDate(filters.dateFrom) : undefined,
          lte: filters.dateTo ? toDate(filters.dateTo) : undefined,
        },
      },
      include: detailInclude,
      orderBy: [{ activityDate: "desc" }, { createdAt: "desc" }],
      take: filters.limit ?? 100,
    });
    return activities.map(mapActivityDetail);
  }

  async create(input: CreateActivityInput) {
    await this.db.$transaction(async (tx) => {
      await tx.activity.create({
        data: {
          id: input.id,
          userId: input.userId,
          activityType: input.activityType,
          activityDate: toDate(input.activityDate),
          durationSeconds: input.durationSeconds,
          notes: input.notes ?? null,
        },
      });

      if (input.activityType === "RUN") {
        await tx.run.create({
          data: {
            activityId: input.id,
            distanceMeters: input.distanceMeters,
            runType: input.runType,
            location: input.location ?? null,
            rpe: input.rpe ?? null,
            elevationGainMeters: input.elevationGainMeters ?? null,
          },
        });
        return;
      }

      await tx.gymSession.create({
        data: {
          activityId: input.id,
          title: input.title,
          location: input.location ?? null,
          exercises: { create: gymChildData(input.id, input.exercises) },
        },
      });
    });

    const created = await this.findById(input.id, input.userId);
    if (!created) throw new Error("Activity was written but could not be read back");
    return created;
  }

  async update(id: string, userId: string, input: UpdateActivityInput) {
    const existing = await this.db.activity.findFirst({
      where: { id, userId, deletedAt: null },
      include: detailInclude,
    });
    if (!existing) throw new Error("Activity not found");
    if (existing.activityType !== input.activityType) throw new Error("Activity type cannot be changed");

    await this.db.$transaction(async (tx) => {
      await tx.activity.update({
        where: { id },
        data: {
          activityDate: toDate(input.activityDate),
          durationSeconds: input.durationSeconds,
          notes: input.notes ?? null,
        },
      });

      if (input.activityType === "RUN") {
        await tx.run.update({
          where: { activityId: id },
          data: {
            distanceMeters: input.distanceMeters,
            runType: input.runType,
            location: input.location ?? null,
            rpe: input.rpe ?? null,
            elevationGainMeters: input.elevationGainMeters ?? null,
          },
        });
        return;
      }

      await tx.gymSession.update({
        where: { activityId: id },
        data: { title: input.title, location: input.location ?? null },
      });

      const now = new Date();
      const activeExerciseIds = existing.gymSession?.exercises
        .filter((exercise) => !exercise.deletedAt)
        .map((exercise) => exercise.id) ?? [];

      if (activeExerciseIds.length > 0) {
        await tx.gymSet.updateMany({
          where: { exerciseId: { in: activeExerciseIds }, deletedAt: null },
          data: { deletedAt: now },
        });
        await tx.gymExercise.updateMany({
          where: { id: { in: activeExerciseIds }, deletedAt: null },
          data: { deletedAt: now },
        });
      }

      const recreatedExercises = gymChildData(id, input.exercises);
      await tx.gymExercise.createMany({
        data: recreatedExercises.map((exercise) => ({
          id: exercise.id,
          activityId: id,
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup,
          sequenceNumber: exercise.sequenceNumber,
        })),
      });

      for (const exercise of recreatedExercises) {
        await tx.gymSet.createMany({
          data: exercise.sets.create.map((set) => ({
            id: set.id,
            exerciseId: exercise.id,
            setNumber: set.setNumber,
            reps: set.reps,
            weightKg: set.weightKg,
            rpe: set.rpe,
            completed: set.completed,
          })),
        });
      }
    });

    const updated = await this.findById(id, userId);
    if (!updated) throw new Error("Activity update could not be read back");
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.db.activity.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) throw new Error("Activity not found");
  }
}
