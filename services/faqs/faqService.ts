import { db } from "@/lib/db";

export interface CreateFaqInput {
  question: string;
  answer: string;
}

export interface FaqResult {
  id: string;
  userId: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export async function listFaqs(userId: string): Promise<FaqResult[]> {
  return db.fAQ.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createFaq(userId: string, input: CreateFaqInput): Promise<FaqResult> {
  return db.fAQ.create({
    data: {
      userId,
      question: input.question,
      answer: input.answer,
    },
  });
}

export async function updateFaq(
  id: string,
  userId: string,
  input: Partial<CreateFaqInput>
): Promise<FaqResult | null> {
  const existing = await db.fAQ.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return db.fAQ.update({
    where: { id },
    data: {
      ...(input.question !== undefined && { question: input.question }),
      ...(input.answer !== undefined && { answer: input.answer }),
    },
  });
}

export async function deleteFaq(
  id: string,
  userId: string
): Promise<boolean> {
  const existing = await db.fAQ.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await db.fAQ.delete({ where: { id } });
  return true;
}
