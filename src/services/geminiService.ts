import { GoogleGenAI, Chat, Part, Content, Type, Schema } from "@google/genai";
import { CVProfile } from "../types_brain";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chat: Chat | null = null;
  private apiKey: string = "";
  
  constructor() {
    const key = process.env.API_KEY;
    if (!key) {
      console.warn("API Key not found in environment variables. Gemini features will be disabled.");
    } else {
      this.apiKey = key;
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  private ensureAI() {
    if (!this.ai) {
      throw new Error("Gemini AI not initialized. Please check your API Key configuration.");
    }
    return this.ai;
  }


  /**
   * Defines the JSON schema for the CV extraction
   */
  private getResponseSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING, description: "Nombre completo del candidato." },
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
        },
        socials: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              network: { type: Type.STRING, description: "Nombre de la red (LinkedIn, GitHub, Website...)" },
              username: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          },
          description: "Enlaces a perfiles sociales y portafolios encontrados en el documento."
        }
      },
      required: ["experience", "education", "skills", "techStack", "projects", "languages"]
    };
  }

  /**
   * PURE SEARCH ENGINE (No AI Summary)
   * Uses the model only to retrieve and format search results as a JSON list.
   */
  async performSearch(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
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
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
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

  /**
   * SEARCH ASSISTANT (Legacy - Kept for Donna compatibility)
   */
  async searchWeb(query: string): Promise<{ text: string; sources: Array<{ title: string; url: string }> }> {
    // Redirect to pure search if used in new context, or keep for chat
    const results = await this.performSearch(query);
    return {
        text: "Resultados de búsqueda:",
        sources: results
    };
  }

  /**
   * SEÑORITA ROTENMEIR
   * Initializes analysis extracting JSON data strictly.
   */
  async analyzeCVJSON(base64Image: string, mimeType: string): Promise<CVProfile> {
    try {
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
      const prompt = `Fecha actual: ${today}. Actúa como 'Señorita Rotenmeir', una estricta auditora de datos. Extrae TODA la información del CV adjunto y organízala estrictamente en el esquema JSON proporcionado. Si falta información en una sección, déjala como array vacío o string vacío. PROHIBIDO INVENTAR DATOS que no estén explícitos en el documento.
      
      IMPORTANTE: En todos los campos de fecha, utiliza el formato de mes abreviado (ej: 'nov' en lugar de 'noviembre', 'ene' en lugar de 'enero').`;

      const response = await this.ensureAI().models.generateContent({
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
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
      const prompt = `Fecha actual: ${today}. Actúa como 'Señorita Rotenmeir'. Analiza el siguiente texto estructurado (JSON/Texto) que contiene datos curriculares. 
      
      Tu misión es mapear estos datos al esquema estricto de salida. Si es un JSON genérico, adáptalo.
      
      REGLAS:
      1. NO INVENTES INFORMACIÓN. Si un campo no existe, déjalo vacío.
      2. En todos los campos de fecha, utiliza meses abreviados (ej: 'nov' en lugar de 'noviembre').
      
      DATOS DE ENTRADA:
      ${text.substring(0, 50000)}
      `;

      const response = await this.ensureAI().models.generateContent({
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
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
      const prompt = `Fecha actual: ${today}. Actúa como Janice, una asistente de carrera amigable.
      
      Contexto: Estamos editando la sección de "${context}".
      Texto actual: "${currentText}"
      Instrucción del usuario: "${userInstruction}"
      
      REGLAS CRÍTICAS DE EDICIÓN:
      1. Mejora la redacción para que suene profesional.
      2. Formato de fechas: Usa meses abreviados ('nov', 'ene', etc.) si aparecen fechas.
      3. MANTÉN LA VERACIDAD: No inventes números, tecnologías o logros que no estén en el "Texto actual".
      4. Si el texto actual es muy escaso y el usuario pide mejorarlo, NO inventes los detalles. En su lugar, escribe una estructura profesional y usa corchetes para decirle al usuario qué debe rellenar.
         Ejemplo: "Lideré el desarrollo de [INSERTAR PROYECTO] utilizando [TECNOLOGÍAS], logrando [INSERTAR MÉTRICA DE ÉXITO]."
      
      Devuelve SOLO el texto mejorado.`;

      const response = await this.ensureAI().models.generateContent({
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
        const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
        const dataStr = JSON.stringify(currentData, null, 2);
        const prompt = `
        Fecha actual: ${today}.
        Eres el 'Googlito' encargado de la sección "${sectionName}".
        
        SITUACIÓN:
        Gretchen Bodinski ha auditado estos datos y ha encontrado fallos.
        
        CRÍTICA DE GRETCHEN:
        "${critique}"
        
        DATOS ACTUALES:
        ${dataStr}
        
        TU MISIÓN (REGLAS DE SEGURIDAD DE DATOS):
        1. Tu trabajo es reestructurar y pulir, PERO TIENES ESTRICTAMENTE PROHIBIDO INVENTAR DATOS REALES.
        2. No inventes nombres de empresas, fechas, tecnologías específicas o métricas numéricas que no estén en "DATOS ACTUALES".
        3. En campos de fechas, usa SIEMPRE formato abreviado (ej: 'nov' en lugar de 'noviembre').
        4. Si Gretchen se queja de que falta información (ej: "Falta el stack tecnológico" o "Falta enlace al proyecto"), NO TE LO INVENTES.
        5. En su lugar, modifica el campo de texto añadiendo un PLACEHOLDER claro y en mayúsculas entre corchetes para que el usuario sepa que debe rellenarlo.
           
           Ejemplos de Placeholders permitidos:
           - "[ACCIÓN REQUERIDA: Listar lenguajes de programación usados]"
           - "[FALTA: Enlace al repositorio]"
           - "[COMPLETAR: Añadir métricas de impacto en %]"
        
        5. Devuelve el JSON con la misma estructura, pero con los textos mejorados y los placeholders insertados donde falte información.
        `;

        const response = await this.ensureAI().models.generateContent({
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
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    const profileContext = JSON.stringify(profile, null, 2);
    
    const systemInstruction = `Fecha actual: ${today}. Eres Donna. Estás presentando a un candidato a un potencial empleador o cliente.
    
    Tus reglas para esta sesión:
    1. Tono: PROFESIONAL, NEUTRAL, OBJETIVO y CLARO.
    2. Base de conocimiento: Todo lo que sabes está en este JSON: ${profileContext}.
    3. Objetivo: Responder preguntas sobre el candidato de manera informativa y precisa.
    4. NO ALUCINES: Si te preguntan algo que NO está en el perfil, di cortesmente que esa información no está disponible en el expediente actual. No intentes adivinar.
    5. Sé concisa. Usa formato Markdown para listas si es necesario.
    
    Tu misión es exponer la información del candidato de la forma más limpia posible.`;

    this.chat = this.ensureAI().chats.create({
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