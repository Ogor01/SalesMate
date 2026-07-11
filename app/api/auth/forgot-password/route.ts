import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/services/notifications/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: { message: "Email is required." } }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: { message: "No account found with this email." } }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth?reset=${resetToken}`;

    const result = await sendPasswordResetEmail(email, resetLink, user.businessName);

    if (!result.success) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);
      }
    }

    return NextResponse.json({ message: "Reset link sent." });
  } catch {
    return NextResponse.json({ error: { message: "Something went wrong." } }, { status: 500 });
  }
}
