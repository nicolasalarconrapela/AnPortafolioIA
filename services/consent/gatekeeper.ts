
import { ConsentState } from './types';

// Variables de entorno (asegúrate de definirlas en tu .env o usar fallbacks seguros)
const GA_ID = process.env.GEMINI_API_KEY ? '' : ((import.meta as any).env.VITE_GA_ID || ''); 
// NOTA: Usando VITE_GA_ID como ejemplo. Si no tienes ID real, el gatekeeper simplemente no inyectará nada.

/**
 * Gatekeeper: Responsable de cargar scripts de terceros.
 * Implementa idempotencia (no carga el script dos veces).
 */
class Gatekeeper {
  private loadedScripts: Set<string> = new Set();

  public applyConsent(consent: ConsentState) {
    if (consent.analytics) {
      this.loadGoogleAnalytics();
    }
    
    if (consent.marketing) {
      this.loadMarketingScripts();
    }

    // Si el usuario retira consentimiento, idealmente recargaríamos la página o limpiaríamos cookies.
    // Para una SPA simple, dejar de enviar eventos suele ser suficiente, 
    // pero los scripts ya cargados en memoria persisten hasta el refresh.
  }

  private loadScript(id: string, src: string, onLoad?: () => void) {
    if (this.loadedScripts.has(id) || document.getElementById(id)) {
      return; // Ya cargado
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      this.loadedScripts.add(id);
      if (onLoad) onLoad();
    };
    document.head.appendChild(script);
  }

  private loadGoogleAnalytics() {
    if (!GA_ID) return;

    // 1. Cargar la librería gtag.js
    this.loadScript('google-analytics', `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, () => {
      // 2. Inicializar datalayer
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) { window.dataLayer.push(args); }
      gtag('js', new Date());
      gtag('config', GA_ID, { 'anonymize_ip': true });
    });
  }

  private loadMarketingScripts() {
    // Ejemplo: Meta Pixel, LinkedIn Insight Tag, Hotjar
    // this.loadScript('meta-pixel', '...');
    console.log('[Gatekeeper] Marketing consent granted. Scripts would load here.');
  }
}

// Extender Window para TS
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const gatekeeper = new Gatekeeper();
