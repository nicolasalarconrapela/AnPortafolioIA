import React, { useState } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { RecruiterFlow } from './components/RecruiterFlow';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {/* Background is hidden on recruiter flow to use specific background/layout */}
      {view !== 'recruiter-flow' && <Background />}
      
      {view === 'landing' && (
        <LandingView onNavigate={(nextView) => {
            // Reset auth when navigating from landing (assuming demo mode for direct access)
            if (nextView === 'recruiter-flow') setIsAuthenticated(false);
            setView(nextView);
        }} />
      )}
      
      {(view === 'auth-candidate' || view === 'auth-recruiter') && (
        <AuthView 
            userType={view === 'auth-recruiter' ? 'recruiter' : 'candidate'}
            onNavigate={(nextView) => {
                // Set authenticated if coming from recruiter login
                if (view === 'auth-recruiter') setIsAuthenticated(true);
                setView(nextView);
            }} 
        />
      )}

      {view === 'candidate-onboarding' && (
        <OnboardingView onComplete={() => setView('landing')} />
      )}

      {view === 'recruiter-flow' && (
        <RecruiterFlow 
          isAuthenticated={isAuthenticated} 
          onExit={() => {
            setView('landing');
            setIsAuthenticated(false);
          }}
        />
      )}
    </>
  );
};

export default App;