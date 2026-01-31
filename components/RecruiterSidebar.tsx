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
      {/* Mobile Backdrop - High contrast overlay for focus */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-[280px] md:w-[320px] bg-surface-variant dark:bg-surface-darkVariant lg:bg-[var(--md-sys-color-background)] border-r border-outline-variant/20 flex flex-col z-[100] transition-transform duration-300 shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Header Area */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-outline-variant/20 lg:border-none shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">diversity_3</span>
            <span className="font-display font-medium text-lg">Recruiter Portal</span>
          </div>
          
          {/* Explicit Close Button for Mobile Accessibility */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-outline hover:text-error transition-colors rounded-full active:bg-surface-variant/50"
            aria-label="Close Menu"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavItem icon="video_camera_front" label="Interview Room" active={activeItem === "Interview Room"} onClick={() => setActiveItem("Interview Room")} />
          <NavItem icon="group" label="Candidates" active={activeItem === "Candidates"} onClick={() => setActiveItem("Candidates")} />
          <NavItem icon="analytics" label="Insights" active={activeItem === "AI Insights"} onClick={() => setActiveItem("AI Insights")} />
          
          <div className="my-4 border-t border-outline-variant/30 mx-2"></div>
          
          <NavItem icon="settings" label="Settings" active={activeItem === "Settings"} onClick={() => setActiveItem("Settings")} />
        </nav>

        {/* User Profile Footer */}
        {isAuthenticated && (
          <div className="p-4 m-4 bg-[var(--md-sys-color-background)] lg:bg-surface-variant rounded-[16px] flex items-center gap-3 shadow-sm border border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-lg font-medium shrink-0">
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

// NavItem Component with improved touch targets (min-h-[48px])
const NavItem: React.FC<{icon: string, label: string, active: boolean, onClick: () => void}> = ({icon, label, active, onClick}) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-4 px-4 min-h-[56px] rounded-full transition-all text-sm font-medium state-layer group ${
            active 
            ? 'bg-secondary-container text-secondary-onContainer font-bold shadow-sm' 
            : 'text-[var(--md-sys-color-on-background)] hover:bg-surface-variant/50'
        }`}
        aria-current={active ? 'page' : undefined}
    >
        <span className={`material-symbols-outlined transition-colors ${active ? 'fill-1' : 'text-outline group-hover:text-primary'}`}>{icon}</span>
        <span>{label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary-onContainer"></span>}
    </button>
)