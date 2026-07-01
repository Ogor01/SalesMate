import { withAuth } from "@/lib/api-auth";
import { getProfile, upsertProfile } from "@/services/business/businessProfileService";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  description: z.string().optional(),
  deliveryPolicy: z.string().optional(),
  paymentPolicy: z.string().optional(),
  returnPolicy: z.string().optional(),
});

export const GET = withAuth(async ({ userId }) => {
  const profile = await getProfile(userId);
  return NextResponse.json({ data: profile });
});

export const PUT = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = profileSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const profile = await upsertProfile(userId, result.data);
  return NextResponse.json({ data: profile });
});
