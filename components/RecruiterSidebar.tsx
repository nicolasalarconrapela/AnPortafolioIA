import React, { useState } from 'react';

interface RecruiterSidebarProps {
  isAuthenticated?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const RecruiterSidebar: React.FC<RecruiterSidebarProps> = ({ isAuthenticated = false, isOpen = true, onClose }) => {
  const [activeItem, setActiveItem] = useState("Interview Room");

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 border-r border-white/5 bg-[#050b14] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg font-bold">deployed_code</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AnPortafolioIA</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem icon="video_camera_front" label="Interview Room" active={activeItem === "Interview Room"} onClick={() => setActiveItem("Interview Room")} />
          <NavItem icon="group_search" label="Candidates" active={activeItem === "Candidates"} onClick={() => setActiveItem("Candidates")} />
          <NavItem icon="query_stats" label="AI Insights" active={activeItem === "AI Insights"} onClick={() => setActiveItem("AI Insights")} />
          <div className="pt-4 pb-2">
              <div className="h-px bg-white/5 mx-2"></div>
          </div>
          <NavItem icon="settings" label="Settings" active={activeItem === "Settings"} onClick={() => setActiveItem("Settings")} />
        </nav>

        {isAuthenticated && (
          <div className="p-4 border-t border-white/5">
              <div className="glass-panel p-3 rounded-xl flex items-center gap-3 border border-white/5 bg-slate-900/50">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Recruiter" className="w-10 h-10 rounded-full border border-indigo-500/30 shrink-0" />
              <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">Alex Morgan</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate">Senior Recruiter</span>
              </div>
              </div>
          </div>
        )}
      </aside>
    </>
  );
};

const NavItem: React.FC<{icon: string, label: string, active: boolean, onClick: () => void}> = ({icon, label, active, onClick}) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-l-2 border-indigo-400 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        <span className={`material-symbols-outlined ${active ? 'text-indigo-400' : 'group-hover:text-white'}`}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
    </button>
)