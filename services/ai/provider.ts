import { AiProvider, AiConfig, loadAiConfig, AiChatMessage } from "./types";

class OpenAiCompatibleProvider implements AiProvider {
  private config: AiConfig;

  constructor(config: AiConfig) {
    this.config = config;
  }

  async generateChatCompletion(params: {
    systemPrompt: string;
    userMessage: string;
    history: AiChatMessage[];
  }): Promise<{ text: string; error?: string }> {
    const messages: any[] = [{ role: "system", content: params.systemPrompt }];

    for (const h of params.history) {
      const role = h.role === "customer" ? "user" : "assistant";
      if (h.mediaUrl) {
        messages.push({
          role,
          content: [
            { type: "text", text: h.content || "Image inquiry" },
            { type: "image_url", image_url: { url: h.mediaUrl } }
          ]
        });
      } else {
        messages.push({ role, content: h.content });
      }
    }

    const lastHistoryMsg = params.history[params.history.length - 1];
    const lastIsUserMessage = lastHistoryMsg && lastHistoryMsg.role === "customer" && lastHistoryMsg.content === params.userMessage;

    if (!lastIsUserMessage) {
      messages.push({ role: "user", content: params.userMessage });
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error: ${response.status} - ${errorText}`);
        return { text: "", error: `Provider failed with status ${response.status}` };
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      return { text: text.trim() };
    } catch (error) {
      console.error("AI Provider communication error:", error);
      return {
        text: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async generateStructuredCompletion<T>(params: {
    systemPrompt: string;
    userMessage: string;
    instruction: string;
  }): Promise<T | null> {
    const messages = [
      { role: "system", content: params.systemPrompt },
      {
        role: "user",
        content: `${params.userMessage}\n\nStrict Output Instruction: ${params.instruction}`,
      },
    ];

    try {
      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "{}";
      return JSON.parse(rawText) as T;
    } catch (err) {
      console.error("Structured LLM parser failed:", err);
      return null;
    }
  }
}

let defaultProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (!defaultProvider) {
    const config = loadAiConfig();

    if (!config.apiKey || config.apiKey === "dummy_ai_key") {
      defaultProvider = new (class implements AiProvider {
        async generateChatCompletion(params: {
          systemPrompt: string;
          userMessage: string;
          history: AiChatMessage[];
        }) {
          const msg = params.userMessage.toLowerCase();
          const prompt = params.systemPrompt.toLowerCase();

          const { PrismaClient } = require("@prisma/client");
          const prisma = new PrismaClient();

          let vendorUserId: string | null = null;
          let products: any[] = [];
          try {
            const match = params.systemPrompt.match(/sales representative for "([^"]+)"/i);
            const businessName = match ? match[1] : null;
            if (businessName) {
              const vendor = await prisma.user.findFirst({
                where: { businessName: { equals: businessName, mode: "insensitive" } },
                select: { id: true }
              });
              vendorUserId = vendor?.id || null;
            }
            if (vendorUserId) {
              products = await prisma.product.findMany({
                where: { userId: vendorUserId, inStock: true }
              });
            }
          } catch (err) {
            console.error("Mock provider init error:", err);
          } finally {
            await prisma.$disconnect();
          }

          const hasImage = params.history.some((h) => h.mediaUrl);

          if (hasImage && products.length > 0) {
            let matchedProduct = products.find((p) => msg.includes(p.productName.toLowerCase()));
            if (!matchedProduct) {
              matchedProduct = products[0];
            }
            const formattedPrice = (matchedProduct.price / 100).toLocaleString("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            }).replace("NGN", "₦");

            return {
              text: `I see the image you sent! That looks like our *${matchedProduct.productName}*, which is priced at ${formattedPrice}. It features: ${matchedProduct.description}. Would you like to order this?`,
            };
          }

          if (products.length > 0) {
            // Find active product context from conversation history
            let activeProduct = products[0];
            for (let i = params.history.length - 1; i >= 0; i--) {
              const h = params.history[i];
              const matched = products.find(p => h.content.toLowerCase().includes(p.productName.toLowerCase()));
              if (matched) {
                activeProduct = matched;
                break;
              }
            }

            // Check color option query
            const colorKeywords = ["white", "yellow", "black", "blue", "red", "green", "pink", "brown", "grey", "orange", "purple"];
            const msgWords = msg.split(/[^a-zA-Z0-9]+/);
            const isCheckingColor = msgWords.some((w) => colorKeywords.includes(w)) || msg.includes("color") || msg.includes("colour");
            if (isCheckingColor) {
              const specificColor = colorKeywords.find((c) => msgWords.includes(c));
              if (specificColor) {
                const hasColor = activeProduct.colorOptions.some((co: string) => co.toLowerCase().includes(specificColor));
                if (hasColor) {
                  return { text: `Yes! We have the *${activeProduct.productName}* in *${specificColor}* color. Would you like to select this?` };
                } else {
                  return { text: `Sorry, we don't have the *${activeProduct.productName}* in *${specificColor}* color. The available colors are: ${activeProduct.colorOptions.join(", ") || "None"}.` };
                }
              }
            }

            // Check size option query
            const sizeKeywords = ["s", "m", "l", "xl", "xxl"];
            const isCheckingSize = msgWords.some((w) => sizeKeywords.includes(w)) || msg.includes("size") || msg.includes("measurement") || msg.includes("fit");
            if (isCheckingSize) {
              const specificSize = sizeKeywords.find((s) => msgWords.includes(s));
              if (specificSize) {
                const hasSize = activeProduct.sizeOptions.some((so: string) => so.toLowerCase() === specificSize);
                if (hasSize) {
                  return { text: `Yes! We have size *${specificSize.toUpperCase()}* available for *${activeProduct.productName}*. Would you like to select this?` };
                } else {
                  return { text: `Sorry, size *${specificSize.toUpperCase()}* is currently unavailable for *${activeProduct.productName}*. The available sizes are: ${activeProduct.sizeOptions.join(", ") || "None"}.` };
                }
              }
            }

            // Check specific product name query
            const matchedProducts = products.filter(p => 
              msg.includes(p.productName.toLowerCase()) || 
              p.productName.toLowerCase().split(" ").some((word: string) => word.length > 3 && msg.includes(word))
            );

            if (matchedProducts.length === 1) {
              const p = matchedProducts[0];
              const formattedPrice = (p.price / 100).toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
              }).replace("NGN", "₦");

              return {
                text: `Yes, we have *${p.productName}* in stock! It is priced at ${formattedPrice}. Options available - Colors: ${p.colorOptions.join(", ") || "None"}, Sizes: ${p.sizeOptions.join(", ") || "None"}. Description: ${p.description}. Would you like to place an order?`
              };
            } else if (matchedProducts.length > 1) {
              const uniqueProductNames = Array.from(new Set(matchedProducts.map(p => p.productName)));
              if (uniqueProductNames.length === 1) {
                const p = matchedProducts[0];
                const formattedPrice = (p.price / 100).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).replace("NGN", "₦");

                return {
                  text: `Yes, we have *${p.productName}* in stock! It is priced at ${formattedPrice}. Options available - Colors: ${p.colorOptions.join(", ") || "None"}, Sizes: ${p.sizeOptions.join(", ") || "None"}. Description: ${p.description}. Would you like to place an order?`
                };
              }
              const productNames = uniqueProductNames.map(name => `*${name}*`).join(", ");
              return {
                text: `We have a few options matching your request: ${productNames}. Which specific one are you looking for?`
              };
            }

            // Check category or general product query
            if (msg.includes("what products") || msg.includes("do you have") || msg.includes("sell") || msg.includes("catalog") || msg.includes("items") || msg.includes("boutique")) {
              const clothesKeywords = ["dress", "shirt", "pant", "gown", "top", "wear", "skirt", "clothe", "outfit"];
              const shoesKeywords = ["shoe", "boot", "sneaker", "sandal", "heel", "footwear"];
              
              const isClothes = clothesKeywords.some(k => msg.includes(k));
              const isShoes = shoesKeywords.some(k => msg.includes(k));
              
              let categoryMatches = products;
              if (isClothes) {
                categoryMatches = products.filter(p => clothesKeywords.some(k => p.productName.toLowerCase().includes(k) || p.description.toLowerCase().includes(k)));
              } else if (isShoes) {
                categoryMatches = products.filter(p => shoesKeywords.some(k => p.productName.toLowerCase().includes(k) || p.description.toLowerCase().includes(k)));
              }

              if (categoryMatches.length === 1) {
                const p = categoryMatches[0];
                const formattedPrice = (p.price / 100).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).replace("NGN", "₦");
                return {
                  text: `Yes! We have *${p.productName}* available for ${formattedPrice}. Would you like more details?`
                };
              } else if (categoryMatches.length > 1) {
                const options = categoryMatches.map(p => `*${p.productName}*`).join(", ");
                return {
                  text: `We have these items available in our catalog: ${options}. Which one would you like to know more about?`
                };
              }
            }
          }

          if (msg.match(/\b(hi|hello|hey|good\s*(morning|afternoon|evening))\b/)) {
            return { text: "Hi there! Welcome to our boutique. Feel free to ask about our products, prices, sizes, or delivery options. How can I help you today?" };
          }
          if (msg.match(/\b(price|cost|how much|naira|₦)\b/)) {
            return { text: "Great question! Our product catalog has several items available with prices listed. Could you let me know which specific product you're interested in, and I'll be happy to share the price and details with you." };
          }
          if (msg.match(/\b(size|fit|measurement)\b/)) {
            return { text: "We carry a range of sizes in our catalog. Each product page lists the available size options. If you tell me which item you're looking at, I can check what sizes we have in stock for you." };
          }
          if (msg.match(/\b(color|colour|shade)\b/)) {
            return { text: "We offer several colour options on most of our products. The available colours are listed for each item in our catalog. Which product and colour are you interested in?" };
          }
          if (msg.match(/\b(delivery|shipping|dispatch|how long)\b/)) {
            return { text: "We deliver to locations across Nigeria. Delivery times and fees depend on your location. I can check the specific policy from our store information — just let me know your city or area." };
          }
          if (msg.match(/\b(payment|transfer|pay|bank|card)\b/)) {
            return { text: "We accept bank transfers and online payments. Our store policies outline the accepted payment methods. Would you like me to share the payment details?" };
          }
          if (msg.match(/\b(return|refund|exchange|return policy)\b/)) {
            return { text: "We have a return policy in place for defective items. For full details on return windows and conditions, you can check our store policies or let me know your concern and I'll look it up." };
          }
          if (msg.match(/\b(thank|thanks)\b/)) {
            return { text: "You're welcome! I'm glad I could help. If you have any more questions, feel free to ask. Have a great day!" };
          }
          return { text: "Thanks for reaching out! I'd be happy to help you with product inquiries, pricing, sizes, colours, delivery, and payments. What would you like to know about?" };
        }
        async generateStructuredCompletion() {
          return null;
        }
      })();
    } else {
      defaultProvider = new OpenAiCompatibleProvider(config);
    }
  }
  return defaultProvider;
}

// Backward-compatible shim — delegates to the default provider
export async function generateChatCompletion(
  systemPrompt: string,
  userMessage: string,
  history: AiChatMessage[] = []
): Promise<{ text: string; error?: string }> {
  return getAiProvider().generateChatCompletion({ systemPrompt, userMessage, history });
}

export async function generateStructuredCompletion<T>(
  systemPrompt: string,
  userMessage: string,
  instruction: string
): Promise<T | null> {
  return getAiProvider().generateStructuredCompletion<T>({
    systemPrompt,
    userMessage,
    instruction,
  });
}
