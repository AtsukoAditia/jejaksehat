import { randomUUID } from "node:crypto";
import type {
  Activity,
  ActivityDetail,
  GymExercise,
  GymSession,
  GymSet,
  RunActivity,
} from "@/src/domain/entities/activity";
import type {
  ActivityFilters,
  ActivityRepository,
  CreateActivityInput,
  GymExerciseInput,
  UpdateActivityInput,
} from "@/src/domain/repositories/activity-repository";
import { getSheetsClient, getSpreadsheetId } from "./client";
import { SHEET_TABS } from "./schema";

type Cell = string | number | boolean | null | undefined;
type Row = Cell[];
type ValueRange = { range: string; values: Row[] };

interface SheetTables {
  activities: Row[];
  gymSessions: Row[];
  gymExercises: Row[];
  gymSets: Row[];
  runs: Row[];
}

const ranges = [
  `${SHEET_TABS.activities}!A2:I`,
  `${SHEET_TABS.gymSessions}!A2:C`,
  `${SHEET_TABS.gymExercises}!A2:H`,
  `${SHEET_TABS.gymSets}!A2:J`,
  `${SHEET_TABS.runs}!A2:F`,
];

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

function rowToActivity(row: Row): Activity {
  return {
    id: text(row[0]),
    userId: text(row[1]),
    activityType: text(row[2]) === "RUN" ? "RUN" : "GYM",
    activityDate: text(row[3]),
    durationSeconds: numberValue(row[4]),
    notes: nullableText(row[5]),
    createdAt: text(row[6]),
    updatedAt: text(row[7]),
    deletedAt: nullableText(row[8]),
  };
}

function rowToGymSet(row: Row): GymSet {
  return {
    id: text(row[0]),
    exerciseId: text(row[1]),
    setNumber: numberValue(row[2]),
    reps: numberValue(row[3]),
    weightKg: numberValue(row[4]),
    rpe: nullableNumber(row[5]),
    completed: booleanValue(row[6]),
  };
}

function buildDetails(tables: SheetTables): ActivityDetail[] {
  const activeSetRows = tables.gymSets.filter((row) => !nullableText(row[9]));
  const activeExerciseRows = tables.gymExercises.filter((row) => !nullableText(row[7]));

  const setsByExercise = new Map<string, GymSet[]>();
  for (const row of activeSetRows) {
    const set = rowToGymSet(row);
    const current = setsByExercise.get(set.exerciseId) ?? [];
    current.push(set);
    setsByExercise.set(set.exerciseId, current);
  }

  const exercisesByActivity = new Map<string, GymExercise[]>();
  for (const row of activeExerciseRows) {
    const exercise: GymExercise = {
      id: text(row[0]),
      activityId: text(row[1]),
      exerciseName: text(row[2]),
      muscleGroup: text(row[3]),
      sequenceNumber: numberValue(row[4]),
      sets: (setsByExercise.get(text(row[0])) ?? []).sort(
        (a, b) => a.setNumber - b.setNumber,
      ),
    };
    const current = exercisesByActivity.get(exercise.activityId) ?? [];
    current.push(exercise);
    exercisesByActivity.set(exercise.activityId, current);
  }

  const gymByActivity = new Map<string, GymSession>();
  for (const row of tables.gymSessions) {
    const activityId = text(row[0]);
    gymByActivity.set(activityId, {
      activityId,
      title: text(row[1]),
      location: nullableText(row[2]),
      exercises: (exercisesByActivity.get(activityId) ?? []).sort(
        (a, b) => a.sequenceNumber - b.sequenceNumber,
      ),
    });
  }

  const runByActivity = new Map<string, RunActivity>();
  for (const row of tables.runs) {
    const activityId = text(row[0]);
    runByActivity.set(activityId, {
      activityId,
      distanceMeters: numberValue(row[1]),
      runType: text(row[2]),
      location: nullableText(row[3]),
      rpe: nullableNumber(row[4]),
      elevationGainMeters: nullableNumber(row[5]),
    });
  }

  return tables.activities
    .map(rowToActivity)
    .filter((activity) => !activity.deletedAt)
    .flatMap((activity): ActivityDetail[] => {
      if (activity.activityType === "GYM") {
        const gym = gymByActivity.get(activity.id);
        return gym ? [{ ...activity, activityType: "GYM", gym, run: null }] : [];
      }
      const run = runByActivity.get(activity.id);
      return run ? [{ ...activity, activityType: "RUN", gym: null, run }] : [];
    });
}

