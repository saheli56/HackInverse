export interface GroqConfig {
  apiKey: string;
  model: string;
  endpoint: string;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  endpoint: string;
}

export interface LLMConfig {
  groq: GroqConfig;
  gemini: GeminiConfig;
}
