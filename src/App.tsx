
import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { CandidateDashboard } from './components/CandidateDashboard';
import { DesignSystemView } from './components/DesignSystemView';
import { PrivacyPolicyView } from './components/legal/PrivacyPolicyView';
import BrainRoot from './components/brain/BrainRoot';
import { ViewState, UserProfile } from './types';
import { ConsentProvider, useConsent } from './components/consent/ConsentContext';
import { ConsentUI } from './components/consent/ConsentUI';
import { LogViewer } from './components/debug/LogViewer';
import { env } from './utils/env';
import { loggingService } from './utils/loggingService';
import { getWorkspaceByUserFromFirestore, getPublicProfile } from './services/firestoreWorkspaces';
import { authService } from './services/authService';


// Extend ViewState locally if needed or assume it's updated in types.ts
// For now, we cast strings if types aren't updated yet to avoid breaking compile
type ExtendedViewState = ViewState | 'privacy-policy';

const AppContent: React.FC = () => {
  // Session State (No LocalStorage)
  const [view, setView] = useState<ExtendedViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);

  const { openModal } = useConsent();

  // Route Protection Effect
  useEffect(() => {
    const protectedViews: ExtendedViewState[] = ['candidate-dashboard', 'candidate-onboarding', 'design-system', 'cv-analysis'];

    // If trying to access a protected view without authentication
    if (protectedViews.includes(view)) {
      if (!isSessionChecking && !isAuthenticated) {
        setView('auth-candidate');
      }
    }
  }, [view, isAuthenticated, isSessionChecking]);

  // Session Restoration Effect: Verify Session & Check Onboarding & Check URL Params
  useEffect(() => {
    const verifyAndRestore = async () => {
      setIsSessionChecking(true);
      try {
        // 0. Check for URL Params (Public Profile View)
        const params = new URLSearchParams(window.location.search);
        // "token" or "share" param used for secure public profile access
        const publicToken = params.get('token') || params.get('share');

        if (publicToken) {
          const publicProfileData = await getPublicProfile(publicToken);
          if (publicProfileData && publicProfileData.profile) {
            setUserProfile(publicProfileData.profile);
            // We don't set CurrentUserId/IsAuthenticated, so we are in "Public View Mode"
            setIsSessionChecking(false);
            return;
          }
        }

        // 1. Verify Backend Session (HttpOnly Cookie)
        const user = await authService.verifySession();

        if (user && user.uid) {
          setCurrentUserId(user.uid);
          setIsAuthenticated(true);

          // 2. Fetch User Profile & Workspace
          try {
            const ws = await getWorkspaceByUserFromFirestore(user.uid);
            if (ws && ws.profile) {
              setUserProfile(ws.profile);
            }

            // 3. Logic to decide if we stay on landing or go to dashboard
            // Only if we are currently on AUTH page do we Auto-Redirect.
            // We ALLOW staying on 'landing' to show the user profile there.
            if (view.startsWith('auth-')) {
              if (!ws || !ws.profile || !ws.profile.onboardingCompleted) {
                setView('candidate-onboarding');
              } else {
                setView('candidate-dashboard');
              }
            }
          } catch (e) {
            console.warn("Workspace fetch failed", e);
            // Fallback to dashboard if workspace fetch fails but auth is good
            if (view.startsWith('auth-')) {
              setView('candidate-dashboard');
            }
          }
        }
      } catch (e) {
        console.warn("Session verification failed or no session.", e);
        setIsAuthenticated(false);
        setCurrentUserId("");
        setUserProfile(null);
        // If we were on a protected route, route protection effect will kick in
      } finally {
        setIsSessionChecking(false);
      }
    };

    verifyAndRestore();
  }, []); // Run once on mount

  // Handle Log In Success
  const handleLoginSuccess = async (user: any) => {
    setCurrentUserId(user.uid);
    setIsAuthenticated(true);
    // Try to fetch profile aggressively
    try {
      const ws = await getWorkspaceByUserFromFirestore(user.uid);
      if (ws && ws.profile) {
        setUserProfile(ws.profile);
      }
    } catch (e) {
      console.error("Failed to fetch profile on login success", e);
    }
  };

  // Handle navigation from AuthView
  const handleAuthNavigation = (nextView: ViewState) => {
    setView(nextView);
  };

  // Handle Logout
  const handleLogout = async () => {
    // Call backend logout if needed, for now just clear state
    // Ideally await authService.logout();
    setCurrentUserId("");
    setIsAuthenticated(false);
    setUserProfile(null);
    setView('landing');
  };

  if (isSessionChecking) {
    // Simple Loading State
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <>
      <Background />
      <ConsentUI />

      {view === 'landing' && (
        <LandingView
          onNavigate={(nextView) => setView(nextView)}
          userProfile={userProfile}
        />
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
          onLoginSuccess={handleLoginSuccess}
          initialMode="login"
        />
      )}

      {view === 'auth-candidate-register' && (
        <AuthView
          onNavigate={handleAuthNavigation}
          onLoginSuccess={handleLoginSuccess}
          initialMode="register"
        />
      )}

      {view === 'candidate-onboarding' && (
        <OnboardingView
          userId={currentUserId}
          onComplete={() => setView('candidate-dashboard')}
          onExit={() => setView('landing')}
        />
      )}

      {view === 'candidate-dashboard' && (
        <CandidateDashboard
          userId={currentUserId}
          onLogout={handleLogout}
          onNavigate={(v) => setView(v as ViewState)}
        />
      )}

      {view === 'cv-analysis' && (
        <BrainRoot />
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
