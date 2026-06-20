import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/services/whatsapp/client";
import { ChatMessage } from "@/types";
import { z } from "zod";

const replySchema = z.object({
  customerPhone: z.string().min(1),
  messageText: z.string().min(1, "Message content is required"),
  toggleEscalation: z.boolean().optional(), // optionally clear the escalation badge
});

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 }
    );
  }

  try {
    const conversations = await db.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error("GET /api/conversations database error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = replySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { message: "Validation error", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    const { customerPhone, messageText, toggleEscalation } = result.data;

    // 1. Fetch conversation
    const conversation = await db.conversation.findFirst({
      where: { userId, customerPhone },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: { message: "Conversation not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // 2. Deliver the message over WhatsApp Cloud API
    const sendResult = await sendWhatsAppMessage(userId, customerPhone, messageText);

    if (!sendResult.success) {
      return NextResponse.json(
        { error: { message: `WhatsApp send failed: ${sendResult.error}` } },
        { status: 400 }
      );
    }

    // 3. Append the vendor message to history
    const history = (conversation.conversationHistory as unknown as ChatMessage[]) || [];
    const vendorMsg: ChatMessage = {
      role: "vendor",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    history.push(vendorMsg);

    // If merchant replies, we can clear the escalation badge (isEscalated = false) or leave it
    // depending on if they resolved it. We default to clearing it or using the toggled flag.
    const finalEscalationState = toggleEscalation !== undefined ? toggleEscalation : false;

    const updatedConversation = await db.conversation.update({
      where: { id: conversation.id },
      data: {
        conversationHistory: history as any,
        isEscalated: finalEscalationState,
      },
    });

    return NextResponse.json({ data: updatedConversation });
  } catch (error) {
    console.error("POST /api/conversations database error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
