import React from 'react';
import { FloatingNode } from './FloatingNode';
import { AvatarScanner } from './AvatarScanner';
import { ViewState } from '../types';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center w-full h-screen overflow-hidden p-4">
      <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl rounded-full z-0 pointer-events-none"></div>

        <AvatarScanner />

        <FloatingNode 
          title="Experience"
          subtitle="Senior Product Designer"
          detail="TechFlow Systems • 4 Years"
          icon="work"
          position="top-[15%] md:top-[25%] left-[2%] md:left-[5%] lg:left-[12%] xl:left-[18%]"
          delay="0.5s"
          type="cyan"
          align="left"
        />

        <FloatingNode 
          title="Key Skills"
          subtitle=""
          detail=""
          icon="psychology"
          position="top-[15%] md:top-[20%] right-[2%] md:right-[5%] lg:right-[12%] xl:right-[18%]"
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
          position="bottom-[20%] md:bottom-[25%] left-[5%] md:left-[8%] lg:left-[15%] xl:left-[20%]"
          delay="2.5s"
          type="cyan"
          align="left"
        />

        <FloatingNode 
          title="Achievements"
          subtitle="Awwwards SOTD x3"
          detail="Best Innovation 2023"
          icon="trophy"
          position="bottom-[25%] md:bottom-[30%] right-[5%] md:right-[8%] lg:right-[15%] xl:right-[20%]"
          delay="1.0s"
          type="indigo"
          align="right"
        />
      </div>

      <nav className="absolute bottom-12 z-50 animate-fade-in w-full flex justify-center px-4">
          <button 
            onClick={() => onNavigate('auth-candidate')}
            className="group relative px-8 py-4 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-5 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <span className="material-symbols-outlined text-white text-3xl">rocket_launch</span>
            </div>
            
            <div className="flex flex-col items-start text-left mr-2">
              <span className="text-white font-bold text-lg leading-none mb-1">Start Career Journey</span>
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Build your AI Portfolio</span>
            </div>
            
            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1">arrow_forward</span>
          </button>
      </nav>
    </main>
  );
};