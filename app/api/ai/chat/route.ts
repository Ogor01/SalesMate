import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSystemContextPrompt } from "@/services/ai/buildContext";
import { generateChatCompletion } from "@/services/ai/provider";
import { scoreResponseConfidence, needsHandoff } from "@/services/ai/confidence";

const chatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["customer", "ai"]),
        content: z.string(),
      })
    )
    .default([]),
});

export const POST = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = chatSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Message is required" } },
      { status: 400 }
    );
  }

  const { message, history } = result.data;

  const systemPrompt = await buildSystemContextPrompt(userId);
  const completion = await generateChatCompletion(systemPrompt, message, history);

  if (completion.error || !completion.text) {
    return NextResponse.json(
      { error: { message: completion.error || "AI failed to respond" } },
      { status: 500 }
    );
  }

  const confidence = scoreResponseConfidence(completion.text);
  const escalated = needsHandoff(confidence);

  return NextResponse.json({
    data: {
      reply: completion.text,
      confidence,
      escalated,
    },
  });
});
