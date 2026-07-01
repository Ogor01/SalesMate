import { withAuth } from "@/lib/api-auth";
import { listConversations, updateConversation } from "@/services/conversations/conversationService";
import { sendWhatsAppMessage } from "@/services/whatsapp/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const replySchema = z.object({
  customerPhone: z.string().min(1),
  messageText: z.string().min(1, "Message content is required"),
  toggleEscalation: z.boolean().optional(),
});

export const GET = withAuth(async ({ userId }) => {
  const conversations = await listConversations(userId);
  return NextResponse.json({ data: conversations });
});

export const POST = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = replySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const { customerPhone, messageText, toggleEscalation } = result.data;

  const conversation = await updateConversation(userId, customerPhone, {
    isEscalated: toggleEscalation !== undefined ? toggleEscalation : false,
  });

  if (!conversation) {
    return NextResponse.json(
      { error: { message: "Conversation not found", code: "NOT_FOUND" } },
      { status: 404 }
    );
  }

  const sendResult = await sendWhatsAppMessage(userId, customerPhone, messageText);

  if (!sendResult.success) {
    return NextResponse.json(
      { error: { message: `WhatsApp send failed: ${sendResult.error}` } },
      { status: 400 }
    );
  }

  const history = (conversation.conversationHistory as unknown as { role: string; content: string; timestamp: string }[]) || [];
  history.push({
    role: "vendor",
    content: messageText,
    timestamp: new Date().toISOString(),
  });

  const updated = await updateConversation(userId, customerPhone, {
    conversationHistory: history,
    isEscalated: toggleEscalation !== undefined ? toggleEscalation : false,
  });

  return NextResponse.json({ data: updated });
});
