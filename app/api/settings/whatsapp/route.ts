import { withAuth } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const twilioConfigSchema = z.object({
  accountSid: z.string().min(1, "Account SID is required"),
  authToken: z.string().min(1, "Auth Token is required"),
  twilioPhoneNumber: z.string().min(1, "Twilio WhatsApp number is required"),
});

export const GET = withAuth(async ({ userId }) => {
  const config = await db.whatsAppConfig.findUnique({
    where: { userId },
    select: {
      accountSid: true,
      twilioPhoneNumber: true,
      connected: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data: config });
});

export const POST = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = twilioConfigSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const config = await db.whatsAppConfig.upsert({
    where: { userId },
    create: {
      userId,
      accountSid: result.data.accountSid,
      authToken: result.data.authToken,
      twilioPhoneNumber: result.data.twilioPhoneNumber,
      connected: true,
    },
    update: {
      accountSid: result.data.accountSid,
      authToken: result.data.authToken,
      twilioPhoneNumber: result.data.twilioPhoneNumber,
      connected: true,
    },
    select: {
      accountSid: true,
      twilioPhoneNumber: true,
      connected: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data: config }, { status: 200 });
});
