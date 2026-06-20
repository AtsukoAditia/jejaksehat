import type { BodyMeasurement, Goal, GoalPeriodType, GoalType } from "@/src/domain/entities/progress";
import type {
  CreateBodyMeasurementInput,
  CreateGoalInput,
  ProgressRepository,
  UpdateBodyMeasurementInput,
  UpdateGoalInput,
} from "@/src/domain/repositories/progress-repository";
import { getSheetsClient, getSpreadsheetId } from "./client";
import { SHEET_TABS } from "./schema";

type Cell = string | number | boolean | null | undefined;
type Row = Cell[];
type ValueRange = { range: string; values: Row[] };

const MEASUREMENT_RANGE = `${SHEET_TABS.bodyMeasurements}!A2:J`;
const GOAL_RANGE = `${SHEET_TABS.goals}!A2:L`;

const text = (value: Cell): string => String(value ?? "");
const nullableText = (value: Cell): string | null => {
  const normalized = text(value).trim();
  return normalized ? normalized : null;
};
const numberValue = (value: Cell): number => Number(value ?? 0);
const nullableNumber = (value: Cell): number | null => {
  const normalized = text(value).trim();
  return normalized === "" ? null : Number(normalized);
};
const booleanValue = (value: Cell): boolean =>
  value === true || text(value).toLowerCase() === "true" || text(value) === "1";

function rowToMeasurement(row: Row): BodyMeasurement {
  return {
    id: text(row[0]),
    userId: text(row[1]),
    measuredAt: text(row[2]),
    weightKg: numberValue(row[3]),
    bodyFatPercent: nullableNumber(row[4]),
    waistCm: nullableNumber(row[5]),
    notes: nullableText(row[6]),
    createdAt: text(row[7]),
    updatedAt: text(row[8]),
    deletedAt: nullableText(row[9]),
  };
}

function rowToGoal(row: Row): Goal {
  return {
    id: text(row[0]),
    userId: text(row[1]),
    goalType: text(row[2]) as GoalType,
    targetValue: numberValue(row[3]),
    unit: text(row[4]),
    periodType: text(row[5]) as GoalPeriodType,
    startDate: text(row[6]),
    endDate: nullableText(row[7]),
    isActive: booleanValue(row[8]),
    createdAt: text(row[9]),
    updatedAt: text(row[10]),
    deletedAt: nullableText(row[11]),
  };
}

