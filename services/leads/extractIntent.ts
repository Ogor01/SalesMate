import { db } from "@/lib/db";
import { generateStructuredCompletion } from "../ai/provider";
import { LeadStatus } from "@prisma/client";

interface ExtractedIntent {
  customerName?: string;
  productInterest?: string;
  leadStatus?: LeadStatus;
}

/**
 * Extracts buying intent and customer details from a conversation,
 * and creates or updates a Lead record in the database.
 */
export async function extractAndSaveLeadIntent(
  userId: string,
  customerPhone: string,
  history: { role: string; content: string }[]
): Promise<void> {
  const lastMessages = history.slice(-10); // Analyze the most recent context
  const conversationString = lastMessages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  let extracted: ExtractedIntent = {};

  // Tier 1: Try LLM Structured parsing
  if (process.env.AI_PROVIDER_API_KEY) {
    const systemPrompt = `You are an expert intent parsing service. Analyze the WhatsApp chat transcript below and extract:
1. Customer Name (e.g., if they mention their name is "Chioma").
2. Product Interest (the specific clothing/fashion product name they are asking about or buying, e.g., "Yellow Pants").
3. Lead Status based on conversation signals:
   - "NEW": Initial contact, generic hello.
   - "CONTACTED": Customer asked questions about price, sizing, or colors.
   - "QUALIFIED": Customer showed interest, selected a size/color, or asked for payment options.
   - "CONVERTED": Customer confirmed order, sent payment receipt, or said they completed the purchase.
   - "LOST": Customer said they are no longer interested or stopped responding negatively.`;

    const instruction = `Return a JSON object containing:
{
  "customerName": string or null,
  "productInterest": string or null,
  "leadStatus": "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
}`;

    const result = await generateStructuredCompletion<ExtractedIntent>(
      systemPrompt,
      conversationString,
      instruction
    );

    if (result) {
      extracted = result;
    }
  }

  // Tier 2: Local Rule-Based Parsing (Fallback when LLM is unavailable or fails)
  if (!extracted.customerName || !extracted.productInterest) {
    // 1. Guess status based on simple keywords
    let guessedStatus: LeadStatus = "NEW";
    const chatText = conversationString.toLowerCase();

    if (chatText.includes("buy") || chatText.includes("order") || chatText.includes("transfer") || chatText.includes("paid")) {
      guessedStatus = "CONVERTED";
    } else if (chatText.includes("size") || chatText.includes("color") || chatText.includes("price") || chatText.includes("available")) {
      guessedStatus = "QUALIFIED";
    } else if (chatText.length > 30) {
      guessedStatus = "CONTACTED";
    }

    // 2. Guess customer name (look for common intros: "i am", "my name is", "call me")
    let guessedName: string | undefined;
    const nameMatch = chatText.match(/(?:my name is|i am|call me)\s+([a-z0-name]{3,15})/i);
    if (nameMatch && nameMatch[1]) {
      guessedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // 3. Guess product interest (simple matching based on common terms)
    let guessedProduct: string | undefined;
    const catalogProducts = await db.product.findMany({
      where: { userId },
      select: { productName: true },
    }).catch(() => []);

    for (const p of catalogProducts) {
      if (chatText.includes(p.productName.toLowerCase())) {
        guessedProduct = p.productName;
        break;
      }
    }

    extracted = {
      customerName: extracted.customerName || guessedName,
      productInterest: extracted.productInterest || guessedProduct,
      leadStatus: extracted.leadStatus || guessedStatus,
    };
  }

  // 3. Save to DB (Create or Update the Lead record)
  try {
    const existingLead = await db.lead.findFirst({
      where: { userId, phoneNumber: customerPhone },
    });

    if (existingLead) {
      await db.lead.update({
        where: { id: existingLead.id },
        data: {
          customerName: extracted.customerName || existingLead.customerName,
          productInterest: extracted.productInterest || existingLead.productInterest,
          leadStatus: extracted.leadStatus || existingLead.leadStatus,
        },
      });
    } else {
      await db.lead.create({
        data: {
          userId,
          phoneNumber: customerPhone,
          customerName: extracted.customerName || null,
          productInterest: extracted.productInterest || null,
          leadStatus: extracted.leadStatus || "NEW",
        },
      });
    }
  } catch (dbError) {
    console.error("Failed to write extracted lead intent to database:", dbError);
  }
}
