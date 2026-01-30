import React, { useState } from 'react';
import { StorageSettingsView } from './settings/StorageSettings';

interface SettingsModalProps {
  onClose: () => void;
  userKey: string;
}

type SettingsTab = 'general' | 'account' | 'notifications' | 'storage';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, userKey }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: 'tune' },
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'storage', label: 'Data & Storage', icon: 'database' },
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
      {/* 
         UX Stress Test Fix: 
         - Mobile: w-full h-full (inset-0) to maximize space in landscape/keyboard scenarios.
         - Desktop: max-w-5xl h-[85vh] rounded borders.
      */}
      <div className="bg-[var(--md-sys-color-background)] w-full h-full md:max-w-5xl md:h-[85vh] md:rounded-[28px] shadow-elevation-3 flex flex-col md:flex-row overflow-hidden border-none md:border border-outline-variant/20 animate-fade-scale">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-surface-variant/50 border-b md:border-b-0 md:border-r border-outline-variant/20 p-4 md:p-6 flex flex-col shrink-0">
          <div className="flex items-center justify-between md:block mb-4 md:mb-8">
             <h2 id="settings-title" className="text-xl md:text-2xl font-display font-medium text-[var(--md-sys-color-on-background)] px-2">Settings</h2>
             {/* Mobile Close Button visible in header */}
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
            <p className="text-[10px] text-outline/70 mt-1">Build 2024.05.12</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--md-sys-color-background)]">
          {/* Desktop Header */}
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
                        <div className="flex bg-surface-variant rounded-full p-1 self-start md:self-auto" role="radiogroup" aria-label="Theme Selection">
                          <button role="radio" aria-checked="true" className="px-4 py-1.5 rounded-full bg-[var(--md-sys-color-background)] shadow-sm text-xs font-bold text-[var(--md-sys-color-on-background)] transition-all">System</button>
                          <button role="radio" aria-checked="false" className="px-4 py-1.5 rounded-full text-xs font-medium text-outline hover:text-primary transition-all">Light</button>
                          <button role="radio" aria-checked="false" className="px-4 py-1.5 rounded-full text-xs font-medium text-outline hover:text-primary transition-all">Dark</button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Language & Region</h4>
                    <div className="bg-surface-variant/30 rounded-[20px] p-4 md:p-6 border border-outline-variant/30 space-y-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="lang-select" className="text-sm font-medium text-[var(--md-sys-color-on-background)]">Interface Language</label>
                        <select id="lang-select" className="w-full h-12 px-4 rounded-xl bg-[var(--md-sys-color-background)] border border-outline-variant text-sm focus:border-primary outline-none transition-shadow focus:ring-2 focus:ring-primary/20">
                          <option>English (US)</option>
                          <option>Español (ES)</option>
                          <option>Français (FR)</option>
                        </select>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center gap-4 md:gap-6 mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-2xl md:text-3xl font-bold shadow-sm shrink-0" aria-hidden="true">
                      A
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg md:text-xl font-display font-medium text-[var(--md-sys-color-on-background)] truncate">Alex Morgan</h4>
                      <p className="text-sm text-outline truncate">alex.morgan@example.com</p>
                      <button className="mt-2 text-sm text-primary font-medium hover:underline">Change Avatar</button>
                    </div>
                  </div>

                  <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="fname" className="text-xs font-medium text-outline ml-1">First Name</label>
                        <input id="fname" type="text" defaultValue="Alex" className="w-full h-12 px-4 rounded-xl bg-surface-variant/30 border border-outline-variant focus:border-primary outline-none text-sm transition-all focus:bg-[var(--md-sys-color-background)]" />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="lname" className="text-xs font-medium text-outline ml-1">Last Name</label>
                        <input id="lname" type="text" defaultValue="Morgan" className="w-full h-12 px-4 rounded-xl bg-surface-variant/30 border border-outline-variant focus:border-primary outline-none text-sm transition-all focus:bg-[var(--md-sys-color-background)]" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Email Preferences</h4>
                  <div className="bg-surface-variant/30 rounded-[20px] divide-y divide-outline-variant/20 border border-outline-variant/30" role="group" aria-label="Email Notifications">
                    {['Job Alerts', 'Application Status Updates', 'New Message Notifications', 'Weekly Newsletter'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 md:p-5 hover:bg-surface-variant/50 transition-colors">
                        <label htmlFor={`notify-${i}`} className="text-sm font-medium text-[var(--md-sys-color-on-background)] cursor-pointer flex-1 mr-4">{item}</label>
                        <button 
                            id={`notify-${i}`}
                            role="switch"
                            aria-checked={i !== 3}
                            className="relative inline-block w-12 h-6 rounded-full bg-secondary-container cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none shrink-0"
                        >
                          <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${i === 3 ? 'translate-x-0 bg-outline' : 'translate-x-6'}`}></span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="animate-fade-in">
                  <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5" aria-hidden="true">cloud_sync</span>
                        <div>
                            <h4 className="text-sm font-bold text-primary-onContainer dark:text-blue-200">Cloud Sync Active</h4>
                            <p className="text-xs text-primary-onContainer/80 dark:text-blue-300/80 mt-1">
                                Your profile data is synchronized with Firebase Firestore using secure AES-GCM encryption.
                            </p>
                        </div>
                    </div>
                  </div>
                  <StorageSettingsView userKey={userKey} currentContent={{ lastSeen: new Date().toISOString() }} />
                </div>
              )}

            </div>
          </div>
          
          {/* Footer Actions (Only for form-based tabs) - Sticky bottom on mobile */}
          {activeTab !== 'storage' && (
            <div className="p-4 md:p-6 border-t border-outline-variant/20 bg-surface-variant/30 flex justify-end gap-4 shrink-0 safe-pb">
                <button onClick={onClose} className="px-6 py-2 rounded-full text-sm font-medium text-outline hover:bg-surface-variant transition-colors focus-visible:ring-2 focus-visible:ring-primary active:scale-95">
                    Cancel
                </button>
                <button className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-elevation-1 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:scale-95 active:shadow-none">
                    Save Changes
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};