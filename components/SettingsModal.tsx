
import React, { useState } from 'react';
import { StorageSettingsView } from './settings/StorageSettings';
import { useConsent } from './consent/ConsentContext'; // Importar contexto de consentimiento

interface SettingsModalProps {
  onClose: () => void;
  userKey: string;
}

type SettingsTab = 'general' | 'account' | 'notifications' | 'privacy'; // Renamed storage to privacy

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, userKey }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { openModal } = useConsent(); // Hook para reabrir el banner de cookies

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: 'tune' },
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'privacy', label: 'Privacy & Data', icon: 'security' }, // Updated label
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onKeyDown={handleKeyDown}
    >
      <div className="bg-[var(--md-sys-color-background)] w-full h-full md:max-w-5xl md:h-[85vh] md:rounded-[28px] shadow-elevation-3 flex flex-col md:flex-row overflow-hidden border-none md:border border-outline-variant/20 animate-fade-scale">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-surface-variant/50 border-b md:border-b-0 md:border-r border-outline-variant/20 p-4 md:p-6 flex flex-col shrink-0">
          <div className="flex items-center justify-between md:block mb-4 md:mb-8">
             <h2 id="settings-title" className="text-xl md:text-2xl font-display font-medium text-[var(--md-sys-color-on-background)] px-2">Settings</h2>
             <button onClick={onClose} className="md:hidden p-2 text-outline hover:text-primary">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          
          <nav role="tablist" aria-orientation="vertical" className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-2 md:py-3 rounded-full text-sm font-medium transition-all duration-200 state-layer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  activeTab === tab.id
                    ? 'bg-secondary-container text-secondary-onContainer shadow-sm'
                    : 'text-outline hover:bg-surface-variant hover:text-[var(--md-sys-color-on-background)]'
                }`}
              >
                <span className={`material-symbols-outlined text-lg md:text-xl ${activeTab === tab.id ? 'fill-1' : ''}`} aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block mt-6 pt-6 border-t border-outline-variant/30 px-2">
            <p className="text-xs text-outline font-medium">AnPortafolioIA v0.5.0</p>
            <p className="text-[10px] text-outline/70 mt-1">GDPR Compliant Build</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--md-sys-color-background)]">
          {/* Header */}
          <div className="hidden md:flex h-16 items-center justify-between px-8 border-b border-outline-variant/20 shrink-0">
            <h3 className="text-lg font-medium text-[var(--md-sys-color-on-background)] capitalize">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button 
              onClick={onClose}
              aria-label="Close Settings"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant text-outline hover:text-[var(--md-sys-color-on-background)] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Scrollable Area */}
          <div 
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar focus:outline-none"
            tabIndex={0}
          >
            <div className="max-w-3xl mx-auto pb-20 md:pb-0">
              
              {activeTab === 'general' && (
                <div className="space-y-8 animate-fade-in">
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Appearance</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-4 md:p-6 border border-outline-variant/30 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-medium text-[var(--md-sys-color-on-background)]">Theme Mode</p>
                          <p className="text-sm text-outline">Adjust the interface brightness</p>
                        </div>
                        <div className="flex bg-surface-variant rounded-full p-1 self-start md:self-auto" role="radiogroup">
                          <button role="radio" aria-checked="true" className="px-4 py-1.5 rounded-full bg-[var(--md-sys-color-background)] shadow-sm text-xs font-bold text-[var(--md-sys-color-on-background)]">System</button>
                          <button role="radio" aria-checked="false" className="px-4 py-1.5 rounded-full text-xs font-medium text-outline hover:text-primary">Light</button>
                          <button role="radio" aria-checked="false" className="px-4 py-1.5 rounded-full text-xs font-medium text-outline hover:text-primary">Dark</button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center gap-4 md:gap-6 mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-2xl md:text-3xl font-bold shadow-sm shrink-0">A</div>
                    <div className="min-w-0">
                      <h4 className="text-lg md:text-xl font-display font-medium text-[var(--md-sys-color-on-background)] truncate">Alex Morgan</h4>
                      <p className="text-sm text-outline truncate">alex.morgan@example.com</p>
                    </div>
                  </div>
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-outline ml-1">First Name</label>
                        <input type="text" defaultValue="Alex" className="w-full h-12 px-4 rounded-xl bg-surface-variant/30 border border-outline-variant focus:border-primary outline-none text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-outline ml-1">Last Name</label>
                        <input type="text" defaultValue="Morgan" className="w-full h-12 px-4 rounded-xl bg-surface-variant/30 border border-outline-variant focus:border-primary outline-none text-sm" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Preferences</h4>
                  <div className="bg-surface-variant/30 rounded-[20px] divide-y divide-outline-variant/20 border border-outline-variant/30">
                    {['Job Alerts', 'Application Updates'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 md:p-5">
                        <label className="text-sm font-medium text-[var(--md-sys-color-on-background)]">{item}</label>
                        <div className="w-12 h-6 rounded-full bg-secondary-container relative"><span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRIVACY & DATA TAB (GDPR Hub) */}
              {activeTab === 'privacy' && (
                <div className="animate-fade-in space-y-8">
                  
                  {/* Status Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">lock</span>
                        <div>
                            <h4 className="text-sm font-bold text-primary-onContainer dark:text-blue-200">Secure & Private</h4>
                            <p className="text-xs text-primary-onContainer/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Your data is protected with AES-GCM Client-Side Encryption. Only you hold the keys to decrypt your sensitive documents.
                            </p>
                        </div>
                    </div>
                  </div>

                  {/* Cookie Consent Management */}
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Cookie Preferences</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-6 border border-outline-variant/30 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[var(--md-sys-color-on-background)]">Consent Settings</p>
                            <p className="text-xs text-outline mt-1">Manage which cookies and third-party scripts are allowed.</p>
                        </div>
                        <button 
                            onClick={openModal} 
                            className="px-4 py-2 rounded-full border border-outline text-primary text-sm font-medium hover:bg-surface-variant transition-colors"
                        >
                            Update Preferences
                        </button>
                    </div>
                  </section>

                  {/* Data Rights (DSAR) */}
                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Your Data Rights (GDPR)</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-1 border border-outline-variant/30">
                        <StorageSettingsView userKey={userKey} currentContent={{ lastSeen: new Date().toISOString() }} />
                    </div>
                    <p className="text-[10px] text-outline mt-2 px-2">
                        * The "Download Backup" feature satisfies your right to Data Portability (Art. 20 GDPR).
                    </p>
                  </section>

                  {/* Danger Zone */}
                  <section>
                    <h4 className="text-sm font-bold text-error uppercase tracking-wider mb-4">Danger Zone</h4>
                    <div className="bg-error-container/10 rounded-[20px] p-6 border border-error/20 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-error">Delete Account</p>
                            <p className="text-xs text-error/80 mt-1">Permanently remove all your data (Right to Erasure).</p>
                        </div>
                        <button className="px-4 py-2 rounded-full bg-error text-white text-sm font-medium hover:bg-error/90 shadow-sm">
                            Delete My Data
                        </button>
                    </div>
                  </section>

                </div>
              )}

            </div>
          </div>
          
          {/* Footer Actions */}
          {activeTab !== 'privacy' && (
            <div className="p-4 md:p-6 border-t border-outline-variant/20 bg-surface-variant/30 flex justify-end gap-4 shrink-0 safe-pb">
                <button onClick={onClose} className="px-6 py-2 rounded-full text-sm font-medium text-outline hover:bg-surface-variant">Cancel</button>
                <button className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-elevation-1">Save Changes</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
