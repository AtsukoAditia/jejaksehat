import type { ActivityRepository } from "@/src/domain/repositories/activity-repository";
import { getDataProvider } from "../data-provider";
import { PostgresActivityRepository } from "../postgres/activity-repository";
import { SheetsActivityRepository } from "../sheets/activity-repository";

let cachedRepository: ActivityRepository | null = null;

export function getActivityRepository(): ActivityRepository {
  if (cachedRepository) return cachedRepository;

  cachedRepository = getDataProvider() === "postgres"
    ? new PostgresActivityRepository()
    : new SheetsActivityRepository();

  return cachedRepository;
}
