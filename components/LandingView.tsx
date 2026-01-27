import React from 'react';
import { FloatingNode } from './FloatingNode';
import { AvatarScanner } from './AvatarScanner';

interface LandingViewProps {
  onNavigate: (view: 'login' | 'signup') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center w-full h-screen overflow-hidden">
      <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl rounded-full z-0 pointer-events-none"></div>

        <AvatarScanner />

        <FloatingNode 
          title="Experience"
          subtitle="Senior Product Designer"
          detail="TechFlow Systems • 4 Years"
          icon="work"
          position="top-[25%] left-[5%] lg:left-[12%] xl:left-[18%]"
          delay="0.5s"
          type="cyan"
          align="left"
        />

        <FloatingNode 
          title="Key Skills"
          subtitle=""
          detail=""
          icon="psychology"
          position="top-[20%] right-[5%] lg:right-[12%] xl:right-[18%]"
          delay="1.5s"
          type="indigo"
          align="right"
          tags={['React', 'WebGL', 'Three.js', 'UI/UX']}
        />

        <FloatingNode 
          title="Education"
          subtitle="M.S. Comp. Science"
          detail="Stanford University • 2021"
          icon="school"
          position="bottom-[25%] left-[8%] lg:left-[15%] xl:left-[20%]"
          delay="2.5s"
          type="cyan"
          align="left"
        />

        <FloatingNode 
          title="Achievements"
          subtitle="Awwwards SOTD x3"
          detail="Best Innovation 2023"
          icon="trophy"
          position="bottom-[30%] right-[8%] lg:right-[15%] xl:right-[20%]"
          delay="1.0s"
          type="indigo"
          align="right"
        />
      </div>

      <nav className="absolute bottom-12 z-50 animate-fade-in">
        <div className="glass-panel rounded-full p-2 px-3 flex items-center gap-4">
          <button 
            onClick={() => onNavigate('login')}
            aria-label="View Full CV" 
            className="group nav-btn rounded-full px-5 py-2.5 flex items-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-cyan-400 text-2xl group-hover:scale-110 transition-transform">person</span>
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-semibold">Candidate</span>
              <span className="text-xs text-slate-200 font-medium group-hover:text-cyan-100">View Full Profile</span>
            </div>
          </button>
          
          <div className="w-px h-8 bg-white/10"></div>
          
          <button 
            onClick={() => onNavigate('signup')}
            aria-label="Start Interview" 
            className="group nav-btn rounded-full px-5 py-2.5 flex items-center gap-3 relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-indigo-400 text-2xl group-hover:scale-110 transition-transform">domain</span>
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-semibold">Recruiter</span>
              <span className="text-xs text-slate-200 font-medium group-hover:text-indigo-100">Enter Interview</span>
            </div>
          </button>
        </div>
      </nav>
    </main>
  );
};