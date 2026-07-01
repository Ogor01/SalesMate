import { db } from "@/lib/db";

export interface BusinessProfileResult {
  description: string | null;
  deliveryPolicy: string | null;
  paymentPolicy: string | null;
  returnPolicy: string | null;
}

export async function getProfile(userId: string): Promise<BusinessProfileResult | null> {
  return db.businessProfile.findUnique({
    where: { userId },
    select: {
      description: true,
      deliveryPolicy: true,
      paymentPolicy: true,
      returnPolicy: true,
    },
  });
}

export async function upsertProfile(
  userId: string,
  data: {
    description?: string;
    deliveryPolicy?: string;
    paymentPolicy?: string;
    returnPolicy?: string;
  }
): Promise<BusinessProfileResult> {
  return db.businessProfile.upsert({
    where: { userId },
    create: {
      userId,
      description: data.description || null,
      deliveryPolicy: data.deliveryPolicy || null,
      paymentPolicy: data.paymentPolicy || null,
      returnPolicy: data.returnPolicy || null,
    },
    update: {
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.deliveryPolicy !== undefined ? { deliveryPolicy: data.deliveryPolicy } : {}),
      ...(data.paymentPolicy !== undefined ? { paymentPolicy: data.paymentPolicy } : {}),
      ...(data.returnPolicy !== undefined ? { returnPolicy: data.returnPolicy } : {}),
    },
    select: {
      description: true,
      deliveryPolicy: true,
      paymentPolicy: true,
      returnPolicy: true,
    },
  });
}
