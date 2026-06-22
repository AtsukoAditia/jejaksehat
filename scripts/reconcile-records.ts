import { closePrismaClient, getPrismaClient } from "../src/infrastructure/postgres/client";
import { getSheetsClient, getSpreadsheetId } from "../src/infrastructure/sheets/client";
import { SHEET_TABS } from "../src/infrastructure/sheets/schema";

interface ReconciliationRow {
  entity: string;
  sheets: number;
  postgres: number;
  delta: number;
}

async function sheetRowCounts() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const ranges = [
    SHEET_TABS.users,
    SHEET_TABS.activities,
    SHEET_TABS.gymSessions,
    SHEET_TABS.gymExercises,
    SHEET_TABS.gymSets,
    SHEET_TABS.runs,
    SHEET_TABS.bodyMeasurements,
    SHEET_TABS.goals,
  ].map((tab) => `${tab}!A2:ZZ`);
  const response = await sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges });
  return (response.data.valueRanges ?? []).map((range) => range.values?.length ?? 0);
}

async function postgresCounts() {
  const db = getPrismaClient();
  await db.$connect();
  return Promise.all([
    db.user.count(),
    db.activity.count(),
    db.gymSession.count(),
    db.gymExercise.count(),
    db.gymSet.count(),
    db.run.count(),
    db.bodyMeasurement.count(),
    db.goal.count(),
  ]);
}

async function main() {
  const entities = [
    "users",
    "activities",
    "gym_sessions",
    "gym_exercises",
    "gym_sets",
    "runs",
    "body_measurements",
    "goals",
  ];
  const [sheets, postgres] = await Promise.all([sheetRowCounts(), postgresCounts()]);
  const rows: ReconciliationRow[] = entities.map((entity, index) => ({
    entity,
    sheets: sheets[index] ?? 0,
    postgres: postgres[index] ?? 0,
    delta: (postgres[index] ?? 0) - (sheets[index] ?? 0),
  }));

  console.log("JejakSehat Sheets vs PostgreSQL reconciliation");
  console.table(rows);

  if (rows.some((row) => row.delta !== 0)) {
    console.warn("Reconciliation found row count differences. Review data before switching DATA_PROVIDER.");
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePrismaClient();
  });
