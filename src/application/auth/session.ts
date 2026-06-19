export interface SessionLike {
  user?: {
    id?: string | null;
  } | null;
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function requireUserId(session: SessionLike | null | undefined): string {
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
