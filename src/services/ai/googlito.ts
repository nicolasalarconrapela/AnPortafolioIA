import { GeminiBase } from "./geminiBase";

export class GooglitoService extends GeminiBase {
  /**
   * GOOGLITO (Fixer based on Gretchen)
   * Applies fixes to data based on critique.
   */
  async improveSectionBasedOnCritique(
    sectionName: string,
    currentData: any,
    critique: string,
  ): Promise<any> {
    try {
      const today = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
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
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (!response.text) return currentData;
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Googlito fix error:", error);
      return currentData;
    }
  }
}
