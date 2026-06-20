import { auth } from "@/auth";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";
import { goalPayloadSchema } from "@/src/validation/progress";

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const data = await getProgressRepository().findGoalById(id, session.user.id);
  if (!data) return Response.json({ message: "Target tidak ditemukan." }, { status: 404 });
  return Response.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = goalPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Periksa kembali target kesehatan.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { id } = await context.params;
  const existing = await getProgressRepository().findGoalById(id, session.user.id);
  if (!existing) return Response.json({ message: "Target tidak ditemukan." }, { status: 404 });
  const data = await getProgressRepository().updateGoal(id, session.user.id, parsed.data);
  return Response.json({ data });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const existing = await getProgressRepository().findGoalById(id, session.user.id);
  if (!existing) return Response.json({ message: "Target tidak ditemukan." }, { status: 404 });
  await getProgressRepository().removeGoal(id, session.user.id);
  return new Response(null, { status: 204 });
}
