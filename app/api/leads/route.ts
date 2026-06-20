import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { LeadStatus } from "@prisma/client";

const leadUpdateSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  leadStatus: z.nativeEnum(LeadStatus),
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
    const leads = await db.lead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error("GET /api/leads database error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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
    const result = leadUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { message: "Validation error", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    // Verify the lead belongs to this vendor
    const lead = await db.lead.findUnique({
      where: { id: result.data.id },
    });

    if (!lead || lead.userId !== userId) {
      return NextResponse.json(
        { error: { message: "Lead not found or access forbidden", code: "FORBIDDEN" } },
        { status: 403 }
      );
    }

    const updatedLead = await db.lead.update({
      where: { id: result.data.id },
      data: {
        leadStatus: result.data.leadStatus,
      },
    });

    return NextResponse.json({ data: updatedLead });
  } catch (error) {
    console.error("PUT /api/leads database error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
