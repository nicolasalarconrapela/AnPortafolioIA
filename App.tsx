import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');

  return (
    <>
      <Background />
      
      {view === 'landing' && (
        <LandingView onNavigate={(nextView) => setView(nextView)} />
      )}
      
      {(view === 'login' || view === 'signup') && (
        <AuthView 
            initialState={view} 
            onNavigate={setView} 
        />
      )}

      {view === 'onboarding' && (
        <OnboardingView onComplete={() => setView('landing')} />
      )}
    </>
  );
};

export default App;