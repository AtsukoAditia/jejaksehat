import type { UserRepository, UpsertGoogleUserInput } from "@/src/domain/repositories/user-repository";
import { getPrismaClient } from "./client";
import { mapUser } from "./mappers";

export class PostgresUserRepository implements UserRepository {
  private readonly db = getPrismaClient();

  async findByGoogleSubject(googleSubject: string) {
    const user = await this.db.user.findFirst({ where: { googleSubject, deletedAt: null } });
    return user ? mapUser(user) : null;
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput) {
    const existing = await this.db.user.findUnique({ where: { googleSubject: input.googleSubject } });
    const data = {
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
      timezone: input.timezone ?? "Asia/Jakarta",
      deletedAt: null,
    };

    if (existing) {
      const updated = await this.db.user.update({
        where: { id: existing.id },
        data: { ...data, timezone: input.timezone ?? existing.timezone ?? "Asia/Jakarta" },
      });
      return mapUser(updated);
    }

    const created = await this.db.user.create({
      data: { googleSubject: input.googleSubject, ...data },
    });
    return mapUser(created);
  }
}
