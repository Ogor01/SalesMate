import { sendEscalationNotification, sendNewLeadNotification, sendWhatsAppDisconnectedNotification } from "./email";

type EventType = "lead_created" | "escalation_triggered" | "whatsapp_disconnected";

interface SystemEvent {
  userId: string;
  type: EventType;
  timestamp: Date;
  payload: any;
}

async function getVendorInfo(userId: string): Promise<{ email: string; businessName: string } | null> {
  try {
    const { db } = await import("@/lib/db");
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, businessName: true },
    });
    return user || null;
  } catch {
    return null;
  }
}

export async function dispatchSystemEvent(
  userId: string,
  type: EventType,
  payload: any
): Promise<void> {
  const event: SystemEvent = {
    userId,
    type,
    timestamp: new Date(),
    payload,
  };

  console.log(`[EVENT DISPATCHER] Tenant: ${userId} | Type: ${type} | Payload:`, payload);

  const vendor = await getVendorInfo(userId);
  if (!vendor) {
    console.warn(`[DISPATCHER] No vendor found for userId ${userId} — skipping email.`);
    return;
  }

  if (type === "lead_created") {
    await sendNewLeadNotification(
      vendor.email,
      vendor.businessName || "your boutique",
      payload.customerName || null,
      payload.phoneNumber,
      payload.productInterest || null
    );
  } else if (type === "escalation_triggered") {
    await sendEscalationNotification(
      vendor.email,
      vendor.businessName || "your boutique",
      payload.phone,
      payload.reason || "AI confidence too low"
    );
  } else if (type === "whatsapp_disconnected") {
    await sendWhatsAppDisconnectedNotification(
      vendor.email,
      vendor.businessName || "your boutique"
    );
  }
}
