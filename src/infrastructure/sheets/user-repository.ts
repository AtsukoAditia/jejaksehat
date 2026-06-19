import { randomUUID } from "node:crypto";
import type { User } from "@/src/domain/entities/user";
import type {
  UpsertGoogleUserInput,
  UserRepository,
} from "@/src/domain/repositories/user-repository";
import { getSheetsClient, getSpreadsheetId } from "./client";
import { SHEET_TABS } from "./schema";

const USER_RANGE = `${SHEET_TABS.users}!A2:I`;
const DEFAULT_TIMEZONE = "Asia/Jakarta";

function normalizeRow(row: string[]): string[] {
  return Array.from({ length: 9 }, (_, index) => row[index] ?? "");
}

function rowToUser(row: string[]): User {
  const values = normalizeRow(row);

  return {
    id: values[0],
    googleSubject: values[1],
    email: values[2],
    name: values[3],
    avatarUrl: values[4] || null,
    timezone: values[5] || DEFAULT_TIMEZONE,
    createdAt: values[6],
    updatedAt: values[7],
    deletedAt: values[8] || null,
  };
}

export class SheetsUserRepository implements UserRepository {
  private async readRows(): Promise<string[][]> {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: USER_RANGE,
    });

    return (response.data.values ?? []) as string[][];
  }

  async findByGoogleSubject(googleSubject: string): Promise<User | null> {
    const rows = await this.readRows();
    const matches = rows.filter((row) => row[1] === googleSubject);

    if (matches.length > 1) {
      throw new Error(
        `Data integrity error: duplicate Google subject ${googleSubject}`,
      );
    }

    return matches[0] ? rowToUser(matches[0]) : null;
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput): Promise<User> {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();
    const rows = await this.readRows();
    const matchingIndexes = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row[1] === input.googleSubject);

    if (matchingIndexes.length > 1) {
      throw new Error(
        `Data integrity error: duplicate Google subject ${input.googleSubject}`,
      );
    }

    const now = new Date().toISOString();
    const existing = matchingIndexes[0];

    if (existing) {
      const current = rowToUser(existing.row);
      const updated: User = {
        ...current,
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl ?? null,
        timezone: input.timezone ?? current.timezone ?? DEFAULT_TIMEZONE,
        updatedAt: now,
        deletedAt: null,
      };

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_TABS.users}!A${existing.index + 2}:I${existing.index + 2}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              updated.id,
              updated.googleSubject,
              updated.email,
              updated.name,
              updated.avatarUrl ?? "",
              updated.timezone,
              updated.createdAt,
              updated.updatedAt,
              "",
            ],
          ],
        },
      });

      return updated;
    }

    const created: User = {
      id: randomUUID(),
      googleSubject: input.googleSubject,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
      timezone: input.timezone ?? DEFAULT_TIMEZONE,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_TABS.users}!A:I`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            created.id,
            created.googleSubject,
            created.email,
            created.name,
            created.avatarUrl ?? "",
            created.timezone,
            created.createdAt,
            created.updatedAt,
            "",
          ],
        ],
      },
    });

    return created;
  }
}
