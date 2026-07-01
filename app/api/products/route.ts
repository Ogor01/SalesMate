import { withAuth } from "@/lib/api-auth";
import { listProducts, createProduct } from "@/services/products/productService";
import { NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string(),
  price: z.number().int().positive("Price must be a positive integer"),
  imageUrl: z.string().optional().nullable(),
  colorOptions: z.array(z.string()).default([]),
  sizeOptions: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
});

export const GET = withAuth(async ({ userId }) => {
  const products = await listProducts(userId);
  return NextResponse.json({ data: products });
});

export const POST = withAuth(async ({ userId }, req) => {
  const body = await req.json();
  const result = productSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const newProduct = await createProduct(userId, result.data);
  return NextResponse.json({ data: newProduct }, { status: 201 });
});
