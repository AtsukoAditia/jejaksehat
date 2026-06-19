import type { UserRepository } from "@/src/domain/repositories/user-repository";
import { getDataProvider } from "../data-provider";
import { SheetsUserRepository } from "../sheets/user-repository";

let cachedRepository: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (cachedRepository) {
    return cachedRepository;
  }

  const provider = getDataProvider();

  if (provider === "sheets") {
    cachedRepository = new SheetsUserRepository();
    return cachedRepository;
  }

  throw new Error(
    "PostgreSQL user repository is not implemented yet. Set DATA_PROVIDER=sheets.",
  );
}
