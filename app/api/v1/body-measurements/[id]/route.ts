import { auth } from "@/auth";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";
import { bodyMeasurementPayloadSchema } from "@/src/validation/progress";

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const data = await getProgressRepository().findMeasurementById(id, session.user.id);
  if (!data) return Response.json({ message: "Pengukuran tidak ditemukan." }, { status: 404 });
  return Response.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = bodyMeasurementPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Periksa kembali data pengukuran.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const { id } = await context.params;
  const existing = await getProgressRepository().findMeasurementById(id, session.user.id);
  if (!existing) return Response.json({ message: "Pengukuran tidak ditemukan." }, { status: 404 });
  const data = await getProgressRepository().updateMeasurement(id, session.user.id, parsed.data);
  return Response.json({ data });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const existing = await getProgressRepository().findMeasurementById(id, session.user.id);
  if (!existing) return Response.json({ message: "Pengukuran tidak ditemukan." }, { status: 404 });
  await getProgressRepository().removeMeasurement(id, session.user.id);
  return new Response(null, { status: 204 });
}
