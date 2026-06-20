import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

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

    // In production, send this via email. For MVP, log to console.
    console.log(`[Forgot Password] Reset link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth?reset=${resetToken}`);

    return NextResponse.json({ message: "Reset link sent." });
  } catch {
    return NextResponse.json({ error: { message: "Something went wrong." } }, { status: 500 });
  }
}
