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
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              title: { type: Type.STRING },
              period: { type: Type.STRING },
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
      required: ["experience", "education", "skills", "techStack", "projects", "languages"]
    };
  }

  /**
   * SEÑORITA ROTENMEIR
   * Initializes analysis extracting JSON data strictly.
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

  /**
   * SEÑORITA ROTENMEIR (Text/JSON Mode)
   * Analyzes raw text or generic JSON and extracts CVProfile.
   */
  async analyzeCVText(text: string): Promise<CVProfile> {
    try {
      const prompt = `Actúa como 'Señorita Rotenmeir'. Analiza el siguiente texto estructurado (JSON/Texto) que contiene datos curriculares. 
      
      Tu misión es mapear estos datos al esquema estricto de salida. Si es un JSON genérico, adáptalo.
      
      DATOS DE ENTRADA:
      ${text.substring(0, 50000)}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
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
      console.error("Error analyzing CV Text:", error);
      throw error;
    }
  }

  /**
   * JANICE (Assistant)
   * Helps user improve specific text fields during the Wizard flow.
   */
  async askJanice(currentText: string, userInstruction: string, context: string): Promise<string> {
    try {
      const prompt = `Actúa como Janice, una asistente de carrera amigable, servicial y experta en redacción de CVs.
      
      Contexto: Estamos editando la sección de "${context}".
      Texto actual: "${currentText}"
      Instrucción del usuario: "${userInstruction}"
      
      Tu tarea: Reescribe el texto para mejorarlo profesionalmente, haciéndolo más impactante y claro, pero manteniendo la veracidad. Devuelve SOLO el texto mejorado, sin introducciones ni comillas.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text || currentText;
    } catch (error) {
      console.error("Janice error:", error);
      return currentText;
    }
  }

  /**
   * GOOGLITO (Fixer based on Gretchen)
   * Applies fixes to data based on critique.
   */
  async improveSectionBasedOnCritique(sectionName: string, currentData: any, critique: string): Promise<any> {
    try {
        const dataStr = JSON.stringify(currentData, null, 2);
        const prompt = `
        Eres el 'Googlito' encargado de la sección "${sectionName}".
        
        SITUACIÓN:
        Gretchen Bodinski ha realizado una auditoría brutal de nuestros datos.
        
        CRÍTICA DE GRETCHEN:
        "${critique}"
        
        DATOS ACTUALES:
        ${dataStr}
        
        TU MISIÓN:
        Reescribe y mejora los DATOS ACTUALES para satisfacer las demandas de Gretchen.
        1. Corrige los puntos débiles mencionados.
        2. Mantén la estructura JSON exacta de los datos originales.
        3. Haz que suene profesional, directo y orientado a logros.
        
        IMPORTANTE: Devuelve SOLO el JSON corregido, nada más.
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        if (!response.text) return currentData;
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Googlito fix error:", error);
        return currentData;
    }
  }

  /**
   * DONNA (Recruiter Persona - NEUTRAL MODE)
   * Initializes a chat session acting as Donna in her most professional, neutral capacity.
   */
  async initDonnaChat(profile: CVProfile): Promise<void> {
    const profileContext = JSON.stringify(profile, null, 2);
    
    const systemInstruction = `Eres Donna. Estás presentando a un candidato a un potencial empleador o cliente.
    
    Tus reglas para esta sesión:
    1. Tono: PROFESIONAL, NEUTRAL, OBJETIVO y CLARO. Ya no estás en modo "Suits" arrogante. Ahora eres una presentadora eficiente de hechos.
    2. Base de conocimiento: Todo lo que sabes está en este JSON: ${profileContext}.
    3. Objetivo: Responder preguntas sobre el candidato de manera informativa y precisa.
    4. Si te preguntan algo que NO está en el perfil, di cortesmente que esa información no está disponible en el expediente actual.
    5. Sé concisa. Usa formato Markdown para listas si es necesario.
    
    Tu misión es exponer la información del candidato de la forma más limpia posible.`;

    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }

  /**
   * Sends a message to Donna
   */
  async talkToDonna(text: string): Promise<string> {
    if (!this.chat) {
      throw new Error("Donna is not at her desk (Chat not initialized)");
    }
    const response = await this.chat.sendMessage({ message: text });
    return response.text || "Información no disponible.";
  }
}

export const createGeminiService = () => new GeminiService();