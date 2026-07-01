import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export interface AuthenticatedContext {
  userId: string;
}

type ApiHandler = (ctx: AuthenticatedContext, req: Request) => Promise<NextResponse>;

/**
 * Wraps an API route handler with session authentication.
 * Returns 401 immediately if no valid session exists.
 * Passes the verified userId to the handler.
 */
export function withAuth(handler: ApiHandler): (req: Request) => Promise<NextResponse> {
  return async (req: Request) => {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    try {
      return await handler({ userId }, req);
    } catch (error) {
      console.error(`Handler error for userId ${userId}:`, error);
      return NextResponse.json(
        { error: { message: "Internal server error" } },
        { status: 500 }
      );
    }
  };
}
