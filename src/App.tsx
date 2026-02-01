
import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { CandidateDashboard } from './components/CandidateDashboard';
import { DesignSystemView } from './components/DesignSystemView';
import { PrivacyPolicyView } from './components/legal/PrivacyPolicyView';
import { ViewState } from './types';
import { ConsentProvider, useConsent } from './components/consent/ConsentContext';
import { ConsentUI } from './components/consent/ConsentUI';
import { LogViewer } from './components/debug/LogViewer';
import { env } from './utils/env';

// Extend ViewState locally if needed or assume it's updated in types.ts
// For now, we cast strings if types aren't updated yet to avoid breaking compile
type ExtendedViewState = ViewState | 'privacy-policy';

const AppContent: React.FC = () => {
  // Initialize state based on localStorage for session persistence
  const hasSession = !!localStorage.getItem("anportafolio_user_id");

  // If authenticated, start at dashboard. Otherwise start at landing.
  const [view, setView] = useState<ExtendedViewState>(hasSession ? 'candidate-dashboard' : 'landing');
  const [isAuthenticated, setIsAuthenticated] = useState(hasSession);

  const { openModal } = useConsent();

  // Route Protection Effect
  useEffect(() => {
    const protectedViews: ExtendedViewState[] = ['candidate-dashboard', 'candidate-onboarding', 'design-system'];

    // If trying to access a protected view without authentication
    if (protectedViews.includes(view)) {
      // Double check localStorage in case state is stale but session exists
      const storedSession = localStorage.getItem("anportafolio_user_id");
      if (!isAuthenticated && !storedSession) {
        setView('auth-candidate');
      } else if (!isAuthenticated && storedSession) {
        // Sync state if storage exists
        setIsAuthenticated(true);
      }
    }
  }, [view, isAuthenticated]);

  // Handle navigation from AuthView (Login/Register success)
  const handleAuthNavigation = (nextView: ViewState) => {
    if (nextView === 'candidate-onboarding' || nextView === 'candidate-dashboard') {
      setIsAuthenticated(true);
    }
    setView(nextView);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("anportafolio_user_id");
    setIsAuthenticated(false);
    setView('landing');
  };

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
          onNavigate={handleAuthNavigation}
          initialMode="login"
        />
      )}

      {view === 'auth-candidate-register' && (
        <AuthView
          onNavigate={handleAuthNavigation}
          initialMode="register"
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
          onLogout={handleLogout}
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
      {env.IS_DEV && <LogViewer />}
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
