import { db } from "@/lib/db";
import { handleIncomingWhatsAppMessage } from "@/services/whatsapp/messageHandler";
import { isValidTwilioRequest } from "@/lib/twilio-validate";
import { checkRateLimit, STRICT_RATE_LIMIT } from "@/lib/rate-limiter";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Rate limit by IP for the webhook (unauthenticated endpoint)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateResult = checkRateLimit(`webhook:${ip}`, STRICT_RATE_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: { message: "Too many requests", code: "RATE_LIMITED" } },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const params = Object.fromEntries(formData.entries());

    const from = params.From as string | undefined;
    const body = params.Body as string | undefined;
    const to = params.To as string | undefined;
    const mediaUrl = params.MediaUrl0 as string | undefined;

    // Validate Twilio signature when present (works in all environments)
    const signature = req.headers.get("x-twilio-signature") || req.headers.get("X-Twilio-Signature");
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    if (signature && twilioAuthToken) {
      const strParams: Record<string, string> = {};
      Array.from(formData.entries()).forEach(([k, v]) => {
        if (typeof v === "string") strParams[k] = v;
      });
      if (!isValidTwilioRequest(req.url, strParams, signature, twilioAuthToken)) {
        console.warn("[WEBHOOK] Invalid Twilio signature — rejecting");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    } else if (process.env.NODE_ENV === "production" && !signature) {
      console.warn("[WEBHOOK] Missing Twilio signature in production — rejecting");
      return NextResponse.json({ error: "Missing signature" }, { status: 403 });
    }

    if (!from || (!body && !mediaUrl)) {
      return NextResponse.json({ error: "Missing From, Body, or MediaUrl" }, { status: 400 });
    }

    const messageText = body || "";

    // Extract dynamic request origin (ngrok friendly)
    const reqUrl = new URL(req.url);
    const proto = req.headers.get("x-forwarded-proto") || reqUrl.protocol.replace(":", "");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || reqUrl.host;
    const origin = `${proto}://${host}`;

    // Strip "whatsapp:" prefix for DB/env matching
    const rawTo = to?.replace(/^whatsapp:/, "");

    let targetUserId: string | null = null;

    if (rawTo) {
      const config = await db.whatsAppConfig.findFirst({
        where: { twilioPhoneNumber: rawTo, connected: true },
        select: { userId: true },
      });
      targetUserId = config?.userId || null;
    }

    // Fallback: try env var Twilio number (single-tenant backward compat)
    if (!targetUserId && rawTo === process.env.TWILIO_WHATSAPP_NUMBER) {
      const userWithProducts = await db.product.findFirst({
        select: { userId: true },
      });
      if (userWithProducts) {
        targetUserId = userWithProducts.userId;
      } else {
        const firstUser = await db.user.findFirst({ select: { id: true } });
        targetUserId = firstUser?.id || null;
      }
    }

    if (targetUserId) {
      handleIncomingWhatsAppMessage(targetUserId, from, messageText, mediaUrl, origin).catch((err) => {
        console.error(`Error processing webhook message from ${from}:`, err);
      });
    } else {
      console.warn(`Webhook received message but no vendor matches Twilio number: ${to}`);
    }

    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Twilio Webhook POST handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