function exerciseRows(
  activityId: string,
  exercises: GymExerciseInput[],
  now: string,
): { exercises: Row[]; sets: Row[] } {
  const rows: Row[] = [];
  const sets: Row[] = [];

  exercises.forEach((exercise, exerciseIndex) => {
    const exerciseId = randomUUID();
    rows.push([
      exerciseId,
      activityId,
      exercise.exerciseName,
      exercise.muscleGroup,
      exerciseIndex + 1,
      now,
      now,
      "",
    ]);

    exercise.sets.forEach((set, setIndex) => {
      sets.push([
        randomUUID(),
        exerciseId,
        setIndex + 1,
        set.reps,
        set.weightKg,
        set.rpe ?? "",
        set.completed ?? true,
        now,
        now,
        "",
      ]);
    });
  });

  return { exercises: rows, sets };
}

export class SheetsActivityRepository implements ActivityRepository {
  private async readTables(): Promise<SheetTables> {
    const response = await getSheetsClient().spreadsheets.values.batchGet({
      spreadsheetId: getSpreadsheetId(),
      ranges,
    });
    const values = response.data.valueRanges ?? [];
    return {
      activities: (values[0]?.values ?? []) as Row[],
      gymSessions: (values[1]?.values ?? []) as Row[],
      gymExercises: (values[2]?.values ?? []) as Row[],
      gymSets: (values[3]?.values ?? []) as Row[],
      runs: (values[4]?.values ?? []) as Row[],
    };
  }

  async findById(id: string, userId: string): Promise<ActivityDetail | null> {
    const details = buildDetails(await this.readTables());
    return details.find((item) => item.id === id && item.userId === userId) ?? null;
  }

  async findByUser(
    userId: string,
    filters: ActivityFilters = {},
  ): Promise<ActivityDetail[]> {
    let details = buildDetails(await this.readTables()).filter(
      (item) => item.userId === userId,
    );
    if (filters.type) details = details.filter((item) => item.activityType === filters.type);
    if (filters.dateFrom) details = details.filter((item) => item.activityDate >= filters.dateFrom!);
    if (filters.dateTo) details = details.filter((item) => item.activityDate <= filters.dateTo!);
    details.sort((a, b) =>
      b.activityDate.localeCompare(a.activityDate) || b.createdAt.localeCompare(a.createdAt),
    );
    return details.slice(0, filters.limit ?? 100);
  }

  async create(input: CreateActivityInput): Promise<ActivityDetail> {
    const tables = await this.readTables();
    const now = new Date().toISOString();
    const data: ValueRange[] = [{
      range: `${SHEET_TABS.activities}!A${tables.activities.length + 2}:I${tables.activities.length + 2}`,
      values: [[input.id, input.userId, input.activityType, input.activityDate, input.durationSeconds, input.notes ?? "", now, now, ""]],
    }];

    if (input.activityType === "RUN") {
      data.push({
        range: `${SHEET_TABS.runs}!A${tables.runs.length + 2}:F${tables.runs.length + 2}`,
        values: [[input.id, input.distanceMeters, input.runType, input.location ?? "", input.rpe ?? "", input.elevationGainMeters ?? ""]],
      });
    } else {
      const childRows = exerciseRows(input.id, input.exercises, now);
      data.push({
        range: `${SHEET_TABS.gymSessions}!A${tables.gymSessions.length + 2}:C${tables.gymSessions.length + 2}`,
        values: [[input.id, input.title, input.location ?? ""]],
      });
      data.push({
        range: `${SHEET_TABS.gymExercises}!A${tables.gymExercises.length + 2}:H${tables.gymExercises.length + 1 + childRows.exercises.length}`,
        values: childRows.exercises,
      });
      data.push({
        range: `${SHEET_TABS.gymSets}!A${tables.gymSets.length + 2}:J${tables.gymSets.length + 1 + childRows.sets.length}`,
        values: childRows.sets,
      });
    }

    await getSheetsClient().spreadsheets.values.batchUpdate({
      spreadsheetId: getSpreadsheetId(),
      requestBody: { valueInputOption: "RAW", data },
    });
    const created = await this.findById(input.id, input.userId);
    if (!created) throw new Error("Activity was written but could not be read back");
    return created;
  }

