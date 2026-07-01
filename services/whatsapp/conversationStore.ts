import { db } from "@/lib/db";
import { ChatMessage } from "@/types";

export interface ConversationSnapshot {
  id: string;
  userId: string;
  customerPhone: string;
  conversationHistory: ChatMessage[];
  aiConfidenceScore: number;
  isEscalated: boolean;
}

/**
 * Appends a message to the conversation history atomically.
 * Creates the conversation if it doesn't exist.
 */
export async function appendMessage(
  userId: string,
  customerPhone: string,
  message: ChatMessage
): Promise<ConversationSnapshot> {
  return db.$transaction(async (tx) => {
    let conv = await tx.conversation.findFirst({
      where: { userId, customerPhone },
    });

    let history: ChatMessage[] = [];
    if (conv) {
      history = (conv.conversationHistory as unknown as ChatMessage[]) || [];
    }
    history.push(message);

    if (conv) {
      const updated = await tx.conversation.update({
        where: { id: conv.id },
        data: { conversationHistory: history as any },
      });
      return toSnapshot(updated);
    } else {
      const created = await tx.conversation.create({
        data: {
          userId,
          customerPhone,
          conversationHistory: history as any,
        },
      });
      return toSnapshot(created);
    }
  });
}

/**
 * Updates conversation fields inside a transaction.
 */
export async function updateConversation(
  userId: string,
  customerPhone: string,
  data: {
    conversationHistory?: ChatMessage[];
    aiConfidenceScore?: number;
    isEscalated?: boolean;
  }
): Promise<ConversationSnapshot> {
  return db.$transaction(async (tx) => {
    const conv = await tx.conversation.findFirst({
      where: { userId, customerPhone },
    });
    if (!conv) throw new Error(`Conversation not found for ${customerPhone}`);

    const updateData: Record<string, unknown> = {};
    if (data.conversationHistory) updateData.conversationHistory = data.conversationHistory as any;
    if (data.aiConfidenceScore !== undefined) updateData.aiConfidenceScore = data.aiConfidenceScore;
    if (data.isEscalated !== undefined) updateData.isEscalated = data.isEscalated;

    const updated = await tx.conversation.update({
      where: { id: conv.id },
      data: updateData,
    });
    return toSnapshot(updated);
  });
}

/**
 * Creates or updates a conversation as escalated (panic fallback).
 */
export async function escalateConversation(
  userId: string,
  customerPhone: string,
  messageText: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    let conv = await tx.conversation.findFirst({
      where: { userId, customerPhone },
    });

    const now = new Date().toISOString();
    const customerMsg: ChatMessage = { role: "customer", content: messageText, timestamp: now };

    if (conv) {
      let history = (conv.conversationHistory as unknown as ChatMessage[]) || [];
      history.push(customerMsg);
      await tx.conversation.update({
        where: { id: conv.id },
        data: {
          conversationHistory: history as any,
          isEscalated: true,
          aiConfidenceScore: 0.0,
        },
      });
    } else {
      await tx.conversation.create({
        data: {
          userId,
          customerPhone,
          conversationHistory: [customerMsg] as any,
          isEscalated: true,
          aiConfidenceScore: 0.0,
        },
      });
    }
  });
}

/**
 * Fetches the current conversation history (read-only).
 */
export async function getHistory(
  userId: string,
  customerPhone: string
): Promise<ChatMessage[]> {
  const conv = await db.conversation.findFirst({
    where: { userId, customerPhone },
    select: { conversationHistory: true },
  });
  return (conv?.conversationHistory as unknown as ChatMessage[]) || [];
}

function toSnapshot(conv: {
  id: string;
  userId: string;
  customerPhone: string;
  conversationHistory: unknown;
  aiConfidenceScore: number;
  isEscalated: boolean;
}): ConversationSnapshot {
  return {
    id: conv.id,
    userId: conv.userId,
    customerPhone: conv.customerPhone,
    conversationHistory: (conv.conversationHistory as unknown as ChatMessage[]) || [],
    aiConfidenceScore: conv.aiConfidenceScore,
    isEscalated: conv.isEscalated,
  };
}
