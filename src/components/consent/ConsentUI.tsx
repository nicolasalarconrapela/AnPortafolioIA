
import React, { useState, useEffect } from 'react';
import { useConsent } from './ConsentContext';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export const ConsentUI: React.FC = () => {
  const { hasInteracted, isModalOpen, openModal } = useConsent();

  // Si ya interactuó y no pidió abrir el modal, no mostrar nada
  if (hasInteracted && !isModalOpen) return null;

  return (
    <>
      {!hasInteracted && !isModalOpen && <ConsentBanner onConfigure={openModal} />}
      {isModalOpen && <ConsentModal />}
    </>
  );
};

const ConsentBanner: React.FC<{ onConfigure: () => void }> = ({ onConfigure }) => {
  const { acceptAll, rejectAll } = useConsent();

  return (
    <div 
        role="region" 
        aria-label="Cookie Consent Banner"
        className="fixed bottom-0 left-0 right-0 z-[60] bg-[var(--md-sys-color-background)] border-t border-outline-variant p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-fade-in-up"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="cookie" className="text-primary" />
            <h3 className="font-display font-medium text-lg text-[var(--md-sys-color-on-background)]">
              We value your privacy
            </h3>
          </div>
          <p className="text-sm text-outline max-w-2xl leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button variant="outlined" onClick={onConfigure} className="flex-1 md:flex-none justify-center">
            Customize
          </Button>
          <Button variant="outlined" onClick={rejectAll} className="flex-1 md:flex-none justify-center">
            Reject All
          </Button>
          <Button variant="filled" onClick={acceptAll} className="flex-1 md:flex-none justify-center">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

const ConsentModal: React.FC = () => {
  const { consent, updateConsent, closeModal, acceptAll, rejectAll } = useConsent();
  const [tempConsent, setTempConsent] = useState(consent);

  // Focus trap simple
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  const handleToggle = (category: keyof typeof tempConsent) => {
    if (category === 'necessary') return; // Immutable
    setTempConsent(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = () => {
    updateConsent(tempConsent);
    closeModal();
  };

  return (
    <div 
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-modal-title"
    >
      <div className="bg-[var(--md-sys-color-background)] w-full max-w-2xl rounded-[28px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h2 id="consent-modal-title" className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)]">
                Cookie Preferences
            </h2>
            <button onClick={closeModal} className="p-2 text-outline hover:text-primary rounded-full transition-colors" aria-label="Close">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <p className="text-sm text-outline">
                Manage your consent preferences for cookies and similar technologies. 
                "Necessary" cookies are required for the website to function and cannot be disabled.
            </p>

            <div className="space-y-4">
                <ToggleItem 
                    title="Necessary" 
                    description="Essential for authentication, security, and basic functionality."
                    checked={true}
                    disabled={true}
                    onChange={() => {}}
                />
                <ToggleItem 
                    title="Analytics" 
                    description="Helps us understand how you interact with the website so we can improve it (e.g., Google Analytics)."
                    checked={tempConsent.analytics}
                    onChange={() => handleToggle('analytics')}
                />
                <ToggleItem 
                    title="Marketing" 
                    description="Used to display ads relevant to your interests (e.g., Meta Pixel)."
                    checked={tempConsent.marketing}
                    onChange={() => handleToggle('marketing')}
                />
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-variant/30 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
                <Button variant="text" onClick={acceptAll}>Accept All</Button>
                <Button variant="text" onClick={rejectAll}>Reject All</Button>
            </div>
            <Button variant="filled" onClick={handleSave}>
                Save Preferences
            </Button>
        </div>
      </div>
    </div>
  );
};

const ToggleItem: React.FC<{
    title: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
}> = ({ title, description, checked, disabled, onChange }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
        <div className="flex-1">
            <h4 className="font-bold text-[var(--md-sys-color-on-background)]">{title}</h4>
            <p className="text-xs text-outline mt-1 leading-relaxed">{description}</p>
        </div>
        <button 
            role="switch"
            aria-checked={checked}
            aria-label={`Toggle ${title}`}
            disabled={disabled}
            onClick={onChange}
            className={`
                relative w-12 h-6 rounded-full transition-colors shrink-0 mt-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
                ${checked ? 'bg-primary' : 'bg-outline-variant'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <span className={`
                absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200
                ${checked ? 'translate-x-6' : 'translate-x-0'}
            `} />
        </button>
    </div>
);
