import { GeminiBase } from "./geminiBase";

export class JaniceService extends GeminiBase {
  /**
   * JANICE (Assistant)
   * Helps user improve specific text fields during the Wizard flow.
   */
  async askJanice(
    currentText: string,
    userInstruction: string,
    context: string,
  ): Promise<string> {
    try {
      const today = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
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
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text || currentText;
    } catch (error) {
      console.error("Janice error:", error);
      return currentText;
    }
  }
}
