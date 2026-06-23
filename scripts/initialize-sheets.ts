import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import {
  getSheetsClient,
  getSpreadsheetId,
} from "../src/infrastructure/sheets/client";
import {
  SHEET_HEADERS,
  SHEET_SCHEMA_VERSION,
  SHEET_TABS,
} from "../src/infrastructure/sheets/schema";

async function initializeSheets() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const existingTitles = new Set(
    spreadsheet.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title)) ?? [],
  );

  const missingTitles = Object.values(SHEET_TABS).filter(
    (title) => !existingTitles.has(title),
  );

  if (missingTitles.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missingTitles.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
  }

  const now = new Date().toISOString();
  const data = Object.entries(SHEET_HEADERS).map(([title, headers]) => ({
    range: `${title}!A1`,
    majorDimension: "ROWS" as const,
    values: [[...headers]],
  }));

  data.push({
    range: `${SHEET_TABS.schemaMeta}!A2`,
    majorDimension: "ROWS",
    values: [["schema_version", SHEET_SCHEMA_VERSION, now]],
  });

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data,
    },
  });

  console.log(
    `Google Sheets initialized with schema version ${SHEET_SCHEMA_VERSION}.`,
  );
}

initializeSheets().catch((error: unknown) => {
  console.error("Failed to initialize Google Sheets:", error);
  process.exitCode = 1;
});
