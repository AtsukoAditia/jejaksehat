import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import type { ActivityType } from "@/src/domain/entities/activity";
import { getActivityRepository } from "@/src/infrastructure/repositories/activity-repository";
import { activityPayloadSchema } from "@/src/validation/activity";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const requestedType = request.nextUrl.searchParams.get("type");
  const type: ActivityType | undefined =
    requestedType === "GYM" || requestedType === "RUN" ? requestedType : undefined;
  const activities = await getActivityRepository().findByUser(session.user.id, {
    type,
    limit: 100,
  });
  return Response.json({ data: activities });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = activityPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Periksa kembali data aktivitas.", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const activity = await getActivityRepository().create({
    ...parsed.data,
    id: randomUUID(),
    userId: session.user.id,
  });
  return Response.json({ data: activity }, { status: 201 });
}
