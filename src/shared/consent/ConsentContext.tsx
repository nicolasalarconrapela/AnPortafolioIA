import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConsentContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  consent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  savePreferences: (prefs: Partial<ConsentContextType['consent']>) => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('cookie-consent');
    if (!saved) {
      setIsModalOpen(true);
    } else {
      setConsent(JSON.parse(saved));
    }
  }, []);

  const savePreferences = (prefs: Partial<ConsentContextType['consent']>) => {
    const newConsent = { ...consent, ...prefs };
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setIsModalOpen(false);
  };

  return (
    <ConsentContext.Provider
      value={{
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        consent,
        savePreferences,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
}