  async update(
    id: string,
    userId: string,
    input: UpdateActivityInput,
  ): Promise<ActivityDetail> {
    const tables = await this.readTables();
    const activityIndex = tables.activities.findIndex(
      (row) => text(row[0]) === id && text(row[1]) === userId && !nullableText(row[8]),
    );
    if (activityIndex < 0) throw new Error("Activity not found");
    if (text(tables.activities[activityIndex][2]) !== input.activityType) {
      throw new Error("Activity type cannot be changed");
    }

    const now = new Date().toISOString();
    const current = tables.activities[activityIndex];
    const data: ValueRange[] = [{
      range: `${SHEET_TABS.activities}!A${activityIndex + 2}:I${activityIndex + 2}`,
      values: [[id, userId, input.activityType, input.activityDate, input.durationSeconds, input.notes ?? "", text(current[6]), now, ""]],
    }];

    if (input.activityType === "RUN") {
      const runIndex = tables.runs.findIndex((row) => text(row[0]) === id);
      if (runIndex < 0) throw new Error("Run detail not found");
      data.push({
        range: `${SHEET_TABS.runs}!A${runIndex + 2}:F${runIndex + 2}`,
        values: [[id, input.distanceMeters, input.runType, input.location ?? "", input.rpe ?? "", input.elevationGainMeters ?? ""]],
      });
    } else {
      const sessionIndex = tables.gymSessions.findIndex((row) => text(row[0]) === id);
      if (sessionIndex < 0) throw new Error("Gym session not found");
      data.push({
        range: `${SHEET_TABS.gymSessions}!A${sessionIndex + 2}:C${sessionIndex + 2}`,
        values: [[id, input.title, input.location ?? ""]],
      });

      const existingExerciseIds = new Set(
        tables.gymExercises
          .filter((row) => text(row[1]) === id && !nullableText(row[7]))
          .map((row) => text(row[0])),
      );
      tables.gymExercises.forEach((row, index) => {
        if (existingExerciseIds.has(text(row[0]))) {
          const updated: Row = Array.from({ length: 8 }, (_, cell) => row[cell] ?? "");
          updated[6] = now;
          updated[7] = now;
          data.push({ range: `${SHEET_TABS.gymExercises}!A${index + 2}:H${index + 2}`, values: [updated] });
        }
      });
      tables.gymSets.forEach((row, index) => {
        if (existingExerciseIds.has(text(row[1])) && !nullableText(row[9])) {
          const updated: Row = Array.from({ length: 10 }, (_, cell) => row[cell] ?? "");
          updated[8] = now;
          updated[9] = now;
          data.push({ range: `${SHEET_TABS.gymSets}!A${index + 2}:J${index + 2}`, values: [updated] });
        }
      });

      const childRows = exerciseRows(id, input.exercises, now);
      data.push({
        range: `${SHEET_TABS.gymExercises}!A${tables.gymExercises.length + 2}:H${tables.gymExercises.length + 1 + childRows.exercises.length}`,
        values: childRows.exercises,
      });
      data.push({
        range: `${SHEET_TABS.gymSets}!A${tables.gymSets.length + 2}:J${tables.gymSets.length + 1 + childRows.sets.length}`,
        values: childRows.sets,
      });
    }

    await getSheetsClient().spreadsheets.values.batchUpdate({
      spreadsheetId: getSpreadsheetId(),
      requestBody: { valueInputOption: "RAW", data },
    });
    const updated = await this.findById(id, userId);
    if (!updated) throw new Error("Activity update could not be read back");
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const tables = await this.readTables();
    const index = tables.activities.findIndex(
      (row) => text(row[0]) === id && text(row[1]) === userId && !nullableText(row[8]),
    );
    if (index < 0) throw new Error("Activity not found");
    const row: Row = Array.from({ length: 9 }, (_, cell) => tables.activities[index][cell] ?? "");
    const now = new Date().toISOString();
    row[7] = now;
    row[8] = now;
    await getSheetsClient().spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_TABS.activities}!A${index + 2}:I${index + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  }
}
