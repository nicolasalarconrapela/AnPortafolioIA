
export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentStoreData {
  consent: ConsentState;
  version: number;
  timestamp: string;
  hasInteracted: boolean; // True si el usuario ya tomó una decisión (aceptar/rechazar/configurar)
}

// Incrementa esto para forzar que el banner aparezca de nuevo (ej. cambio legal importante)
export const POLICY_VERSION = 1;

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true, // Siempre true
  analytics: false, // Default GDPR: false
  marketing: false, // Default GDPR: false
};
