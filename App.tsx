
import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterFlow } from './components/RecruiterFlow';
import { DesignSystemView } from './components/DesignSystemView';
import { PrivacyPolicyView } from './components/legal/PrivacyPolicyView'; // Nueva vista importada
import { ViewState } from './types';
import { ConsentProvider, useConsent } from './components/consent/ConsentContext';
import { ConsentUI } from './components/consent/ConsentUI';

// Extend ViewState locally if needed or assume it's updated in types.ts
// For now, we cast strings if types aren't updated yet to avoid breaking compile
type ExtendedViewState = ViewState | 'privacy-policy';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ExtendedViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { openModal } = useConsent();

  return (
    <>
      <Background />
      <ConsentUI />
      
      {view === 'landing' && (
        <LandingView onNavigate={(nextView) => setView(nextView)} />
      )}
      
      {view === 'design-system' && (
        <DesignSystemView onBack={() => setView('landing')} />
      )}

      {view === 'privacy-policy' && (
        <PrivacyPolicyView onBack={() => setView('landing')} />
      )}
      
      {view === 'auth-candidate' && (
        <AuthView 
            onNavigate={(nextView) => setView(nextView)}
            userType="candidate"
        />
      )}

      {view === 'auth-recruiter' && (
        <AuthView 
            onNavigate={(nextView) => setView(nextView)}
            userType="recruiter"
        />
      )}

      {view === 'candidate-onboarding' && (
        <OnboardingView 
            onComplete={() => setView('candidate-dashboard')} 
            onExit={() => setView('landing')}
        />
      )}

      {view === 'candidate-dashboard' && (
        <CandidateDashboard 
            onLogout={() => {
                setIsAuthenticated(false);
                setView('landing');
            }}
        />
      )}

      {view === 'recruiter-flow' && (
          <RecruiterFlow 
            isAuthenticated={true}
            onExit={() => setView('landing')}
          />
      )}

      {/* Footer Links (Privacy & Settings) */}
      <div className="fixed bottom-2 right-2 z-40 flex gap-2">
        <button 
            onClick={() => setView('privacy-policy')}
            className="text-[10px] text-outline/50 hover:text-primary bg-[var(--md-sys-color-background)]/80 px-2 py-1 rounded backdrop-blur-sm transition-colors"
        >
            Privacy Policy
        </button>
        <button 
            onClick={openModal}
            className="text-[10px] text-outline/50 hover:text-primary bg-[var(--md-sys-color-background)]/80 px-2 py-1 rounded backdrop-blur-sm transition-colors"
        >
            Cookie Settings
        </button>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ConsentProvider>
      <AppContent />
    </ConsentProvider>
  );
};

export default App;
