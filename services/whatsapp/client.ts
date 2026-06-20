import { db } from "@/lib/db";

interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  userId: string,
  toPhone: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    const err = "WhatsApp environment credentials not set up on server.";
    console.error(err);
    return { success: false, error: err };
  }

  const cleanPhone = toPhone.replace(/\D/g, "");
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { body: messageText },
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorDetail = JSON.stringify(errorJson);
      console.error(`WhatsApp Cloud API error response: Status ${response.status} - ${errorDetail}`);

      // Handle WhatsApp Disconnection triggers:
      // Typically subcode 190 (Expired Token) or 401/403 status codes.
      if (response.status === 401 || response.status === 403 || errorJson.error?.code === 190) {
        console.warn(`WhatsApp connection dropped for vendor user ${userId}. Halting send operations and alert triggered.`);
        
        // Mark conversation escalation or log a business alert for settings
        await db.conversation.updateMany({
          where: { userId, customerPhone: toPhone },
          data: { isEscalated: true },
        }).catch((err) => console.error("Could not auto-escalate conversation on connection drop:", err));
      }

      return {
        success: false,
        error: errorJson.error?.message || `Failed to send with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error("WhatsApp Send Message Network Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
