import { LLMResponse } from "../types";

export class LLMService {
  private groqApiKey: string;
  private geminiApiKey: string;

  constructor(groqApiKey: string, geminiApiKey: string) {
    this.groqApiKey = groqApiKey;
    this.geminiApiKey = geminiApiKey;
  }

  async explainClause(clauseText: string): Promise<LLMResponse> {
    try {
      return await this.callGroq(clauseText);
    } catch (error) {
      console.warn("Groq failed, falling back to Gemini", error);
      return await this.callGemini(clauseText);
    }
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
        model: "llama-3.1-8b",
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
      throw new Error(`Groq API error: ${response.status}`);
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
