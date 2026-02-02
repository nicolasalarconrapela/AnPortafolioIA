import { GoogleGenAI } from "@google/genai";

export class GretchenService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string = "";
  
  constructor() {
    const key = process.env.API_KEY;
    if (!key) {
       console.warn("API Key not found for Gretchen. Services disabled.");
    } else {
      this.apiKey = key;
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  private ensureAI() {
      if (!this.ai) {
          throw new Error("Gretchen Service not initialized. Missing API Key.");
      }
      return this.ai;
  }


  /**
   * GRETCHEN BODINSKI
   * Reviews a full section context and gives harsh but valuable feedback.
   */
  async auditSection(sectionName: string, data: any): Promise<string> {
    try {
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
      const dataStr = JSON.stringify(data, null, 2);
      
      const prompt = `
      Fecha actual: ${today}.
      Actúa como Gretchen Bodinski (de Suits).
      
      Tu tarea: Auditar la sección de "${sectionName}" de un CV.
      Datos actuales: ${dataStr}

      Reglas de personalidad y auditoría:
      1. Eres directa, cínica, extremadamente eficiente.
      2. BASATE SOLO EN LA EVIDENCIA: No asumas cosas que no están escritas.
      3. Si un campo está vacío o es muy breve, esa es tu queja principal. "No me has dicho qué hiciste aquí".
      4. Detecta inconsistencias derivadas de los datos. Ejemplo: Si dice que trabajó 4 años en Google pero la descripción tiene 5 palabras, quéjate de la falta de detalle. Si el rol es "Senior Java Dev" pero no menciona Java en la descripción, señálalo.
      5. NO inventes que el usuario hizo X o Y si no está escrito. Tu trabajo es señalar lo que FALTA, no inventar lo que debería estar.
      6. Exige pruebas: Si hay voluntariado sin empresa o proyectos sin enlaces, pídelos.

      Tu Salida:
      Dame una crítica de 1 o 2 párrafos y luego una lista de 3 "Banderas Rojas" (Red Flags) basada estrictamente en los datos (o la falta de ellos).
      Termina con una frase motivadora pero dura, estilo Gretchen.
      `;

      const response = await this.ensureAI().models.generateContent({
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