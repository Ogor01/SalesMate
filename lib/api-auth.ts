import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  checkRateLimit,
  DEFAULT_RATE_LIMIT,
  STRICT_RATE_LIMIT,
} from "./rate-limiter";

export interface AuthenticatedContext {
  userId: string;
}

type ApiHandler = (ctx: AuthenticatedContext, req: Request) => Promise<NextResponse>;

/**
 * Returns the appropriate rate limit config based on the request path.
 */
function getRateLimitConfig(path: string) {
  if (path.includes("/api/auth/") || path.includes("/api/whatsapp/webhook")) {
    return STRICT_RATE_LIMIT;
  }
  return DEFAULT_RATE_LIMIT;
}

/**
 * Wraps an API route handler with session authentication + rate limiting.
 * Returns 401 if unauthenticated, 429 if rate limited, 500 on handler error.
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

    // Rate limit by userId
    const url = new URL(req.url);
    const config = getRateLimitConfig(url.pathname);
    const rateResult = checkRateLimit(`api:${userId}`, config);

    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          error: {
            message: "Too many requests. Please slow down.",
            code: "RATE_LIMITED",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateResult.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    try {
      const response = await handler({ userId }, req);
      response.headers.set("X-RateLimit-Limit", String(rateResult.limit));
      response.headers.set("X-RateLimit-Remaining", String(rateResult.remaining));
      return response;
    } catch (error) {
      console.error(`Handler error for userId ${userId}:`, error);
      return NextResponse.json(
        { error: { message: "Internal server error" } },
        { status: 500 }
      );
    }
  };
}