export class SheetsProgressRepository implements ProgressRepository {
  private async readMeasurementRows(): Promise<Row[]> {
    const response = await getSheetsClient().spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: MEASUREMENT_RANGE,
    });
    return (response.data.values ?? []) as Row[];
  }

  private async readGoalRows(): Promise<Row[]> {
    const response = await getSheetsClient().spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: GOAL_RANGE,
    });
    return (response.data.values ?? []) as Row[];
  }

  async findMeasurementsByUser(userId: string, limit = 100): Promise<BodyMeasurement[]> {
    const measurements = (await this.readMeasurementRows())
      .map(rowToMeasurement)
      .filter((item) => item.userId === userId && !item.deletedAt)
      .sort((a, b) =>
        b.measuredAt.localeCompare(a.measuredAt) || b.createdAt.localeCompare(a.createdAt),
      );
    return measurements.slice(0, limit);
  }

  async findMeasurementById(id: string, userId: string): Promise<BodyMeasurement | null> {
    const rows = await this.readMeasurementRows();
    const match = rows.map(rowToMeasurement).find(
      (item) => item.id === id && item.userId === userId && !item.deletedAt,
    );
    return match ?? null;
  }

  async createMeasurement(input: CreateBodyMeasurementInput): Promise<BodyMeasurement> {
    const now = new Date().toISOString();
    const created: BodyMeasurement = {
      id: input.id,
      userId: input.userId,
      measuredAt: input.measuredAt,
      weightKg: input.weightKg,
      bodyFatPercent: input.bodyFatPercent ?? null,
      waistCm: input.waistCm ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await getSheetsClient().spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_TABS.bodyMeasurements}!A:J`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          created.id,
          created.userId,
          created.measuredAt,
          created.weightKg,
          created.bodyFatPercent ?? "",
          created.waistCm ?? "",
          created.notes ?? "",
          created.createdAt,
          created.updatedAt,
          "",
        ]],
      },
    });
    return created;
  }

  async updateMeasurement(
    id: string,
    userId: string,
    input: UpdateBodyMeasurementInput,
  ): Promise<BodyMeasurement> {
    const rows = await this.readMeasurementRows();
    const index = rows.findIndex(
      (row) => text(row[0]) === id && text(row[1]) === userId && !nullableText(row[9]),
    );
    if (index < 0) throw new Error("Measurement not found");

    const current = rowToMeasurement(rows[index]);
    const updated: BodyMeasurement = {
      ...current,
      measuredAt: input.measuredAt,
      weightKg: input.weightKg,
      bodyFatPercent: input.bodyFatPercent ?? null,
      waistCm: input.waistCm ?? null,
      notes: input.notes ?? null,
      updatedAt: new Date().toISOString(),
    };

    await getSheetsClient().spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_TABS.bodyMeasurements}!A${index + 2}:J${index + 2}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          updated.id,
          updated.userId,
          updated.measuredAt,
          updated.weightKg,
          updated.bodyFatPercent ?? "",
          updated.waistCm ?? "",
          updated.notes ?? "",
          updated.createdAt,
          updated.updatedAt,
          "",
        ]],
      },
    });
    return updated;
  }

  async removeMeasurement(id: string, userId: string): Promise<void> {
    const rows = await this.readMeasurementRows();
    const index = rows.findIndex(
      (row) => text(row[0]) === id && text(row[1]) === userId && !nullableText(row[9]),
    );
    if (index < 0) throw new Error("Measurement not found");
    const row: Row = Array.from({ length: 10 }, (_, cell) => rows[index][cell] ?? "");
    const now = new Date().toISOString();
    row[8] = now;
    row[9] = now;
    await getSheetsClient().spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_TABS.bodyMeasurements}!A${index + 2}:J${index + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  }

  async findGoalsByUser(userId: string, activeOnly = false): Promise<Goal[]> {
    return (await this.readGoalRows())
      .map(rowToGoal)
      .filter((item) => item.userId === userId && !item.deletedAt && (!activeOnly || item.isActive))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findGoalById(id: string, userId: string): Promise<Goal | null> {
    const match = (await this.readGoalRows())
      .map(rowToGoal)
      .find((item) => item.id === id && item.userId === userId && !item.deletedAt);
    return match ?? null;
  }

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    const rows = await this.readGoalRows();
    const now = new Date().toISOString();
    const data: ValueRange[] = [];

    rows.forEach((row, index) => {
      const existing = rowToGoal(row);
      if (
        existing.userId === input.userId &&
        existing.goalType === input.goalType &&
        existing.isActive &&
        !existing.deletedAt
      ) {
        const updated: Row = Array.from({ length: 12 }, (_, cell) => row[cell] ?? "");
        updated[8] = false;
        updated[10] = now;
        data.push({ range: `${SHEET_TABS.goals}!A${index + 2}:L${index + 2}`, values: [updated] });
      }
    });

    const created: Goal = {
      id: input.id,
      userId: input.userId,
      goalType: input.goalType,
      targetValue: input.targetValue,
      unit: input.unit,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    data.push({
      range: `${SHEET_TABS.goals}!A${rows.length + 2}:L${rows.length + 2}`,
      values: [[
        created.id,
        created.userId,
        created.goalType,
        created.targetValue,
        created.unit,
        created.periodType,
        created.startDate,
        created.endDate ?? "",
        created.isActive,
        created.createdAt,
        created.updatedAt,
        "",
      ]],
    });

    await getSheetsClient().spreadsheets.values.batchUpdate({
      spreadsheetId: getSpreadsheetId(),
      requestBody: { valueInputOption: "RAW", data },
    });
    return created;
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput): Promise<Goal> {
    const rows = await this.readGoalRows();
    const index = rows.findIndex(
      (row) => text(row[0]) === id && text(row[1]) === userId && !nullableText(row[11]),
    );
    if (index < 0) throw new Error("Goal not found");

    const current = rowToGoal(rows[index]);
    if (current.goalType !== input.goalType) throw new Error("Goal type cannot be changed");
    const updated: Goal = {
      ...current,
      targetValue: input.targetValue,
      unit: input.unit,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      isActive: input.isActive ?? true,
      updatedAt: new Date().toISOString(),
    };

    await getSheetsClient().spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_TABS.goals}!A${index + 2}:L${index + 2}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          updated.id,
          updated.userId,
          updated.goalType,
          updated.targetValue,
          updated.unit,
          updated.periodType,
          updated.startDate,
          updated.endDate ?? "",
          updated.isActive,
          updated.createdAt,
          updated.updatedAt,
          "",
        ]],
      },
    });
    return updated;
  }

  async removeGoal(id: string, userId: string): Promise<void> {
    const rows = await this.readGoalRows();
    const index = rows.findIndex(
      (row) => text(row[0]) === id && text(row[1]) === userId && !nullableText(row[11]),
    );
    if (index < 0) throw new Error("Goal not found");
    const row: Row = Array.from({ length: 12 }, (_, cell) => rows[index][cell] ?? "");
    const now = new Date().toISOString();
    row[8] = false;
    row[10] = now;
    row[11] = now;
    await getSheetsClient().spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_TABS.goals}!A${index + 2}:L${index + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  }
}
