export interface AiChatMessage {
  role: string;
  content: string;
  mediaUrl?: string;
}

export interface AiCompletionParams {
  systemPrompt: string;
  userMessage: string;
  history: AiChatMessage[];
}

export interface AiCompletionResult {
  text: string;
  error?: string;
}

export interface AiStructuredParams {
  systemPrompt: string;
  userMessage: string;
  instruction: string;
}

export interface AiProvider {
  generateChatCompletion(params: AiCompletionParams): Promise<AiCompletionResult>;
  generateStructuredCompletion<T>(params: AiStructuredParams): Promise<T | null>;
}

export interface AiConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export function loadAiConfig(): AiConfig {
  return {
    apiKey: process.env.AI_PROVIDER_API_KEY || "",
    apiUrl: (process.env.AI_PROVIDER_URL || "https://api.deepseek.com/v1").replace(/\/+$/, ""),
    model: process.env.AI_PROVIDER_MODEL || "deepseek-chat",
  };
}
