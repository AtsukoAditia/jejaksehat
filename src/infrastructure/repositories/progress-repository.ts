import type { ProgressRepository } from "@/src/domain/repositories/progress-repository";
import { getDataProvider } from "../data-provider";
import { SheetsProgressRepository } from "../sheets/progress-repository";

let cachedRepository: ProgressRepository | null = null;

export function getProgressRepository(): ProgressRepository {
  if (cachedRepository) return cachedRepository;
  if (getDataProvider() === "sheets") {
    cachedRepository = new SheetsProgressRepository();
    return cachedRepository;
  }
  throw new Error("PostgreSQL progress repository is not implemented yet. Set DATA_PROVIDER=sheets.");
}
