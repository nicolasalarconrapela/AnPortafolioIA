import { GoogleGenAI, Chat, Part } from "@google/genai";

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
   * Initializes a chat session and analyzes the provided CV image.
   * This sets the context for the entire chat session.
   */
  async analyzeCV(base64Image: string, mimeType: string): Promise<string> {
    try {
      // Initialize a new chat session
      this.chat = this.ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `Eres un experto consultor de recursos humanos y redactor de CVs profesional. 
          Tu objetivo es ayudar al usuario a mejorar su currículum, identificar fortalezas y debilidades, 
          y prepararse para entrevistas. Sé constructivo, detallado y profesional. 
          
          IMPORTANTE: Hoy es 30 de Enero de 2026. Ten en cuenta esta fecha para calcular años de experiencia, antigüedad y relevancia de la información.

          FORMATO VISUAL:
          1. Usa formato Markdown para estructurar tus respuestas (títulos, listas, negritas).
          2. Cuando menciones una empresa extraída del CV (en el análisis o chat), SIEMPRE intenta mostrar su logo junto al nombre.
          3. Para mostrar el logo, infiere el dominio web de la empresa (ej: 'google.com', 'bbva.es') y usa este formato de imagen Markdown exacto:
             ![Logo](https://www.google.com/s2/favicons?domain=DOMINIO_EMPRESA&sz=64) **NombreEmpresa**
             
          Ejemplo:
          - Experiencia en ![Logo](https://www.google.com/s2/favicons?domain=microsoft.com&sz=64) **Microsoft** como desarrollador.
          `,
        },
      });

      // Construct the first message with the image and the analysis prompt
      const imagePart: Part = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      };

      const textPart: Part = {
        text: "Por favor, analiza este CV en detalle. Extrae las habilidades principales, experiencia clave (con sus logos), y dame 3 fortalezas y 3 áreas de mejora específicas. Al final, dame una puntuación del 1 al 10 con una breve justificación.",
      };

      // Send the initial message to start the conversation context
      const response = await this.chat.sendMessage({
        message: {
          role: 'user',
          parts: [imagePart, textPart],
        },
      });

      if (!response.text) {
        throw new Error("No response received from Gemini.");
      }

      return response.text;
    } catch (error) {
      console.error("Error analyzing CV:", error);
      throw error;
    }
  }

  /**
   * Sends a follow-up text message to the existing chat session.
   */
  async sendChatMessage(text: string): Promise<string> {
    if (!this.chat) {
      throw new Error("Chat session not initialized. Please upload a CV first.");
    }

    try {
      const response = await this.chat.sendMessage({
        message: text,
      });

      if (!response.text) {
        throw new Error("No response received from Gemini.");
      }

      return response.text;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  }
}

// Singleton-like export for simplicity in this scope, 
// though re-instantiation in App ensures clean state per session.
export const createGeminiService = () => new GeminiService();