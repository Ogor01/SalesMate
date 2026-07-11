import { withAuth } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const GET = withAuth(async ({ userId }) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { fullName: true, businessName: true, email: true },
  });
  return NextResponse.json({ data: user });
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

  const updated = await db.user.update({
    where: { id: userId },
    data: result.data,
    select: { fullName: true, businessName: true, email: true },
  });

  return NextResponse.json({ data: updated });
});
