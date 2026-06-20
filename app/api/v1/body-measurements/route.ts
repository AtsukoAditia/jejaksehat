import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { getProgressRepository } from "@/src/infrastructure/repositories/progress-repository";
import { bodyMeasurementPayloadSchema } from "@/src/validation/progress";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const data = await getProgressRepository().findMeasurementsByUser(session.user.id, 100);
  return Response.json({ data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = bodyMeasurementPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Periksa kembali data pengukuran.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = await getProgressRepository().createMeasurement({
    ...parsed.data,
    id: randomUUID(),
    userId: session.user.id,
  });
  return Response.json({ data }, { status: 201 });
}
