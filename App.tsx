import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { RecruiterFlow } from './components/RecruiterFlow';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');

  return (
    <>
      {/* Background is hidden on recruiter flow to use specific background/layout */}
      {view !== 'recruiter-flow' && <Background />}
      
      {view === 'landing' && (
        <LandingView onNavigate={(nextView) => setView(nextView)} />
      )}
      
      {(view === 'auth-candidate' || view === 'auth-recruiter') && (
        <AuthView 
            userType={view === 'auth-recruiter' ? 'recruiter' : 'candidate'}
            onNavigate={setView} 
        />
      )}

      {view === 'candidate-onboarding' && (
        <OnboardingView onComplete={() => setView('landing')} />
      )}

      {view === 'recruiter-flow' && (
        <RecruiterFlow />
      )}
    </>
  );
};

export default App;