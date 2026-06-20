import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
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
    const faqs = await db.fAQ.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: faqs });
  } catch (error) {
    console.error("GET /api/faqs database error:", error);
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
    const result = faqSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { message: "Validation error", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    const newFaq = await db.fAQ.create({
      data: {
        userId,
        question: result.data.question,
        answer: result.data.answer,
      },
    });

    return NextResponse.json({ data: newFaq }, { status: 201 });
  } catch (error) {
    console.error("POST /api/faqs database error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
