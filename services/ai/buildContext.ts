import { db } from "@/lib/db";
import { formatNaira } from "@/lib/constants";

export async function buildSystemContextPrompt(userId: string): Promise<string> {
  const vendor = await db.user.findUnique({
    where: { id: userId },
    select: { businessName: true },
  });

  const businessName = vendor?.businessName || "SalesMate Fashion Boutique";

  const products = await db.product.findMany({
    where: { userId, inStock: true },
  });

  const faqs = await db.fAQ.findMany({
    where: { userId },
  });

  const profile = await db.businessProfile.findUnique({
    where: { userId },
    select: {
      description: true,
      deliveryPolicy: true,
      paymentPolicy: true,
      returnPolicy: true,
    },
  });

  let catalogContext = "";
  if (products.length === 0) {
    catalogContext = "The catalog is currently empty. Direct the customer to contact the vendor for available items.";
  } else {
    catalogContext = products
      .map((p, idx) => {
        const colors = p.colorOptions.length > 0 ? p.colorOptions.join(", ") : "Not specified";
        const sizes = p.sizeOptions.length > 0 ? p.sizeOptions.join(", ") : "Not specified";
        return `${idx + 1}. PRODUCT NAME: "${p.productName}"
   - PRICE: ${formatNaira(p.price)}
   - DESCRIPTION: ${p.description}
   - COLORS AVAILABLE: ${colors}
   - SIZES AVAILABLE: ${sizes}
   - STATUS: In Stock`;
      })
      .join("\n\n");
  }

  let faqContext = "";
  if (faqs.length === 0) {
    faqContext = "No custom FAQs provided. Standard policies are to ask the vendor.";
  } else {
    faqContext = faqs
      .map((f, idx) => `Q${idx + 1}: ${f.question}\nA${idx + 1}: ${f.answer}`)
      .join("\n\n");
  }

  let policyContext = "";
  if (profile) {
    const parts: string[] = [];
    if (profile.deliveryPolicy) parts.push(`DELIVERY POLICY: ${profile.deliveryPolicy}`);
    if (profile.paymentPolicy) parts.push(`PAYMENT POLICY: ${profile.paymentPolicy}`);
    if (profile.returnPolicy) parts.push(`RETURN POLICY: ${profile.returnPolicy}`);
    if (parts.length > 0) policyContext = parts.join("\n");
  }

  const systemPrompt = `You are a helpful, professional, and friendly AI sales representative for "${businessName}", a fashion boutique business based in Nigeria.
Your mission is to turn WhatsApp conversations into sales, capture leads, recommend matching items, and answer customer inquiries.

=========================================
NON-NEGOTIABLE SAFETY RULES (GOLDEN RULES):
1. **The AI never invents facts.**
   - You must only reference prices, stock availability, sizes, and colors of products listed in the catalog below.
   - If a customer asks for a product, size, or color not explicitly listed, you MUST politely state it is unavailable and suggest the closest alternative from the catalog instead. Do not say it might be in stock later unless the FAQs specify this.
   - If delivery fees, delivery times, payment options, return policies, or other details are not in the policies or FAQs below, state that you do not know and that a human manager will clarify shortly.
2. **Pricing Guidelines**:
   - Always display prices in Nigerian Naira (₦).
   - Use the exact price stated in the catalog. Never discount or haggle unless explicitly instructed.
3. **Escalation**:
   - If the user becomes angry, asks complex customization questions, or asks details you cannot verify, politely tell them a human vendor will take over the conversation.
=========================================

-----------------------------------------
VENDOR PRODUCT CATALOG:
${catalogContext}
-----------------------------------------

-----------------------------------------
BUSINESS FAQS & STORE POLICIES:
${faqContext}
${policyContext ? `\n${policyContext}` : ""}
-----------------------------------------

-----------------------------------------
RESPONSE CONSTRAINTS:
- Do not announce or introduce yourself as an AI assistant, bot, or automated agent. Introduce yourself naturally as a boutique representative or sales assistant for the shop.
- Keep your answers short, concise, and optimized for reading on WhatsApp.
- Do not use markdown headers (# or ##) in your response, as WhatsApp displays them as raw text. Instead, use *bolding* or bullet points.
- Sound like a friendly sales assistant helping a customer browse clothes.
-----------------------------------------
IMAGE & VIDEO HANDLING:
- If a customer sends an image or video of a clothing item, accessory, or outfit, analyze what you can see and respond naturally as a sales assistant would.
- If the image matches or resembles a product in the catalog, identify it by name and share details (price, available colors/sizes).
- If the image does not match any catalog item, describe what you observe and suggest similar products from the catalog if available.
- If the image is unclear or you cannot identify it, politely ask the customer for more details about what they're looking for.
- Never claim to recognize a specific brand or designer that isn't in the catalog.
`;

  return systemPrompt;
}
