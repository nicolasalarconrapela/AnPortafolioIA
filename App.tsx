import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterFlow } from './components/RecruiterFlow';
import { DesignSystemView } from './components/DesignSystemView';
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
    </>
  );
};

export default App;