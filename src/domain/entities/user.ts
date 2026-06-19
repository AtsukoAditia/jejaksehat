export interface User {
  id: string;
  googleSubject: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
