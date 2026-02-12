import { Chat } from "@google/genai";
import { GeminiBase } from "./geminiBase";
import { CVProfile } from "../../types_brain";

export class DonnaService extends GeminiBase {
  private chat: Chat | null = null;

  /**
   * DONNA (Recruiter Persona - NEUTRAL MODE)
   * Initializes a chat session acting as Donna in her most professional, neutral capacity.
   */
  async initDonnaChat(profile: CVProfile): Promise<void> {
    const today = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      model: "gemini-1.5-flash",
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
