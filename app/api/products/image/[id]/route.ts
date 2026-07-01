import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      select: { imageUrl: true },
    });

    if (!product || !product.imageUrl) {
      return new Response("Image not found", { status: 404 });
    }

    if (product.imageUrl.startsWith("data:")) {
      const matches = product.imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches) {
        return new Response("Invalid image data format", { status: 400 });
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      return new Response(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // If it's a standard URL, redirect to it
    return NextResponse.redirect(product.imageUrl);
  } catch (error) {
    console.error("Failed to serve product image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
