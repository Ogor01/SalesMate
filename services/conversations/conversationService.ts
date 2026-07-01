import { db } from "@/lib/db";

export interface ConversationResult {
  id: string;
  userId: string;
  customerPhone: string;
  conversationHistory: unknown;
  aiConfidenceScore: number;
  isEscalated: boolean;
  createdAt: Date;
}

export async function listConversations(userId: string): Promise<ConversationResult[]> {
  return db.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findConversation(
  userId: string,
  customerPhone: string
): Promise<ConversationResult | null> {
  return db.conversation.findFirst({
    where: { userId, customerPhone },
  });
}

export async function updateConversation(
  userId: string,
  customerPhone: string,
  data: {
    conversationHistory?: unknown[];
    isEscalated?: boolean;
  }
): Promise<ConversationResult | null> {
  const conv = await db.conversation.findFirst({
    where: { userId, customerPhone },
  });
  if (!conv) return null;

  return db.conversation.update({
    where: { id: conv.id },
    data: {
      ...(data.conversationHistory ? { conversationHistory: data.conversationHistory as any } : {}),
      ...(data.isEscalated !== undefined ? { isEscalated: data.isEscalated } : {}),
    },
  }) as Promise<ConversationResult>;
}
