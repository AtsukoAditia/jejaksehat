import type { User } from "../entities/user";

export interface UpsertGoogleUserInput {
  googleSubject: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  timezone?: string;
}

export interface UserRepository {
  findByGoogleSubject(googleSubject: string): Promise<User | null>;
  upsertGoogleUser(input: UpsertGoogleUserInput): Promise<User>;
}
