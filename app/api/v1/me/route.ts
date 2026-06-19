import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  requireUserId,
  UnauthorizedError,
} from "@/src/application/auth/session";

export async function GET() {
  const session = await auth();

  try {
    const userId = requireUserId(session);

    return NextResponse.json({
      data: {
        id: userId,
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? null,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    throw error;
  }
}
