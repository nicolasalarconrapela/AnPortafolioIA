
import React, { useState, useEffect } from 'react';
import { Background } from './src/components/Background';
import { LandingView } from './src/components/LandingView';
import { SplashScreen } from './src/components/SplashScreen';
import { AuthView } from './src/components/AuthView';
import { OnboardingView } from './src/components/OnboardingView';
import { CandidateDashboard } from './src/components/CandidateDashboard';
import { DesignSystemView } from './src/components/DesignSystemView';
import { PrivacyPolicyView } from './src/components/legal/PrivacyPolicyView';
import BrainRoot from './src/components/brain/BrainRoot';
import { SettingsModal } from './src/components/SettingsModal';
import { ViewState, UserProfile } from './src/types';
import { ConsentProvider, useConsent } from './src/components/consent/ConsentContext';
import { ConsentUI } from './src/components/consent/ConsentUI';
import { LogViewer } from './src/components/debug/LogViewer';
import { env } from './src/utils/env';
import { loggingService } from './src/utils/loggingService';
import { getWorkspaceByUserFromFirestore, getPublicProfile } from './src/services/firestoreWorkspaces';
import { authService } from './src/services/authService';

// Custom type for extended view state
type ExtendedViewState = ViewState | 'privacy-policy' | 'public-profile';

import { PublicProfileViewer } from './src/components/brain/PublicProfileViewer';
import { CVProfile } from './src/types_brain';

const AppContent: React.FC = () => {
  // Session State (No LocalStorage)
  const [view, setView] = useState<ExtendedViewState>('landing');
  const [prevView, setPrevView] = useState<ExtendedViewState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [publicProfile, setPublicProfile] = useState<CVProfile | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 🧪 TEST: Splash screen preview (set to 0 to disable)
  const SPLASH_TEST_MS = 0
  const [splashTestActive, setSplashTestActive] = useState(SPLASH_TEST_MS > 0);
  useEffect(() => {
    if (SPLASH_TEST_MS <= 0) return;
    const t = setTimeout(() => setSplashTestActive(false), SPLASH_TEST_MS);
    return () => clearTimeout(t);
  }, []);

  const navigateTo = (nextView: ExtendedViewState) => {
    setPrevView(view);
    setView(nextView);
  };

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
            // Identify if it is a full CVProfile or just UserProfile
            const p = publicProfileData.profile;
            if (p.experience || p.education || p.summary) {
              setPublicProfile(p as CVProfile);
              setView('public-profile');
            } else {
              setUserProfile(p);
            }
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
            if (ws && ws.shareToken) {
              setShareToken(ws.shareToken);
            }

            // 3. Logic to decide if we stay on landing or go to dashboard
            // If we are on landing or auth pages, and logged in, we redirect.
            if (view === 'landing' || view.startsWith('auth-')) {
              if (!ws || !ws.profile || !ws.profile.onboardingCompleted) {
                setView('candidate-onboarding');
              } else {
                setView('candidate-dashboard');
              }
            }
          } catch (e) {
            console.warn("Workspace fetch failed", e);
            // Fallback to dashboard if workspace fetch fails but auth is good
            if (view === 'landing' || view.startsWith('auth-')) {
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
      if (ws && ws.shareToken) {
        setShareToken(ws.shareToken);
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
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout service call failed", e);
    }
    setCurrentUserId("");
    setIsAuthenticated(false);
    setUserProfile(null);
    setView('landing');
  };

  if (isSessionChecking || splashTestActive) {
    return <SplashScreen />;
  }

  return (
    <>
      <Background />
      <ConsentUI />

      {view === 'landing' && (
        <LandingView
          onNavigate={(nextView) => navigateTo(nextView)}
          userProfile={userProfile}
        />
      )}

      {view === 'design-system' && (
        <DesignSystemView onBack={() => setView(prevView)} />
      )}

      {view === 'privacy-policy' && (
        <PrivacyPolicyView onBack={() => setView(prevView)} />
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
          onNavigate={(v) => navigateTo(v as ViewState)}
        />
      )}

      {view === 'cv-analysis' && (
        <>
          <BrainRoot
            userId={currentUserId}
            onLogout={handleLogout}
            onSettings={() => setIsSettingsOpen(true)}
            shareToken={shareToken || undefined}
          />
          {isSettingsOpen && (
            <SettingsModal
              onClose={() => setIsSettingsOpen(false)}
              userKey={currentUserId}
              onNavigate={(v) => navigateTo(v as ViewState)}
            />
          )}
        </>
      )}

      {view === 'public-profile' && publicProfile && (
        <PublicProfileViewer profile={publicProfile} />
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

import { AlertProvider } from './src/components/ui/GlobalAlert';

const App: React.FC = () => {
  return (
    <ConsentProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </ConsentProvider>
  );
};

export default App;
