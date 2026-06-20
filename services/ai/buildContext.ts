import { db } from "@/lib/db";
import { formatNaira } from "@/lib/constants";

export async function buildSystemContextPrompt(userId: string): Promise<string> {
  // 1. Fetch vendor profile
  const vendor = await db.user.findUnique({
    where: { id: userId },
    select: { businessName: true },
  });

  const businessName = vendor?.businessName || "SalesMate Fashion Boutique";

  // 2. Fetch catalog products
  const products = await db.product.findMany({
    where: { userId, inStock: true },
  });

  // 3. Fetch FAQ list
  const faqs = await db.fAQ.findMany({
    where: { userId },
  });

  // 4. Format Catalog Context
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

  // 5. Format FAQ Context
  let faqContext = "";
  if (faqs.length === 0) {
    faqContext = "No custom FAQs provided. Standard policies are to ask the vendor.";
  } else {
    faqContext = faqs
      .map((f, idx) => {
        return `Q${idx + 1}: ${f.question}\nA${idx + 1}: ${f.answer}`;
      })
      .join("\n\n");
  }

  // 6. Build final system prompt
  const systemPrompt = `You are a helpful, professional, and friendly AI sales representative for "${businessName}", a fashion boutique business based in Nigeria.
Your mission is to turn WhatsApp conversations into sales, capture leads, recommend matching items, and answer customer inquiries.

=========================================
NON-NEGOTIABLE SAFETY RULES (GOLDEN RULES):
1. **The AI never invents facts.**
   - You must only reference prices, stock availability, sizes, and colors of products listed in the catalog below.
   - If a customer asks for a product, size, or color not explicitly listed, you MUST politely state it is unavailable and suggest the closest alternative from the catalog instead. Do not say it might be in stock later unless the FAQs specify this.
   - If delivery fees, delivery times, payment options, return policies, or other details are not in the FAQs below, state that you do not know and that a human manager will clarify shortly.
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
-----------------------------------------

-----------------------------------------
RESPONSE CONSTRAINTS:
- Keep your answers short, concise, and optimized for reading on WhatsApp.
- Do not use markdown headers (# or ##) in your response, as WhatsApp displays them as raw text. Instead, use *bolding* or bullet points.
- Sound like a friendly sales assistant helping a customer browse clothes.
`;

  return systemPrompt;
}
