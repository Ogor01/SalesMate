import { withAuth } from "@/lib/api-auth";
import { updateProduct, deleteProduct } from "@/services/products/productService";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  productName: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  imageUrl: z.string().optional().nullable(),
  colorOptions: z.array(z.string()).optional(),
  sizeOptions: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
});

function getId(req: Request): string | null {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || null;
}

export const PUT = withAuth(async ({ userId }, req) => {
  const id = getId(req);
  if (!id) {
    return NextResponse.json({ error: { message: "Missing product ID" } }, { status: 400 });
  }

  const body = await req.json();
  const result = updateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { message: "Validation error", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  const updated = await updateProduct(id, userId, result.data);

  if (!updated) {
    return NextResponse.json(
      { error: { message: "Product not found or access forbidden", code: "FORBIDDEN" } },
      { status: 403 }
    );
  }

  return NextResponse.json({ data: updated });
});

export const DELETE = withAuth(async ({ userId }, req) => {
  const id = getId(req);
  if (!id) {
    return NextResponse.json({ error: { message: "Missing product ID" } }, { status: 400 });
  }

  const deleted = await deleteProduct(id, userId);

  if (!deleted) {
    return NextResponse.json(
      { error: { message: "Product not found or access forbidden", code: "FORBIDDEN" } },
      { status: 403 }
    );
  }

  return NextResponse.json({ data: { id, deleted: true } });
});
