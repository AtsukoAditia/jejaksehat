import { auth } from "@/auth";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";
import { activityPayloadSchema } from "@/src/validation/activity";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const activity = await getActivityRepository().findById(id, session.user.id);
  if (!activity) return Response.json({ message: "Aktivitas tidak ditemukan." }, { status: 404 });
  return Response.json({ data: activity });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = activityPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Periksa kembali data aktivitas.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { id } = await context.params;
  const existing = await getActivityRepository().findById(id, session.user.id);
  if (!existing) return Response.json({ message: "Aktivitas tidak ditemukan." }, { status: 404 });
  const activity = await getActivityRepository().update(id, session.user.id, parsed.data);
  return Response.json({ data: activity });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const existing = await getActivityRepository().findById(id, session.user.id);
  if (!existing) return Response.json({ message: "Aktivitas tidak ditemukan." }, { status: 404 });
  await getActivityRepository().remove(id, session.user.id);
  return new Response(null, { status: 204 });
}
