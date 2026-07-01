import { db } from "@/lib/db";

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function getBasicAuth(accountSid: string, authToken: string): string {
  return Buffer.from(`${accountSid}:${authToken}`).toString("base64");
}

export async function sendWhatsAppMessage(
  userId: string,
  toPhone: string,
  messageText: string,
  mediaUrl?: string
): Promise<WhatsAppSendResult> {
  const config = await db.whatsAppConfig.findUnique({
    where: { userId },
    select: { accountSid: true, authToken: true, twilioPhoneNumber: true },
  });

  const accountSid = config?.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = config?.authToken || process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = config?.twilioPhoneNumber || process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    const err = "Twilio credentials not configured for this vendor.";
    console.error(err);
    return { success: false, error: err };
  }

  const cleanTo = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:${toPhone.replace(/[^\d+]/g, "")}`;
  const cleanFrom = twilioPhoneNumber.startsWith("whatsapp:") ? twilioPhoneNumber : `whatsapp:${twilioPhoneNumber.replace(/[^\d+]/g, "")}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params: Record<string, string> = {
    To: cleanTo,
    From: cleanFrom,
    Body: messageText,
  };

  if (mediaUrl) {
    const isLocalHost = mediaUrl.includes("localhost") || mediaUrl.includes("127.0.0.1");
    if (isLocalHost) {
      console.warn(`[WARNING] Skipping media attachment in local development (Twilio cannot fetch from localhost): ${mediaUrl}`);
    } else {
      params.MediaUrl = mediaUrl;
    }
  }

  const body = new URLSearchParams(params);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${getBasicAuth(accountSid, authToken)}`,
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Twilio API error: Status ${response.status} - ${data.message}`);
      return {
        success: false,
        error: data.message || `Failed to send with status ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    console.error("Twilio Send Message Network Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
