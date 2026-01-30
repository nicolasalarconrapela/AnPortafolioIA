
import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterFlow } from './components/RecruiterFlow';
import { DesignSystemView } from './components/DesignSystemView';
import { ViewState } from './types';
import { ConsentProvider, useConsent } from './components/consent/ConsentContext';
import { ConsentUI } from './components/consent/ConsentUI';

// Wrapper component to access context for the footer link
const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
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

      {/* Persistent Privacy Link (Bottom Right or Footer) */}
      <button 
        onClick={openModal}
        className="fixed bottom-2 right-2 z-40 text-[10px] text-outline/50 hover:text-primary bg-[var(--md-sys-color-background)]/80 px-2 py-1 rounded backdrop-blur-sm transition-colors"
      >
        Privacy Settings
      </button>
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
