import { GoogleGenAI } from "@google/genai";

export class GeminiBase {
  protected ai: GoogleGenAI | null = null;
  protected apiKey: string = "";

  constructor(apiKey?: string) {
    const key = apiKey || process.env.API_KEY;
    if (!key) {
      console.warn(
        "API Key not found in environment variables. Gemini features will be disabled.",
      );
    } else {
      this.apiKey = key;
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  protected ensureAI() {
    if (!this.ai) {
      throw new Error(
        "Gemini AI not initialized. Please check your API Key configuration.",
      );
    }
    return this.ai;
  }

  /**
   * PURE SEARCH ENGINE (No AI Summary)
   * Uses the model only to retrieve and format search results as a JSON list.
   */
  async performSearch(
    query: string,
  ): Promise<Array<{ title: string; url: string; snippet: string }>> {
    try {
      const prompt = `
      Actúa como un motor de búsqueda backend.
      Tu única tarea es buscar en Google sobre: "${query}".

      Devuelve SOLO un array JSON con los 5-8 resultados más relevantes.
      NO escribas resúmenes, NO converses. SOLO JSON.

      Formato de salida esperado:
      [
        { "title": "Título de la página", "url": "https://...", "snippet": "Breve descripción..." },
        ...
      ]
      `;

      const response = await this.ensureAI().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      if (!response.text) return [];

      const results = JSON.parse(response.text);
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error("Search API error:", error);
      return [];
    }
  }
}
