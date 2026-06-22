import type { ProgressRepository } from "@/src/domain/repositories/progress-repository";
import { getDataProvider } from "../data-provider";
import { PostgresProgressRepository } from "../postgres/progress-repository";
import { SheetsProgressRepository } from "../sheets/progress-repository";

let cachedRepository: ProgressRepository | null = null;

export function getProgressRepository(): ProgressRepository {
  if (cachedRepository) return cachedRepository;
  const provider = getDataProvider();
  if (provider === "postgres") {
    cachedRepository = new PostgresProgressRepository();
    return cachedRepository;
  }
  cachedRepository = new SheetsProgressRepository();
  return cachedRepository;
}
