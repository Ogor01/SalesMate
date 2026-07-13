import { db } from "@/lib/db";
import { handleIncomingWhatsAppMessage } from "@/services/whatsapp/messageHandler";
import { NextResponse } from "next/server";

/**
 * GET /api/whatsapp/webhook
 * Twilio sometimes sends a GET request to verify the webhook URL.
 * Return a simple confirmation so Twilio doesn't see a 405.
 */
export async function GET() {
  return new Response(
    "<Response><Message>Webhook is active. Use POST for messages.</Message></Response>",
    {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    }
  );
}

/**
 * POST /api/whatsapp/webhook
 * Handle incoming WhatsApp messages from Twilio.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const from = formData.get("From") as string | null;
    const body = formData.get("Body") as string | null;
    const to = formData.get("To") as string | null;
    const mediaUrl0 = formData.get("MediaUrl0") as string | null;
    const numMedia = formData.get("NumMedia") as string | null;

    if (!from || (!body && !mediaUrl0)) {
      console.warn("[WEBHOOK] Missing From, Body, or MediaUrl");
      return new Response(
        "<Response><Message>Missing required fields.</Message></Response>",
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    const messageText = body || "";
    const mediaUrl = mediaUrl0 || undefined;
    const rawTo = (to || "").replace(/^whatsapp:/, "");

    // Look up the vendor by Twilio number
    let targetUserId: string | null = null;

    // 1. Check WhatsAppConfig in DB
    if (rawTo) {
      const config = await db.whatsAppConfig.findFirst({
        where: { twilioPhoneNumber: rawTo, connected: true },
        select: { userId: true },
      });
      targetUserId = config?.userId || null;
    }

    // 2. Fallback: match against env var
    if (!targetUserId && process.env.TWILIO_WHATSAPP_NUMBER) {
      const envNumber = process.env.TWILIO_WHATSAPP_NUMBER.replace(/^whatsapp:/, "");
      if (rawTo === envNumber) {
        const firstUser = await db.user.findFirst({ select: { id: true } });
        targetUserId = firstUser?.id || null;
      }
    }

    // 3. Last resort: grab any user (single-vendor mode)
    if (!targetUserId) {
      const firstUser = await db.user.findFirst({ select: { id: true } });
      targetUserId = firstUser?.id || null;
    }

    if (targetUserId) {
      // Fire-and-forget: process in background, return TwiML immediately
      handleIncomingWhatsAppMessage(
        targetUserId,
        from,
        messageText,
        mediaUrl
      ).catch((err) => {
        console.error("[WEBHOOK] Error processing message:", err);
      });
    } else {
      console.warn("[WEBHOOK] No vendor found in database");
    }

    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("[WEBHOOK] Unhandled error:", error);
    return new Response(
      "<Response><Message>Sorry, something went wrong. Please try again.</Message></Response>",
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}
