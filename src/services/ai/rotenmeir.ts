import { Type, Schema } from "@google/genai";
import { GeminiBase } from "./geminiBase";
import { CVProfile } from "../../types_brain";

export class RotenmeirService extends GeminiBase {
  private getResponseSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        fullName: {
          type: Type.STRING,
          description: "Nombre completo del candidato.",
        },
        summary: {
          type: Type.STRING,
          description: "Un resumen profesional ejecutivo del candidato.",
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              period: { type: Type.STRING },
              description: { type: Type.STRING },
            },
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              title: { type: Type.STRING },
              period: { type: Type.STRING },
            },
          },
        },
        skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Lista general de habilidades blandas y competencias clave.",
        },
        techStack: {
          type: Type.OBJECT,
          properties: {
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            ides: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
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
            },
          },
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
            },
          },
        },
        awards: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        languages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              level: { type: Type.STRING },
            },
          },
        },
        hobbies: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        socials: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              network: {
                type: Type.STRING,
                description: "Nombre de la red (LinkedIn, GitHub, Website...)",
              },
              username: { type: Type.STRING },
              url: { type: Type.STRING },
            },
          },
          description:
            "Enlaces a perfiles sociales y portafolios encontrados en el documento.",
        },
      },
      required: [
        "experience",
        "education",
        "skills",
        "techStack",
        "projects",
        "languages",
      ],
    };
  }

  /**
   * SEÑORITA ROTENMEIR
   * Initializes analysis extracting JSON data strictly.
   */
  async analyzeCVJSON(
    base64Image: string,
    mimeType: string,
  ): Promise<CVProfile> {
    try {
      const today = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const prompt = `Fecha actual: ${today}. Actúa como 'Señorita Rotenmeir', una estricta auditora de datos. Extrae TODA la información del CV adjunto y organízala estrictamente en el esquema JSON proporcionado. Si falta información en una sección, déjala como array vacío o string vacío. PROHIBIDO INVENTAR DATOS que no estén explícitos en el documento.

      IMPORTANTE: En todos los campos de fecha, utiliza el formato de mes abreviado (ej: 'nov' en lugar de 'noviembre', 'ene' en lugar de 'enero').`;

      const response = await this.ensureAI().models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          role: "user",
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: this.getResponseSchema(),
        },
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
      const today = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const prompt = `Fecha actual: ${today}. Actúa como 'Señorita Rotenmeir'. Analiza el siguiente texto estructurado (JSON/Texto) que contiene datos curriculares.

      Tu misión es mapear estos datos al esquema estricto de salida. Si es un JSON genérico, adáptalo.

      REGLAS:
      1. NO INVENTES INFORMACIÓN. Si un campo no existe, déjalo vacío.
      2. En todos los campos de fecha, utiliza meses abreviados (ej: 'nov' en lugar de 'noviembre').

      DATOS DE ENTRADA:
      ${text.substring(0, 50000)}
      `;

      const response = await this.ensureAI().models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: this.getResponseSchema(),
        },
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
}
