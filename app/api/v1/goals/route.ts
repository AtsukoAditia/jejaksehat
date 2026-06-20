import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";
import { goalPayloadSchema } from "@/src/validation/progress";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const activeOnly = request.nextUrl.searchParams.get("active") === "true";
  const data = await getProgressRepository().findGoalsByUser(session.user.id, activeOnly);
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = goalPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Periksa kembali target kesehatan.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = await getProgressRepository().createGoal({
    ...parsed.data,
    id: randomUUID(),
    userId: session.user.id,
  });
  return Response.json({ data }, { status: 201 });
}
