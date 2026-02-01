
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConsentState, DEFAULT_CONSENT } from '../../services/consent/types';
import { loadConsent, saveConsent } from '../../services/consent/storage';
import { gatekeeper } from '../../services/consent/gatekeeper';

interface ConsentContextType {
  consent: ConsentState;
  hasInteracted: boolean;
  updateConsent: (newConsent: ConsentState) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Cargar estado inicial al montar
  useEffect(() => {
    const loaded = loadConsent();
    setConsent(loaded.consent);
    setHasInteracted(loaded.hasInteracted);
    
    // Si ya había interactuado (ej. recarga de página), aplicar scripts inmediatamente
    if (loaded.hasInteracted) {
        gatekeeper.applyConsent(loaded.consent);
    }
  }, []);

  // 2. Función genérica de actualización
  const updateConsent = (newConsent: ConsentState) => {
    const finalConsent = { ...newConsent, necessary: true }; // Asegurar necessary siempre true
    setConsent(finalConsent);
    setHasInteracted(true);
    saveConsent(finalConsent, true);
    
    // Trigger Gatekeeper
    gatekeeper.applyConsent(finalConsent);
  };

  const acceptAll = () => {
    updateConsent({ necessary: true, analytics: true, marketing: true });
    setIsModalOpen(false);
  };

  const rejectAll = () => {
    updateConsent({ necessary: true, analytics: false, marketing: false });
    setIsModalOpen(false);
  };

  return (
    <ConsentContext.Provider value={{
      consent,
      hasInteracted,
      updateConsent,
      acceptAll,
      rejectAll,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      isModalOpen
    }}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used within a ConsentProvider');
  return context;
};
