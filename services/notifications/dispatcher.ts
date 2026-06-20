type EventType = "lead_created" | "escalation_triggered" | "whatsapp_disconnected";

interface SystemEvent {
  userId: string;
  type: EventType;
  timestamp: Date;
  payload: any;
}

export function dispatchSystemEvent(
  userId: string,
  type: EventType,
  payload: any
): void {
  const event: SystemEvent = {
    userId,
    type,
    timestamp: new Date(),
    payload,
  };

  console.log(`[EVENT DISPATCHER] Tenant: ${userId} | Type: ${type} | Payload:`, payload);

  // Future extensions for Email notification dispatcher and WhatsApp push
  if (type === "escalation_triggered") {
    // Notify the vendor immediately that a customer chat requires attention
    console.log(`[ALERT] Vendor dashboard notification sent for escalation request. Phone: ${payload.phone}`);
  } else if (type === "whatsapp_disconnected") {
    // Flag critical settings alerts
    console.warn(`[ALERT] Vendor WhatsApp node connection dropped. Immediate action required!`);
  }
}
