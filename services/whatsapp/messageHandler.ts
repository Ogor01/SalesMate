import { db } from "@/lib/db";
import { generateChatCompletion } from "../ai/provider";
import { buildSystemContextPrompt } from "../ai/buildContext";
import { scoreResponseConfidence } from "../ai/confidence";
import { sendWhatsAppMessage } from "./client";
import { extractAndSaveLeadIntent } from "../leads/extractIntent";
import { dispatchSystemEvent } from "../notifications/dispatcher";
import { ChatMessage } from "@/types";

export async function handleIncomingWhatsAppMessage(
  userId: string,
  customerPhone: string,
  messageText: string
): Promise<void> {
  const nowStr = new Date().toISOString();

  // 1. Fetch or create conversation history (scoped by tenant userId)
  let conversation = await db.conversation.findFirst({
    where: { userId, customerPhone },
  });

  let history: ChatMessage[] = [];
  if (conversation) {
    history = (conversation.conversationHistory as unknown as ChatMessage[]) || [];
  }

  // 2. Append incoming message
  const customerMsg: ChatMessage = {
    role: "customer",
    content: messageText,
    timestamp: nowStr,
  };
  history.push(customerMsg);

  // 3. Human Handoff Check: If escalated, do NOT reply automatically with AI
  if (conversation?.isEscalated) {
    // Save customer message to history so vendor sees it in dashboard inbox
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        conversationHistory: history as any,
      },
    });
    console.log(`Conversation for ${customerPhone} is escalated to human. AI response skipped.`);
    return;
  }

  // 4. Build custom context prompt
  const systemPrompt = await buildSystemContextPrompt(userId);

  // 5. Generate completion from LLM provider
  const completion = await generateChatCompletion(systemPrompt, messageText, history);

  if (completion.error || !completion.text) {
    // If LLM provider fails, fall back to human escalation
    console.error("AI Generation error, falling back to human handoff.");
    const fallbackText = "Hello! Thanks for reaching out. A customer support representative will review your request and get back to you shortly.";
    
    // Send fallback response
    await sendWhatsAppMessage(userId, customerPhone, fallbackText);
    
    const aiMsg: ChatMessage = {
      role: "ai",
      content: fallbackText,
      timestamp: new Date().toISOString(),
    };
    history.push(aiMsg);

    if (conversation) {
      await db.conversation.update({
        where: { id: conversation.id },
        data: {
          conversationHistory: history as any,
          isEscalated: true,
          aiConfidenceScore: 0.0,
        },
      });
    } else {
      await db.conversation.create({
        data: {
          userId,
          customerPhone,
          conversationHistory: history as any,
          isEscalated: true,
          aiConfidenceScore: 0.0,
        },
      });
    }

    dispatchSystemEvent(userId, "escalation_triggered", {
      phone: customerPhone,
      reason: "AI generation error / network failure",
    });
    return;
  }

  const generatedAnswer = completion.text;

  // 6. Score confidence of generated answer
  const confidenceScore = scoreResponseConfidence(generatedAnswer);

  const aiMsg: ChatMessage = {
    role: "ai",
    content: generatedAnswer,
    timestamp: new Date().toISOString(),
  };
  history.push(aiMsg);

  const isLowConfidence = confidenceScore < 0.75;
  const targetEscalationState = isLowConfidence ? true : false;

  // 7. Save conversation state
  if (conversation) {
    conversation = await db.conversation.update({
      where: { id: conversation.id },
      data: {
        conversationHistory: history as any,
        aiConfidenceScore: confidenceScore,
        isEscalated: targetEscalationState,
      },
    });
  } else {
    conversation = await db.conversation.create({
      data: {
        userId,
        customerPhone,
        conversationHistory: history as any,
        aiConfidenceScore: confidenceScore,
        isEscalated: targetEscalationState,
      },
    });
  }

  // 8. Deliver message or Escalate
  if (isLowConfidence) {
    // Confidence below threshold: Alert vendor dashboard, do NOT send the generic AI answer.
    // Instead, send a polite hold message to the buyer and trigger human handover.
    const holdMessage = "Thank you. Let me pass this request to a store representative who will look into this for you right away!";
    await sendWhatsAppMessage(userId, customerPhone, holdMessage);

    // Update conversation record to include hold message
    const holdMsgObj: ChatMessage = {
      role: "ai",
      content: holdMessage,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [...history, holdMsgObj];

    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        conversationHistory: updatedHistory as any,
      },
    });

    dispatchSystemEvent(userId, "escalation_triggered", {
      phone: customerPhone,
      reason: "Low confidence response score",
    });
  } else {
    // Send high-confidence response to customer
    await sendWhatsAppMessage(userId, customerPhone, generatedAnswer);
  }

  // 9. Asynchronously parse intent & update Leads database
  extractAndSaveLeadIntent(userId, customerPhone, history).catch((err) =>
    console.error("Lead intent parsing task failed:", err)
  );
}
