import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async translate(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    if (!apiKey) {
      console.warn("Gemini API key is missing. Translation will be skipped.");
      return text;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: `Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}:` },
          { text: text }
        ],
        config: {
          systemInstruction: "You are a professional translator. Return ONLY the translated text. Do not include explanations, quotes, or any other text.",
          temperature: 0.1,
        }
      });

      return response.text?.trim() || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  },

  async analyzeNetworkUsage(data: any): Promise<string> {
    if (!apiKey) return "AI analysis unavailable.";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: "Analyze this network usage data and provide a brief, professional summary in Arabic about potential optimizations or security concerns:" },
          { text: JSON.stringify(data) }
        ],
        config: {
          systemInstruction: "You are a network security expert. Provide concise, professional advice in Arabic based on the provided JSON data.",
        }
      });

      return response.text?.trim() || "No analysis available.";
    } catch (error) {
      console.error("Analysis error:", error);
      return "Error analyzing data.";
    }
  }
};
