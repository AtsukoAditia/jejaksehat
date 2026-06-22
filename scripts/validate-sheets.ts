import { getSheetsClient, getSpreadsheetId } from "../src/infrastructure/sheets/client";
import { SHEET_HEADERS, SHEET_SCHEMA_VERSION, SHEET_TABS } from "../src/infrastructure/sheets/schema";

interface ValidationResult {
  tab: string;
  exists: boolean;
  rowCount: number;
  missingHeaders: string[];
  extraHeaders: string[];
}

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

async function main() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTabs = new Set(metadata.data.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean));

  const ranges = Object.values(SHEET_TABS).flatMap((tab) => [`${tab}!1:1`, `${tab}!A2:ZZ`]);
  const response = await sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges });
  const values = response.data.valueRanges ?? [];
  const results: ValidationResult[] = [];

  Object.values(SHEET_TABS).forEach((tab, index) => {
    const headerRow = (values[index * 2]?.values?.[0] ?? []).map(normalize);
    const dataRows = values[index * 2 + 1]?.values ?? [];
    const expectedHeaders = SHEET_HEADERS[tab] ?? [];
    const missingHeaders = expectedHeaders.filter((header) => !headerRow.includes(header));
    const extraHeaders = headerRow.filter((header) => header && !expectedHeaders.includes(header));

    results.push({
      tab,
      exists: existingTabs.has(tab),
      rowCount: dataRows.length,
      missingHeaders,
      extraHeaders,
    });
  });

  console.log(`JejakSehat Sheets validation — schema v${SHEET_SCHEMA_VERSION}`);
  console.table(results.map((result) => ({
    tab: result.tab,
    exists: result.exists,
    rows: result.rowCount,
    missing_headers: result.missingHeaders.join(", ") || "-",
    extra_headers: result.extraHeaders.join(", ") || "-",
  })));

  const invalid = results.some((result) => !result.exists || result.missingHeaders.length > 0);
  if (invalid) {
    console.error("Sheets validation failed. Fix missing tabs or headers before migration.");
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
