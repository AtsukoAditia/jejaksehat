import type { UserRepository } from "@/src/domain/repositories/user-repository";
import { getDataProvider } from "../data-provider";
import { PostgresUserRepository } from "../postgres/user-repository";
import { SheetsUserRepository } from "../sheets/user-repository";

let cachedRepository: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (cachedRepository) return cachedRepository;

  cachedRepository = getDataProvider() === "postgres"
    ? new PostgresUserRepository()
    : new SheetsUserRepository();

  return cachedRepository;
}
