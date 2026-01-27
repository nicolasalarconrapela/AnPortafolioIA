import React from 'react';

export const RecruiterSidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-white/5 bg-[#050b14] flex flex-col z-30 relative">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">deployed_code</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">RecruitAI</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <NavItem icon="video_camera_front" label="Interview Room" active={false} />
        <NavItem icon="group_search" label="Candidates" active={false} />
        <NavItem icon="query_stats" label="AI Insights" active={false} />
        <div className="pt-4 pb-2">
            <div className="h-px bg-white/5 mx-2"></div>
        </div>
        <NavItem icon="settings" label="Settings" active={false} />
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="glass-panel p-3 rounded-xl flex items-center gap-3 border border-white/5 bg-slate-900/50">
           <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Recruiter" className="w-10 h-10 rounded-full border border-indigo-500/30" />
           <div className="flex flex-col">
              <span className="text-sm font-bold text-white">Alex Morgan</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Senior Recruiter</span>
           </div>
           <button className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
              <span className="material-symbols-outlined text-lg">light_mode</span>
           </button>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{icon: string, label: string, active: boolean}> = ({icon, label, active}) => (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-l-2 border-indigo-400 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        <span className={`material-symbols-outlined ${active ? 'text-indigo-400' : 'group-hover:text-white'}`}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
    </button>
)
