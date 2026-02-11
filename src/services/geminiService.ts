import { GeminiBase } from "./ai/geminiBase";
import { RotenmeirService } from "./ai/rotenmeir";
import { MaestroService } from "./ai/maestro";
import { GooglitoService } from "./ai/googlito";
import { DonnaService } from "./ai/donna";
import { GretchenService } from "./ai/gretchen";
import { CVProfile } from "../types_brain";

export class GeminiService extends GeminiBase {
  private rotenmeir: RotenmeirService;
  private maestro: MaestroService;
  private googlito: GooglitoService;
  private donna: DonnaService;
  private gretchen: GretchenService;

  constructor() {
    super(); // Initializes this.ai and this.apiKey in Base
    // Pass the already initialized apiKey if we wanted to share, but for now we re-read env or just let them init.
    // Ideally we pass the key.
    const key = this.apiKey;
    this.rotenmeir = new RotenmeirService(key);
    this.maestro = new MaestroService(key);
    this.googlito = new GooglitoService(key);
    this.donna = new DonnaService(key);
    this.gretchen = new GretchenService(key);
  }

  // --- Shared / Utils ---
  // performSearch is inherited from GeminiBase

  /**
   * SEARCH ASSISTANT (Legacy - Kept for Donna compatibility)
   */
  async searchWeb(
    query: string,
  ): Promise<{ text: string; sources: Array<{ title: string; url: string }> }> {
    const results = await this.performSearch(query);
    return {
      text: "Resultados de búsqueda:",
      sources: results,
    };
  }

  // --- Delegations ---

  async analyzeCVJSON(
    base64Image: string,
    mimeType: string,
  ): Promise<CVProfile> {
    return this.rotenmeir.analyzeCVJSON(base64Image, mimeType);
  }

  async analyzeCVText(text: string): Promise<CVProfile> {
    return this.rotenmeir.analyzeCVText(text);
  }

  async askMaestro(
    currentText: string,
    userInstruction: string,
    context: string,
  ): Promise<string> {
    return this.maestro.askMaestro(currentText, userInstruction, context);
  }

  async improveSectionBasedOnCritique(
    sectionName: string,
    currentData: any,
    critique: string,
  ): Promise<any> {
    return this.googlito.improveSectionBasedOnCritique(
      sectionName,
      currentData,
      critique,
    );
  }

  async auditSection(sectionName: string, data: any): Promise<string> {
    return this.gretchen.auditSection(sectionName, data);
  }

  async initDonnaChat(profile: CVProfile): Promise<void> {
    return this.donna.initDonnaChat(profile);
  }

  async talkToDonna(text: string): Promise<string> {
    return this.donna.talkToDonna(text);
  }
  async getSystemStatus(): Promise<
    Record<string, { status: "online" | "offline"; model: string }>
  > {
    const checkService = (service: any) => {
      return service.isActive ? "online" : "offline";
    };

    return {
      "Señorita Rotenmeir": {
        status: checkService(this.rotenmeir),
        model: "gemini-3-pro-preview",
      },
      "El Maestro": {
        status: checkService(this.maestro),
        model: "gemini-3-flash-preview",
      },
      Googlito: {
        status: checkService(this.googlito),
        model: "gemini-3-flash-preview",
      },
      "Gretchen Bodinski": {
        status: checkService(this.gretchen),
        model: "gemini-3-flash-preview",
      },
      Donna: {
        status: checkService(this.donna),
        model: "gemini-3-flash-preview",
      },
    };
  }

  /**
   * Returns true if the core AI service is ready to use.
   */
  public isGlobalActive(): boolean {
    return this.isActive;
  }
}

export const createGeminiService = () => new GeminiService();
