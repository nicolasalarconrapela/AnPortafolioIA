import React, { useState } from 'react';
import { AvatarScanner } from './AvatarScanner';
import { ViewState } from '../types';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { APP_VERSION } from '../version';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
  userProfile?: import('../types').UserProfile | null;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, userProfile }) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="flex flex-col min-h-screen text-[var(--md-sys-color-on-background)]">

      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[var(--md-sys-color-background)]/90 backdrop-blur-sm border-b border-outline-variant/20 px-4 py-3 md:px-8 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <Icon name="diversity_3" className="text-primary text-2xl md:text-3xl" />
          <span className="font-display font-medium text-lg md:text-xl tracking-tight">AnPortafolioIA</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="filled"
            size="sm"
            className="h-9 px-4 text-xs md:h-10 md:px-5 md:text-sm"
            onClick={() => onNavigate('auth-candidate-register')}
          >
            Let's Start
          </Button>

          <button
            onClick={() => {
              if (userProfile) {
                onNavigate('candidate-dashboard'); // Go to dashboard if clicked and logged in
              } else {
                onNavigate('auth-candidate');
              }
            }}
            className="w-10 h-10 rounded-full bg-surface-variant hover:bg-surface-variant/80 border border-transparent hover:border-outline-variant flex items-center justify-center text-outline hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-95 overflow-hidden"
            aria-label={userProfile ? `Profile: ${userProfile.name}` : "Account"}
            title={userProfile ? `Logged in as ${userProfile.name}` : "Log In"}
          >
            {userProfile?.avatarUrl && !avatarError ? (
              <img 
                src={userProfile.avatarUrl} 
                alt={userProfile.name || "User"} 
                className="w-full h-full object-cover" 
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Icon name="account_circle" size={24} />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center overflow-hidden">

        {/* Hero Section - Avatar Only */}
        <section className="px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto w-full flex flex-col items-center justify-center">

          <div className="flex justify-center items-center relative animate-fade-scale">
            <div className="relative z-10 w-full max-w-[320px] md:max-w-[400px]">
              <AvatarScanner />
            </div>
            {/* Abstract clean decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-surface-variant rounded-full opacity-50 z-0 blur-3xl"></div>
          </div>

        </section>

      </main>

      <footer className="py-3 text-center text-outline text-xs opacity-40">
        <p>© 2026 AnAppWiLos. All rights reserved.</p>
        <p className="font-mono text-[10px]">v{APP_VERSION}</p>
      </footer>
    </div>
  );
};