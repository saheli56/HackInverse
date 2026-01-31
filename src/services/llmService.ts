import { LLMResponse, ChatMessage } from "../types";

export class LLMService {
  private groqApiKey: string;
  private geminiApiKey: string;

  constructor(groqApiKey: string, geminiApiKey: string) {
    this.groqApiKey = groqApiKey;
    this.geminiApiKey = geminiApiKey;
  }

  async explainClause(clauseText: string): Promise<LLMResponse> {
    if (!this.groqApiKey && !this.geminiApiKey) {
      return {
        explanation: "API keys not configured. Please add your Groq or Gemini API key in the extension settings.",
        risks: [],
        alternatives: [],
      };
    }

    try {
      if (this.groqApiKey) {
        return await this.callGroq(clauseText);
      }
      return await this.callGemini(clauseText);
    } catch (error) {
      if (this.geminiApiKey && this.groqApiKey) {
        try {
          return await this.callGemini(clauseText);
        } catch (geminiError) {
          throw geminiError;
        }
      }
      throw error;
    }
  }

  async chat(messages: ChatMessage[], context?: string): Promise<string> {
    if (!this.groqApiKey && !this.geminiApiKey) {
      return "API keys not configured. Please add your Groq or Gemini API key in the extension settings.";
    }

    try {
      if (this.groqApiKey) {
        return await this.chatWithGroq(messages, context);
      }
      return await this.chatWithGemini(messages, context);
    } catch (error) {
      if (this.geminiApiKey && this.groqApiKey) {
        try {
          return await this.chatWithGemini(messages, context);
        } catch (geminiError) {
          throw geminiError;
        }
      }
      throw error;
    }
  }

  private async chatWithGroq(messages: ChatMessage[], context?: string): Promise<string> {
    const systemContent = context
      ? `You are a helpful legal assistant that explains legal documents in plain English. Here is the context of the current document being analyzed:\n\n${context}\n\nProvide clear, concise answers. Use markdown formatting where appropriate.`
      : "You are a helpful legal assistant that explains legal documents in plain English. Provide clear, concise answers. Use markdown formatting where appropriate.";

    const formattedMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: formattedMessages,
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async chatWithGemini(messages: ChatMessage[], context?: string): Promise<string> {
    const contextPrefix = context
      ? `Context of the document being analyzed:\n${context}\n\n`
      : "";

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${contextPrefix}You are a helpful legal assistant. Provide clear, concise answers. Use markdown formatting where appropriate.\n\n${conversationText}\n\nAssistant:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callGroq(clauseText: string): Promise<LLMResponse> {
    const prompt = this.buildPrompt(clauseText);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a legal expert that explains clauses in plain English.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return this.parseResponse(data.choices[0].message.content);
  }

  private async callGemini(clauseText: string): Promise<LLMResponse> {
    const prompt = this.buildPrompt(clauseText);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return this.parseResponse(text);
  }

  private buildPrompt(clauseText: string): string {
    return `Explain this legal clause in plain English.

Clause: "${clauseText}"

Provide:
1. A simple explanation (2-3 sentences)
2. Key risks (bullet points)
3. Possible alternatives or what to look for

Format as JSON:
{
  "explanation": "...",
  "risks": ["...", "..."],
  "alternatives": ["...", "..."]
}`;
  }

  private parseResponse(text: string): LLMResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          explanation: parsed.explanation || "No explanation provided",
          risks: parsed.risks || [],
          alternatives: parsed.alternatives || [],
        };
      }
    } catch (error) {
      console.error("Failed to parse LLM response as JSON", error);
    }

    return {
      explanation: text,
      risks: [],
      alternatives: [],
    };
  }
}
