import React from 'react';
import { FloatingNode } from './FloatingNode';
import { AvatarScanner } from './AvatarScanner';
import { ViewState } from '../types';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen overflow-x-hidden p-4 lg:overflow-hidden">
      <div className="relative w-full max-w-7xl h-full flex flex-col lg:flex-row items-center justify-center">
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl rounded-full z-0 pointer-events-none"></div>

        {/* Recruiter Access Button */}
        <button 
            onClick={() => onNavigate('auth-recruiter')}
            className="absolute top-6 right-6 lg:top-10 lg:right-10 z-50 px-5 py-2.5 rounded-full bg-slate-900/50 hover:bg-indigo-900/30 border border-slate-700/50 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 backdrop-blur-md group"
        >
            <span className="material-symbols-outlined text-lg group-hover:text-indigo-400">business_center</span>
            For Companies
        </button>

        {/* Mobile Spacer to push avatar up */}
        <div className="h-12 lg:hidden"></div>

        <AvatarScanner />

        {/* Desktop Floating Nodes - Absolute Positioning */}
        <div className="hidden lg:block">
            <FloatingNode 
              title="Experience"
              subtitle="Senior Product Designer"
              detail="TechFlow Systems • 4 Years"
              icon="work"
              position="top-[25%] left-[5%] xl:left-[18%]"
              delay="0.5s"
              type="cyan"
              align="left"
            />

            <FloatingNode 
              title="Key Skills"
              subtitle=""
              detail=""
              icon="psychology"
              position="top-[20%] right-[5%] xl:right-[18%]"
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
              position="bottom-[25%] left-[8%] xl:left-[20%]"
              delay="2.5s"
              type="cyan"
              align="left"
            />

            <FloatingNode 
              title="Achievements"
              subtitle="Awwwards SOTD x3"
              detail="Best Innovation 2023"
              icon="trophy"
              position="bottom-[30%] right-[8%] xl:right-[20%]"
              delay="1.0s"
              type="indigo"
              align="right"
            />
        </div>

        {/* Mobile Info Grid - Static Layout */}
        <div className="lg:hidden grid grid-cols-2 gap-3 w-full max-w-md mt-8 animate-fade-in relative z-20">
             <div className="glass-panel p-3 rounded-xl border border-cyan-500/30">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="material-symbols-outlined text-cyan-400 text-lg">work</span>
                     <span className="text-xs font-bold text-cyan-400 uppercase">Experience</span>
                 </div>
                 <p className="text-white text-xs font-bold">Senior Designer</p>
                 <p className="text-slate-400 text-[10px]">TechFlow • 4 Years</p>
             </div>
             <div className="glass-panel p-3 rounded-xl border border-indigo-500/30">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="material-symbols-outlined text-indigo-400 text-lg">psychology</span>
                     <span className="text-xs font-bold text-indigo-400 uppercase">Skills</span>
                 </div>
                 <div className="flex flex-wrap gap-1">
                     {['React', 'UX', 'AI'].map(t => (
                         <span key={t} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[9px] text-indigo-200">{t}</span>
                     ))}
                 </div>
             </div>
             <div className="glass-panel p-3 rounded-xl border border-cyan-500/30">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="material-symbols-outlined text-cyan-400 text-lg">school</span>
                     <span className="text-xs font-bold text-cyan-400 uppercase">Education</span>
                 </div>
                 <p className="text-white text-xs font-bold">M.S. CS</p>
                 <p className="text-slate-400 text-[10px]">Stanford '21</p>
             </div>
             <div className="glass-panel p-3 rounded-xl border border-indigo-500/30">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="material-symbols-outlined text-indigo-400 text-lg">trophy</span>
                     <span className="text-xs font-bold text-indigo-400 uppercase">Awards</span>
                 </div>
                 <p className="text-white text-xs font-bold">Best Innovation</p>
                 <p className="text-slate-400 text-[10px]">2023 Winner</p>
             </div>
        </div>
      </div>

      <nav className="fixed bottom-8 lg:absolute lg:bottom-12 z-50 animate-fade-in w-full flex justify-center px-4 pointer-events-none">
          <button 
            onClick={() => onNavigate('auth-candidate')}
            className="pointer-events-auto group relative px-6 py-3 lg:px-8 lg:py-4 bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-4 lg:gap-5 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <span className="material-symbols-outlined text-white text-xl lg:text-3xl">rocket_launch</span>
            </div>
            
            <div className="flex flex-col items-start text-left mr-1 lg:mr-2">
              <span className="text-white font-bold text-sm lg:text-lg leading-none mb-0.5 lg:mb-1">Start Career Journey</span>
              <span className="text-cyan-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest">Build your AI Portfolio</span>
            </div>
            
            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1 text-lg lg:text-2xl">arrow_forward</span>
          </button>
      </nav>
    </main>
  );
};