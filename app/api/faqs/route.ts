import { withAuth } from "@/lib/api-auth";
import { listFaqs, createFaq } from "@/services/faqs/faqService";
import { NextResponse } from "next/server";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export const GET = withAuth(async ({ userId }) => {
  const faqs = await listFaqs(userId);
  return NextResponse.json({ data: faqs });
});

export const POST = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = faqSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const newFaq = await createFaq(userId, result.data);
  return NextResponse.json({ data: newFaq }, { status: 201 });
});
