import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  businessName: z.string().min(1, "Business name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { message: "Validation error", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    const { fullName, email, businessName, password } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { message: "An account with this email already exists." } },
        { status: 409 }
      );
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Create user
    const newUser = await db.user.create({
      data: {
        fullName,
        email,
        businessName,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        businessName: true,
      },
    });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register database error:", error);
    return NextResponse.json(
      { error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}
