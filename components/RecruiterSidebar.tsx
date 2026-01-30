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
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-[280px] bg-surface-variant dark:bg-surface-darkVariant lg:bg-[var(--md-sys-color-background)] border-r border-outline-variant/20 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/20 lg:border-none">
          <span className="material-symbols-outlined text-primary text-2xl mr-3">diversity_3</span>
          <span className="font-display font-medium text-lg">Recruiter Portal</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem icon="video_camera_front" label="Interview Room" active={activeItem === "Interview Room"} onClick={() => setActiveItem("Interview Room")} />
          <NavItem icon="group" label="Candidates" active={activeItem === "Candidates"} onClick={() => setActiveItem("Candidates")} />
          <NavItem icon="analytics" label="Insights" active={activeItem === "AI Insights"} onClick={() => setActiveItem("AI Insights")} />
          
          <div className="my-4 border-t border-outline-variant/30 mx-4"></div>
          
          <NavItem icon="settings" label="Settings" active={activeItem === "Settings"} onClick={() => setActiveItem("Settings")} />
        </nav>

        {isAuthenticated && (
          <div className="p-4 m-3 bg-surface-variant rounded-[16px] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-lg font-medium">
                   R
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[var(--md-sys-color-on-background)] truncate">Recruiter Admin</span>
                  <span className="text-xs text-outline truncate">admin@company.com</span>
              </div>
          </div>
        )}
      </aside>
    </>
  );
};

const NavItem: React.FC<{icon: string, label: string, active: boolean, onClick: () => void}> = ({icon, label, active, onClick}) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-4 h-14 rounded-full transition-colors text-sm font-medium state-layer ${
            active 
            ? 'bg-secondary-container text-secondary-onContainer' 
            : 'text-[var(--md-sys-color-on-background)] hover:bg-surface-variant/50'
        }`}
        aria-current={active ? 'page' : undefined}
    >
        <span className={`material-symbols-outlined ${active ? 'fill-1' : ''}`}>{icon}</span>
        <span>{label}</span>
    </button>
)
