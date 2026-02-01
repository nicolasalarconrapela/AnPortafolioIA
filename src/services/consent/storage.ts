
import { ConsentStoreData, DEFAULT_CONSENT, POLICY_VERSION, ConsentState } from './types';

const STORAGE_KEY = 'anportafolio_consent_v1';

export const loadConsent = (): ConsentStoreData => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) {
      return {
        consent: { ...DEFAULT_CONSENT },
        version: POLICY_VERSION,
        timestamp: new Date().toISOString(),
        hasInteracted: false,
      };
    }

    const parsed: ConsentStoreData = JSON.parse(item);

    // Si la versión de la política cambió, invalidamos el consentimiento anterior
    if (parsed.version !== POLICY_VERSION) {
      return {
        consent: { ...DEFAULT_CONSENT },
        version: POLICY_VERSION,
        timestamp: new Date().toISOString(),
        hasInteracted: false,
      };
    }

    return parsed;
  } catch (e) {
    console.warn('Error reading consent from storage, resetting defaults.', e);
    return {
      consent: { ...DEFAULT_CONSENT },
      version: POLICY_VERSION,
      timestamp: new Date().toISOString(),
      hasInteracted: false,
    };
  }
};

export const saveConsent = (consent: ConsentState, hasInteracted: boolean = true): void => {
  try {
    const data: ConsentStoreData = {
      consent,
      version: POLICY_VERSION,
      timestamp: new Date().toISOString(),
      hasInteracted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save consent preference.', e);
  }
};
