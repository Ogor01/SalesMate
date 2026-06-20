import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string(),
  price: z.number().int().positive("Price must be a positive integer"), // stored in kobo
  imageUrl: z.string().optional().nullable(),
  colorOptions: z.array(z.string()).default([]),
  sizeOptions: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
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
    const products = await db.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("GET /api/products database error:", error);
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
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { message: "Validation error", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    const newProduct = await db.product.create({
      data: {
        userId,
        productName: result.data.productName,
        description: result.data.description,
        price: result.data.price,
        imageUrl: result.data.imageUrl || null,
        colorOptions: result.data.colorOptions,
        sizeOptions: result.data.sizeOptions,
        inStock: result.data.inStock,
      },
    });

    return NextResponse.json({ data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products database error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
