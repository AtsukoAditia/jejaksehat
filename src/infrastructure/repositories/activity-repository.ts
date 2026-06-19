import type { ActivityRepository } from "@/src/domain/repositories/activity-repository";
import { getDataProvider } from "../data-provider";
import { SheetsActivityRepository } from "../sheets/activity-repository";

let cachedRepository: ActivityRepository | null = null;

export function getActivityRepository(): ActivityRepository {
  if (cachedRepository) return cachedRepository;
  if (getDataProvider() === "sheets") {
    cachedRepository = new SheetsActivityRepository();
    return cachedRepository;
  }
  throw new Error("PostgreSQL activity repository is not implemented yet. Set DATA_PROVIDER=sheets.");
}
