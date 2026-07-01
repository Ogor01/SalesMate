import { db } from "@/lib/db";

export interface CreateProductInput {
  productName: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  colorOptions: string[];
  sizeOptions: string[];
  inStock?: boolean;
}

export interface ProductResult {
  id: string;
  productName: string;
  description: string;
  price: number;
  imageUrl: string | null;
  colorOptions: string[];
  sizeOptions: string[];
  inStock: boolean;
  createdAt: Date;
}

export async function listProducts(userId: string): Promise<ProductResult[]> {
  return db.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(
  userId: string,
  input: CreateProductInput
): Promise<ProductResult> {
  return db.product.create({
    data: {
      userId,
      productName: input.productName,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl || null,
      colorOptions: input.colorOptions,
      sizeOptions: input.sizeOptions,
      inStock: input.inStock ?? true,
    },
  });
}

export async function updateProduct(
  id: string,
  userId: string,
  input: Partial<CreateProductInput>
): Promise<ProductResult | null> {
  const existing = await db.product.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return db.product.update({
    where: { id },
    data: {
      ...(input.productName !== undefined && { productName: input.productName }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.colorOptions !== undefined && { colorOptions: input.colorOptions }),
      ...(input.sizeOptions !== undefined && { sizeOptions: input.sizeOptions }),
      ...(input.inStock !== undefined && { inStock: input.inStock }),
    },
  });
}

export async function deleteProduct(
  id: string,
  userId: string
): Promise<boolean> {
  const existing = await db.product.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await db.product.delete({ where: { id } });
  return true;
}
