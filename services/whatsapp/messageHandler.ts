import { appendMessage, getHistory, escalateConversation } from "./conversationStore";
import { generateAndSendReply } from "./responseHandler";
import { extractAndSaveLeadIntent } from "../leads/extractIntent";
import { dispatchSystemEvent } from "../notifications/dispatcher";
import { sendWhatsAppMessage } from "./client";
import { ChatMessage } from "@/types";

export async function handleIncomingWhatsAppMessage(
  userId: string,
  customerPhone: string,
  messageText: string,
  mediaUrl?: string,
  origin?: string
): Promise<void> {
  try {
    // ------------------------------------------------------------------
    // Step 1: Append customer message to conversation (atomic)
    // ------------------------------------------------------------------
    const customerMsg: ChatMessage = {
      role: "customer",
      content: messageText,
      mediaUrl,
      timestamp: new Date().toISOString(),
    };

    const conversation = await appendMessage(userId, customerPhone, customerMsg);

    // ------------------------------------------------------------------
    // Step 2: If already escalated, stop — vendor will reply manually
    // ------------------------------------------------------------------
    if (conversation.isEscalated) {
      return;
    }

    // ------------------------------------------------------------------
    // Step 3: Generate AI reply, send, and persist (handles all outcomes)
    // ------------------------------------------------------------------
    await generateAndSendReply(
      userId,
      customerPhone,
      messageText,
      conversation.conversationHistory,
      origin
    );

    // ------------------------------------------------------------------
    // Step 4: Fire-and-forget lead extraction
    // ------------------------------------------------------------------
    const finalHistory = await getHistory(userId, customerPhone);
    extractAndSaveLeadIntent(userId, customerPhone, finalHistory).catch((err) =>
      console.error("Lead intent parsing task failed:", err)
    );
  } catch (error) {
    // ------------------------------------------------------------------
    // Panic catch: something went catastrophically wrong
    // ------------------------------------------------------------------
    console.error("Critical error in handleIncomingWhatsAppMessage:", error);

    try {
      await sendWhatsAppMessage(
        userId,
        customerPhone,
        "We're experiencing a temporary issue. A representative will respond shortly."
      );
    } catch (fallbackError) {
      console.error("Fallback message also failed:", fallbackError);
    }

    try {
      await escalateConversation(userId, customerPhone, messageText);
    } catch (dbError) {
      console.error("Failed to escalate conversation after critical error:", dbError);
    }

    void dispatchSystemEvent(userId, "escalation_triggered", {
      phone: customerPhone,
      reason: "Critical handler error — see server logs",
    });
  }
}
