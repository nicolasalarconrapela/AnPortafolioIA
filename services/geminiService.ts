import { GoogleGenAI, Chat, Part, Content, Type, Schema } from "@google/genai";
import { CVProfile } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private apiKey: string;
  
  constructor() {
    const key = process.env.API_KEY;
    if (!key) {
      throw new Error("API Key not found in environment variables");
    }
    this.apiKey = key;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  /**
   * Defines the JSON schema for the CV extraction
   */
  private getResponseSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Un resumen profesional ejecutivo del candidato." },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              period: { type: Type.STRING },
              description: { type: Type.STRING },
            }
          }
        },
        skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Lista general de habilidades blandas y competencias clave."
        },
        techStack: {
          type: Type.OBJECT,
          properties: {
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            ides: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              technologies: { type: Type.STRING },
              link: { type: Type.STRING },
            }
          }
        },
        volunteering: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING, description: "Organización" },
              role: { type: Type.STRING },
              period: { type: Type.STRING },
              description: { type: Type.STRING },
            }
          }
        },
        awards: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        languages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              level: { type: Type.STRING },
            }
          }
        },
        hobbies: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["experience", "skills", "techStack", "projects", "languages"]
    };
  }

  /**
   * Initializes analysis extracting JSON data
   */
  async analyzeCVJSON(base64Image: string, mimeType: string): Promise<CVProfile> {
    try {
      const prompt = "Actúa como 'Señorita Rotenmeir', una estricta auditora de datos. Extrae TODA la información del CV adjunto y organízala estrictamente en el esquema JSON proporcionado. Si falta información en una sección, déjala como array vacío o string vacío, no inventes.";

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          role: 'user',
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: prompt }
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: this.getResponseSchema(),
        }
      });

      if (!response.text) {
        throw new Error("No response received from Gemini.");
      }

      const json = JSON.parse(response.text);
      return json as CVProfile;
    } catch (error) {
      console.error("Error analyzing CV JSON:", error);
      throw error;
    }
  }

  // Legacy method kept for Chat features if needed, but updated to just return string
  async sendChatMessage(text: string, context?: string): Promise<string> {
      // Simplified chat for Harvis context
      const model = "gemini-3-flash-preview";
      const response = await this.ai.models.generateContent({
          model: model,
          contents: `Contexto del perfil del candidato: ${context || ''}\n\nPregunta del usuario: ${text}`
      });
      return response.text || "";
  }
}

export const createGeminiService = () => new GeminiService();
