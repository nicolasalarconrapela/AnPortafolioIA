import React from 'react';
import { AvatarScanner } from './AvatarScanner';
import { ViewState } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen text-[var(--md-sys-color-on-background)]">
      
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[var(--md-sys-color-background)]/90 backdrop-blur-sm border-b border-outline-variant/20 px-4 py-3 md:px-8 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <Icon name="diversity_3" className="text-primary text-2xl md:text-3xl" />
          <span className="font-display font-medium text-lg md:text-xl tracking-tight">PortafolioIA</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile: Text variant to save space. Desktop: Outlined variant */}
          <Button 
            variant="text" 
            size="sm"
            onClick={() => onNavigate('auth-recruiter')}
            className="md:hidden text-xs"
          >
            Companies
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => onNavigate('auth-recruiter')}
            className="hidden md:inline-flex"
          >
            For Companies
          </Button>
          
          <Button 
            variant="filled" 
            size="sm" // Smaller on mobile automatically via responsive logic if we wanted, but explicit here for clarity
            className="md:h-10 md:px-5 md:text-sm"
            onClick={() => onNavigate('auth-candidate')}
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-6 items-start animate-fade-in order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-primary-onContainer text-sm font-medium">
              <Icon name="auto_awesome" size="sm" />
              <span>New AI Features Available</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-normal leading-[1.1] text-[var(--md-sys-color-on-background)]">
              The future of hiring is <span className="text-primary font-medium">human-centric</span>.
            </h1>
            
            <p className="text-lg text-outline leading-relaxed max-w-lg">
              Automated candidate matching, immersive portfolio showcases, and unbiased AI screening tools designed for modern recruitment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Button 
                size="lg" 
                variant="filled" 
                onClick={() => onNavigate('auth-candidate')}
                endIcon="arrow_forward"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outlined"
                onClick={() => window.open('https://ai.google.dev/', '_blank')}
                icon="play_circle"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end items-center relative animate-fade-scale order-1 lg:order-2">
            <div className="relative z-10 w-full max-w-[280px] md:max-w-[320px]">
                <AvatarScanner />
            </div>
            {/* Abstract clean decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-surface-variant rounded-full opacity-50 z-0 blur-3xl"></div>
          </div>

        </section>

        {/* Features Section */}
        <section className="bg-surface-variant dark:bg-surface-darkVariant py-16 md:py-20 px-4 md:px-8 rounded-t-[32px] mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">Designed for efficiency</h2>
              <p className="text-outline text-lg">Streamline your hiring process with tools built on Material Design principles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'smart_toy', title: 'AI Analysis', desc: 'Instant profile matching using Gemini Pro models.' },
                { icon: 'verified', title: 'Verified Skills', desc: 'Automated technical assessments and skill validation.' },
                { icon: 'lock', title: 'Secure Data', desc: 'Enterprise-grade security with Firestore encryption.' }
              ].map((feature, i) => (
                <Card key={i} variant="elevated" hoverable className="bg-[var(--md-sys-color-background)]">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center mb-6">
                    <Icon name={feature.icon} size="lg" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-outline leading-relaxed">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="py-6 text-center text-outline text-sm">
        <p>© 2024 AnPortafolioIA. All rights reserved.</p>
        <button onClick={() => onNavigate('design-system')} className="mt-2 text-xs hover:text-primary opacity-50 hover:opacity-100 transition-opacity">
            Internal Design System
        </button>
      </footer>
    </div>
  );
};