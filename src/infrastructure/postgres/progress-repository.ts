import type {
  CreateBodyMeasurementInput,
  CreateGoalInput,
  ProgressRepository,
  UpdateBodyMeasurementInput,
  UpdateGoalInput,
} from "@/src/domain/repositories/progress-repository";
import { getPrismaClient } from "./client";
import { mapBodyMeasurement, mapGoal, toDate } from "./mappers";

export class PostgresProgressRepository implements ProgressRepository {
  private readonly db = getPrismaClient();

  async findMeasurementsByUser(userId: string, limit = 100) {
    const rows = await this.db.bodyMeasurement.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ measuredAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return rows.map(mapBodyMeasurement);
  }

  async findMeasurementById(id: string, userId: string) {
    const row = await this.db.bodyMeasurement.findFirst({
      where: { id, userId, deletedAt: null },
    });
    return row ? mapBodyMeasurement(row) : null;
  }

  async createMeasurement(input: CreateBodyMeasurementInput) {
    const row = await this.db.bodyMeasurement.create({
      data: {
        id: input.id,
        userId: input.userId,
        measuredAt: toDate(input.measuredAt),
        weightKg: input.weightKg,
        bodyFatPercent: input.bodyFatPercent ?? null,
        waistCm: input.waistCm ?? null,
        notes: input.notes ?? null,
      },
    });
    return mapBodyMeasurement(row);
  }

  async updateMeasurement(id: string, userId: string, input: UpdateBodyMeasurementInput) {
    const existing = await this.findMeasurementById(id, userId);
    if (!existing) throw new Error("Measurement not found");
    const row = await this.db.bodyMeasurement.update({
      where: { id },
      data: {
        measuredAt: toDate(input.measuredAt),
        weightKg: input.weightKg,
        bodyFatPercent: input.bodyFatPercent ?? null,
        waistCm: input.waistCm ?? null,
        notes: input.notes ?? null,
      },
    });
    return mapBodyMeasurement(row);
  }

  async removeMeasurement(id: string, userId: string): Promise<void> {
    const result = await this.db.bodyMeasurement.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) throw new Error("Measurement not found");
  }

  async findGoalsByUser(userId: string, activeOnly = false) {
    const rows = await this.db.goal.findMany({
      where: { userId, deletedAt: null, isActive: activeOnly ? true : undefined },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapGoal);
  }

  async findGoalById(id: string, userId: string) {
    const row = await this.db.goal.findFirst({ where: { id, userId, deletedAt: null } });
    return row ? mapGoal(row) : null;
  }

  async createGoal(input: CreateGoalInput) {
    const row = await this.db.$transaction(async (tx) => {
      await tx.goal.updateMany({
        where: {
          userId: input.userId,
          goalType: input.goalType,
          isActive: true,
          deletedAt: null,
        },
        data: { isActive: false },
      });
      return tx.goal.create({
        data: {
          id: input.id,
          userId: input.userId,
          goalType: input.goalType,
          targetValue: input.targetValue,
          unit: input.unit,
          periodType: input.periodType,
          startDate: toDate(input.startDate),
          endDate: input.endDate ? toDate(input.endDate) : null,
          isActive: input.isActive ?? true,
        },
      });
    });
    return mapGoal(row);
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput) {
    const existing = await this.findGoalById(id, userId);
    if (!existing) throw new Error("Goal not found");
    if (existing.goalType !== input.goalType) throw new Error("Goal type cannot be changed");
    const row = await this.db.goal.update({
      where: { id },
      data: {
        targetValue: input.targetValue,
        unit: input.unit,
        periodType: input.periodType,
        startDate: toDate(input.startDate),
        endDate: input.endDate ? toDate(input.endDate) : null,
        isActive: input.isActive ?? true,
      },
    });
    return mapGoal(row);
  }

  async removeGoal(id: string, userId: string): Promise<void> {
    const result = await this.db.goal.updateMany({
      where: { id, userId, deletedAt: null },
      data: { isActive: false, deletedAt: new Date() },
    });
    if (result.count === 0) throw new Error("Goal not found");
  }
}
