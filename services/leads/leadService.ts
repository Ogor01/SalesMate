import { db } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export interface LeadResult {
  id: string;
  userId: string;
  customerName: string | null;
  phoneNumber: string;
  productInterest: string | null;
  leadStatus: LeadStatus;
  createdAt: Date;
}

export async function listLeads(userId: string): Promise<LeadResult[]> {
  return db.lead.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeadStatus(
  leadId: string,
  userId: string,
  newStatus: LeadStatus
): Promise<LeadResult | null> {
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead || lead.userId !== userId) return null;

  return db.lead.update({
    where: { id: leadId },
    data: { leadStatus: newStatus },
  });
}
