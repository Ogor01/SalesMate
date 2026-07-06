import { AI_CONFIDENCE_THRESHOLD } from "@/lib/constants";
import { ChatMessage } from "@/types";
import { generateChatCompletion } from "../ai/provider";
import { buildSystemContextPrompt } from "../ai/buildContext";
import { scoreResponseConfidence, needsHandoff } from "../ai/confidence";
import { sendWhatsAppMessage } from "./client";
import { appendMessage, updateConversation, escalateConversation } from "./conversationStore";
import { extractAndSaveLeadIntent } from "../leads/extractIntent";
import { dispatchSystemEvent } from "../notifications/dispatcher";
import { db } from "@/lib/db";

interface AiReplyResult {
  type: "delivered" | "low_confidence" | "send_failed" | "ai_failed";
  text: string;
}

/**
 * Generates an AI reply, scores confidence, sends the appropriate message,
 * and persists the conversation state. Returns the outcome.
 */
export async function generateAndSendReply(
  userId: string,
  customerPhone: string,
  customerMsgText: string,
  currentHistory: ChatMessage[],
  origin?: string
): Promise<AiReplyResult> {
  const systemPrompt = await buildSystemContextPrompt(userId);
  const completion = await generateChatCompletion(systemPrompt, customerMsgText, currentHistory);

  // Handle AI generation failure
  if (completion.error || !completion.text) {
    console.error("AI Generation error:", completion.error);

    const fallbackText = "Hello! Thanks for reaching out. A customer support representative will review your request and get back to you shortly.";

    const sendResult = await sendWhatsAppMessage(userId, customerPhone, fallbackText);

    await updateConversation(userId, customerPhone, {
      conversationHistory: [
        ...currentHistory,
        { role: "ai", content: fallbackText, timestamp: new Date().toISOString() },
      ],
      isEscalated: true,
      aiConfidenceScore: 0.0,
    });

    void dispatchSystemEvent(userId, "escalation_triggered", {
      phone: customerPhone,
      reason: `AI generation error: ${completion.error}`,
    });

    return { type: "ai_failed", text: fallbackText };
  }

  const generatedAnswer = completion.text;
  const confidenceScore = scoreResponseConfidence(generatedAnswer);

  if (needsHandoff(confidenceScore)) {
    // Low confidence: send hold message, save AI answer for vendor review
    const holdMessage = "Thank you. Let me pass this request to a store representative who will look into this for you right away!";

    const sendResult = await sendWhatsAppMessage(userId, customerPhone, holdMessage);

    await updateConversation(userId, customerPhone, {
      conversationHistory: [
        ...currentHistory,
        { role: "ai", content: generatedAnswer, timestamp: new Date().toISOString() },
        { role: "ai", content: holdMessage, timestamp: new Date().toISOString() },
      ],
      aiConfidenceScore: confidenceScore,
      isEscalated: true,
    });

    void dispatchSystemEvent(userId, "escalation_triggered", {
      phone: customerPhone,
      reason: "Low confidence response score",
    });

    return { type: "low_confidence", text: holdMessage };
  }

  // High confidence: scan for product mentions to attach images automatically
  const dbProducts = await db.product.findMany({
    where: { userId, inStock: true },
    select: { id: true, productName: true, imageUrl: true },
  });

  let matchedImageUrl: string | undefined = undefined;
  for (const product of dbProducts) {
    if (product.imageUrl && generatedAnswer.toLowerCase().includes(product.productName.toLowerCase())) {
      if (product.imageUrl.startsWith("data:") && origin) {
        matchedImageUrl = `${origin.replace(/\/+$/, "")}/api/products/image/${product.id}`;
      } else {
        matchedImageUrl = product.imageUrl;
      }
      break;
    }
  }

  const sendResult = await sendWhatsAppMessage(userId, customerPhone, generatedAnswer, matchedImageUrl);

  if (!sendResult.success) {
    // Send failed — escalate, save answer for vendor to review
    console.error(`WhatsApp send failed for ${customerPhone}:`, sendResult.error);

    await updateConversation(userId, customerPhone, {
      conversationHistory: [
        ...currentHistory,
        { role: "ai", content: generatedAnswer, timestamp: new Date().toISOString() },
      ],
      aiConfidenceScore: confidenceScore,
      isEscalated: true,
    });

    void dispatchSystemEvent(userId, "whatsapp_disconnected", {
      phone: customerPhone,
      error: sendResult.error,
    });

    return { type: "send_failed", text: generatedAnswer };
  }

  // Success
  await updateConversation(userId, customerPhone, {
    conversationHistory: [
      ...currentHistory,
      { role: "ai", content: generatedAnswer, timestamp: new Date().toISOString() },
    ],
    aiConfidenceScore: confidenceScore,
  });

  return { type: "delivered", text: generatedAnswer };
}
