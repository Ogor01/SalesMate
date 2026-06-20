import { db } from "@/lib/db";
import { handleIncomingWhatsAppMessage } from "@/services/whatsapp/messageHandler";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp Webhook verified successfully.");
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  console.error("WhatsApp Webhook verification failed. Token mismatch.");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify WhatsApp webhook payload shape
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const metadata = value?.metadata;
      const message = value?.messages?.[0];

      if (message && message.type === "text") {
        const customerPhone = message.from; // Sender's phone number
        const messageText = message.text?.body;
        const recipientPhoneId = metadata?.phone_number_id; // Receipient phone number ID

        // Multi-tenant mapping:
        // Find the vendor user matching the WhatsApp phone ID.
        // For MVP & onboarding simplicity, if no custom mapping table exists yet,
        // we can lookup the user matching the env variable or the first registered user.
        let targetUser = await db.user.findFirst();

        if (targetUser && messageText) {
          // Process message asynchronously
          handleIncomingWhatsAppMessage(targetUser.id, customerPhone, messageText).catch((err) => {
            console.error(`Error processing webhook message for phone ${customerPhone}:`, err);
          });
        } else {
          console.warn(`Webhook received message but no registered vendor matches phone_number_id: ${recipientPhoneId}`);
        }
      }

      // Always return 200 OK to Meta immediately
      return new Response("EVENT_RECEIVED", { status: 200 });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error) {
    console.error("WhatsApp Webhook POST handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
