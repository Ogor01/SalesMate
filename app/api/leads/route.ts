import { withAuth } from "@/lib/api-auth";
import { listLeads, updateLeadStatus } from "@/services/leads/leadService";
import { NextResponse } from "next/server";
import { z } from "zod";
import { LeadStatus } from "@prisma/client";

const leadUpdateSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  leadStatus: z.nativeEnum(LeadStatus),
});

export const GET = withAuth(async ({ userId }) => {
  const leads = await listLeads(userId);
  return NextResponse.json({ data: leads });
});

export const PUT = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = leadUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const updated = await updateLeadStatus(result.data.id, userId, result.data.leadStatus);

  if (!updated) {
    return NextResponse.json(
      { error: { message: "Lead not found or access forbidden", code: "FORBIDDEN" } },
      { status: 403 }
    );
  }

  return NextResponse.json({ data: updated });
});
