import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen text-[var(--md-sys-color-on-background)]">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[var(--md-sys-color-background)]/90 backdrop-blur-sm border-b border-outline-variant/20 px-4 py-3 md:px-8 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">diversity_3</span>
          <span className="font-display font-medium text-lg md:text-xl tracking-tight">PortafolioIA</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="btn btn--primary btn--sm"
            onClick={() => navigate('/auth/candidate/register')}
          >
            Let's Start
          </button>

          <button
            onClick={() => navigate('/auth/candidate')}
            className="w-10 h-10 rounded-full bg-surface-variant hover:bg-surface-variant/80 border border-transparent hover:border-outline-variant flex items-center justify-center text-outline hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-95"
            aria-label="Account"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center overflow-hidden">
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
          <div className="flex justify-center items-center relative animate-fade-scale">
            <div className="relative z-10 w-full max-w-[320px] md:max-w-[400px]">
              <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
                Welcome to PortafolioIA
              </h1>
              <p className="text-lg md:text-xl text-center text-gray-500">
                Your AI-powered recruitment platform
              </p>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-surface-variant rounded-full opacity-50 z-0 blur-3xl"></div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-outline text-sm">
        <p>© 2024 AnPortafolioIA. All rights reserved.</p>
        <button
          onClick={() => navigate('/design-system')}
          className="mt-2 text-xs hover:text-primary opacity-50 hover:opacity-100 transition-opacity"
        >
          Internal Design System
        </button>
      </footer>
    </div>
  );
}
