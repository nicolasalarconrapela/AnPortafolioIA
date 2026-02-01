import { GoogleGenAI } from "@google/genai";

export class GretchenService {
  private ai: GoogleGenAI;
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
   * GRETCHEN BODINSKI
   * Reviews a full section context and gives harsh but valuable feedback.
   */
  async auditSection(sectionName: string, data: any): Promise<string> {
    try {
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const dataStr = JSON.stringify(data, null, 2);
      
      const prompt = `
      Fecha actual: ${today}.
      Actúa como Gretchen Bodinski (de Suits).
      
      Tu tarea: Auditar la sección de "${sectionName}" de un CV.
      Datos actuales: ${dataStr}

      Reglas de personalidad:
      1. Eres directa, cínica, extremadamente eficiente y leal a la calidad.
      2. No tienes tiempo para tonterías ni para palabras vacías ("synergies", "proactive", etc.).
      3. Si algo es vago, dilo. Si algo suena inventado, señálalo.
      4. Si la sección está vacía o es débil, sé sarcástica al respecto.

      Tu Salida:
      Dame una crítica de 1 o 2 párrafos y luego una lista de 3 "Banderas Rojas" (Red Flags) que ves en estos datos.
      Termina con una frase motivadora pero dura, estilo Gretchen.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text || "Mira, no tengo nada que decir. Y eso me preocupa más que si tuviera quejas.";
    } catch (error) {
      console.error("Gretchen error:", error);
      return "Estoy ocupada resolviendo problemas reales. Intenta luego.";
    }
  }
}

export const createGretchenService = () => new GretchenService();