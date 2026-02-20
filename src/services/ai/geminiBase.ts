import { GoogleGenAI } from "@google/genai";
import { env } from "../../utils/env";

export class GeminiBase {
  protected ai: GoogleGenAI | null = null;
  protected apiKey: string = "";
  public readonly isActive: boolean = false;

  private static hasloggedWarning = false;

  constructor(apiKey?: string) {
    // Priority: Explicit key → centralized env (handles localStorage, VITE_, process.env)
    const key = apiKey || env.GEMINI_API_KEY;

    // console.debug("🔄 GeminiBase: Checking for API Key...");

    if (!key) {
      if (!GeminiBase.hasloggedWarning) {
        console.warn(
          "⚠️ GeminiBase: API Key not found. AI features will be unavailable. " +
            "Ensure API_KEY (node) or VITE_GEMINI_API_KEY (vite) is set.",
        );
        GeminiBase.hasloggedWarning = true;
      }
      this.isActive = false;
    } else {
      this.apiKey = key;
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        this.isActive = true;
        if (!GeminiBase.hasloggedWarning) {
          console.info("✅ GeminiBase: AI Service initialized successfully.");
          GeminiBase.hasloggedWarning = true;
        }
      } catch (e) {
        console.error(
          "❌ GeminiBase: Failed to initialize GoogleGenAI with provided key.",
          e,
        );
        this.isActive = false;
      }
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
        model: "gemini-1.5-flash",
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
