import { AiProvider, AiConfig, loadAiConfig, AiChatMessage } from "./types";
import { MockAiProvider } from "./mock-provider";

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
            { type: "image_url", image_url: { url: h.mediaUrl } },
          ],
        });
      } else {
        messages.push({ role, content: h.content });
      }
    }

    const lastHistoryMsg = params.history[params.history.length - 1];
    const lastIsUserMessage =
      lastHistoryMsg &&
      lastHistoryMsg.role === "customer" &&
      lastHistoryMsg.content === params.userMessage;

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
      defaultProvider = new MockAiProvider();
    } else {
      defaultProvider = new OpenAiCompatibleProvider(config);
    }
  }
  return defaultProvider;
}

export async function generateChatCompletion(
  systemPrompt: string,
  userMessage: string,
  history: AiChatMessage[] = []
): Promise<{ text: string; error?: string }> {
  return getAiProvider().generateChatCompletion({
    systemPrompt,
    userMessage,
    history,
  });
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
