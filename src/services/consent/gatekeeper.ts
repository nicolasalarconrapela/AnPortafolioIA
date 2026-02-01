
import { ConsentState } from './types';
import { loggingService } from '../../utils/loggingService';

// Variables de entorno
const GA_ID = process.env.GEMINI_API_KEY ? '' : ((import.meta as any).env.VITE_GA_ID || '');

/**
 * Gatekeeper: Responsable de cargar scripts de terceros y gestionar Google Consent Mode v2.
 */
class Gatekeeper {
  private loadedScripts: Set<string> = new Set();
  private isConsentModeInitialized = false;

  constructor() {
    this.initializeConsentMode();
  }

  // Inicializa el estado por defecto a 'denied' antes de que cargue cualquier script
  private initializeConsentMode() {
    if (this.isConsentModeInitialized) return;

    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    function gtag(){window.dataLayer.push(arguments);}

    // @ts-ignore
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'wait_for_update': 500
    });

    // @ts-ignore
    gtag('js', new Date());

    this.isConsentModeInitialized = true;
  }

  public applyConsent(consent: ConsentState) {
    // 1. Actualizar señales de Consent Mode
    this.updateConsentSignal(consent);

    // 2. Cargar scripts condicionalmente
    if (consent.analytics) {
      this.loadGoogleAnalytics();
    }

    if (consent.marketing) {
      this.loadMarketingScripts();
    }
  }

  private updateConsentSignal(consent: ConsentState) {
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      const status = consent.analytics ? 'granted' : 'denied';
      const marketingStatus = consent.marketing ? 'granted' : 'denied';

      // @ts-ignore
      window.gtag('consent', 'update', {
        'analytics_storage': status,
        'ad_storage': marketingStatus,
        'ad_user_data': marketingStatus,
        'ad_personalization': marketingStatus
      });
    }
  }

  private loadScript(id: string, src: string, onLoad?: () => void) {
    if (this.loadedScripts.has(id) || document.getElementById(id)) {
      return;
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

    // Cargar gtag.js solo si tenemos ID
    this.loadScript('google-analytics', `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, () => {
      // Configuración adicional post-carga si es necesaria
      // @ts-ignore
      window.gtag('config', GA_ID, { 'anonymize_ip': true });
    });
  }

  private loadMarketingScripts() {
    // Ejemplo: Meta Pixel
    loggingService.info('[Gatekeeper] Marketing allowed. Loading Pixel/Ads scripts...');
  }
}

// Extender Window para TS
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const gatekeeper = new Gatekeeper();
