import { GoogleGenAI, Chat, Part, Content } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private apiKey: string;
  
  // Constant prompt to ensure consistency between new analysis and resumed sessions
  private readonly INITIAL_PROMPT = "Analiza el CV adjunto siguiendo estrictamente el formato, estructura y reglas definidas en las instrucciones del sistema.";

  constructor() {
    const key = process.env.API_KEY;
    if (!key) {
      throw new Error("API Key not found in environment variables");
    }
    this.apiKey = key;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  private getSystemInstruction(): string {
    return `Analiza el documento proporcionado (CV o perfil profesional) y devuelve SIEMPRE el resultado siguiendo EXACTAMENTE la estructura definida a continuación.

REGLAS OBLIGATORIAS:
- Usa español profesional y claro.
- Respeta el orden y los títulos indicados.
- NO omitas ninguna sección, aunque esté vacía (usa "No especificado").
- No añadas secciones adicionales.
- Sé conciso pero sustancial: información útil, no relleno.
- Cuando menciones una empresa o institución, SIEMPRE intenta inferir su dominio web oficial.
- IMPORTANTE PARA LOGOS: Para mostrar el logo, usa el dominio inferido en este formato de imagen Markdown exacto:
  ![Logo](https://www.google.com/s2/favicons?domain=DOMINIO_EMPRESA&sz=64) **NombreEmpresa**
- No inventes datos: si algo no está claro, indícalo explícitamente.
- No cambies los nombres de los títulos.
- Mantén coherencia temporal teniendo en cuenta que la fecha actual es 30 de Enero de 2026.

FORMATO DE SALIDA (OBLIGATORIO):

## Experiencia
Para cada experiencia:
- Empresa (con logo generado automáticamente)
- Puesto
- Periodo (inicio – fin)
- Ubicación (si aplica)
- Descripción breve del rol
- Logros relevantes (si existen)
- Tecnologías o herramientas utilizadas

## Principales aptitudes
- Lista de entre **3 y 6** aptitudes clave (mezcla equilibrada de hard y soft skills).
- Deben ser específicas y profesionales.

## Skills
### Lenguajes de programación
### IDEs
### Frameworks y librerías
### Herramientas y plataformas

## Educación
Para cada formación:
- Institución (con logo generado automáticamente si es posible)
- Título o certificación
- Periodo
- Detalles relevantes (opcional)

## Proyectos
Para cada proyecto:
- Nombre
- Descripción clara del objetivo
- Tecnologías utilizadas
- Enlace (si existe)

## Reconocimientos
- Premios, menciones, certificaciones destacadas o logros públicos.

## Idiomas
Para cada idioma:
- Idioma
- Nivel (ej: B2, C1, profesional, nativo)

## Hobbies
- Aficiones relevantes o que aporten valor al perfil profesional.

## Fortalezas
- Exactamente **3** fortalezas claras y justificadas.

## Áreas de mejora
- Exactamente **3** áreas de mejora específicas y constructivas.

## Puntuación global
- Nota del **1 al 10**
- Breve justificación objetiva basada en el conjunto del perfil.

IMPORTANTE:
- La respuesta debe ser clara, estructurada y consistente.
- Este formato debe mantenerse idéntico en cada análisis, sin excepciones.`;
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
          systemInstruction: this.getSystemInstruction(),
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
        text: this.INITIAL_PROMPT,
      };

      // Send the initial message to start the conversation context
      const response = await this.chat.sendMessage({
        message: [imagePart, textPart],
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
   * Resumes a chat session from saved state.
   * Reconstructs the history so the model has full context.
   */
  async resumeSession(
    previousAnalysis: string, 
    chatHistory: { role: 'user' | 'model'; text: string }[], 
    base64Image: string, 
    mimeType: string
  ): Promise<void> {
    try {
      // 1. Reconstruct the initial turn (User: Image+Prompt, Model: Analysis)
      const initialUserTurn: Content = {
        role: 'user',
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: this.INITIAL_PROMPT }
        ]
      };

      const initialModelTurn: Content = {
        role: 'model',
        parts: [{ text: previousAnalysis }]
      };

      // 2. Map the subsequent chat history to Content objects
      const subsequentHistory: Content[] = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      // 3. Combine everything into the history array
      const fullHistory: Content[] = [
        initialUserTurn,
        initialModelTurn,
        ...subsequentHistory
      ];

      // 4. Create the chat with the reconstructed history
      this.chat = this.ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: this.getSystemInstruction(),
        },
        history: fullHistory
      });

    } catch (error) {
      console.error("Error resuming session:", error);
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