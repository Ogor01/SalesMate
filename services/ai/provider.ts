import { ChatMessage } from "@/types";

interface AICompletionResponse {
  text: string;
  error?: string;
}

export async function generateChatCompletion(
  systemPrompt: string,
  userMessage: string,
  history: ChatMessage[] = []
): Promise<AICompletionResponse> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  const apiUrl = process.env.AI_PROVIDER_URL || "https://api.openai.com/v1";
  const model = process.env.AI_PROVIDER_MODEL || "gpt-4o";

  if (!apiKey) {
    console.error("AI_PROVIDER_API_KEY is not defined. Falling back to default mock response.");
    return {
      text: "Hello! I am the SalesMate AI assistant. I couldn't reach my brain database because API credentials are not set up yet. A vendor will help you shortly!",
    };
  }

  // Format history messages into OpenAI Chat format
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === "customer" ? "user" : h.role === "ai" ? "assistant" : "assistant", // mapping vendor takeover responses too if needed
      content: h.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(`${apiUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.2, // Low temperature for factual shopping catalog answers
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      return {
        text: "",
        error: `Provider failed with status ${response.status}`,
      };
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

/**
 * Utility to query the LLM with instructions that require a JSON object return.
 */
export async function generateStructuredCompletion<T>(
  systemPrompt: string,
  userMessage: string,
  jsonSchemaInstruction: string
): Promise<T | null> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  const apiUrl = process.env.AI_PROVIDER_URL || "https://api.openai.com/v1";
  const model = process.env.AI_PROVIDER_MODEL || "gpt-4o";

  if (!apiKey) {
    return null;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `${userMessage}\n\nStrict Output Instruction: ${jsonSchemaInstruction}` },
  ];

  try {
    const response = await fetch(`${apiUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(rawText) as T;
  } catch (err) {
    console.error("Structured LLM parser failed:", err);
    return null;
  }
}
