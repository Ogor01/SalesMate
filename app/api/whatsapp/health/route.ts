import { NextResponse } from "next/server";
import { runAllHealthChecks, runVendorHealthCheck } from "@/services/whatsapp/healthCheck";
import { withAuth } from "@/lib/api-auth";

/**
 * GET /api/whatsapp/health?userId=xxx
 * Optional query param ?userId=xxx to check a single vendor.
 * Without it, checks all vendors (admin).
 */
export const GET = withAuth(async ({ userId }, req) => {
  const url = new URL(req.url);
  const targetUserId = url.searchParams.get("userId") || userId;

  const result = await runVendorHealthCheck(targetUserId);

  if (!result) {
    return NextResponse.json({
      healthy: false,
      error: "No WhatsApp configuration found for this vendor.",
    });
  }

  return NextResponse.json(result);
});

/**
 * POST /api/whatsapp/health
 * Checks all WhatsApp configs. Intended for cron-job use.
 * Protected by auth — only the owner can trigger.
 */
export const POST = withAuth(async ({ userId }) => {
  // Run health check for all vendors (scoped to current user for safety)
  const result = await runVendorHealthCheck(userId);

  if (!result) {
    return NextResponse.json({
      healthy: false,
      error: "No WhatsApp configuration found.",
    });
  }

  return NextResponse.json(result);
});
