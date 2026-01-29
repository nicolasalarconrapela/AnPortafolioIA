import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { CandidateDashboard } from './components/CandidateDashboard';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <Background />
      
      {view === 'landing' && (
        <LandingView onNavigate={(nextView) => setView(nextView)} />
      )}
      
      {view === 'auth-candidate' && (
        <AuthView 
            onNavigate={(nextView) => setView(nextView)} 
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
    </>
  );
};

export default App;