
import React, { useState, useRef, useEffect } from 'react';
import { upsertWorkspaceForUser, listenWorkspaceByUser } from '../services/firestoreWorkspaces';
import { SettingsModal } from './SettingsModal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';

// --- TYPES ---
export interface ProfileData {
  fullName: string;
  jobTitle: string;
  bio: string;
  location?: string;
  email?: string;
  avatarUrl?: string;
  skills?: string[];
  experiences?: ExperienceData[];
}

export interface ExperienceData {
  role: string;
  company: string;
  period: string;
  desc: string;
}

type OptimizationCategory = 'experience' | 'skills' | 'education' | 'projects';

interface CandidateDashboardProps {
  onLogout: () => void;
  userId: string;
  onNavigate?: (view: string) => void;
}

// --- CONFIGURATION ---
const CATEGORY_CONFIG: Record<OptimizationCategory, {
  label: string;
  icon: string;
  color: string;
  systemPrompt: string;
  suggestions: string[];
}> = {
  experience: {
    label: "Experience",
    icon: "work_history",
    color: "text-blue-600",
    systemPrompt: "Audit work history for impact metrics and active verbs.",
    suggestions: ["Audit my recent role", "Rewrite bullet points", "Identify gaps"]
  },
  skills: {
    label: "Skills",
    icon: "psychology",
    color: "text-purple-600",
    systemPrompt: "Analyze technical hard skills and soft skills balance.",
    suggestions: ["Suggest missing tools", "Validate proficiency", "Group by category"]
  },
  education: {
    label: "Education",
    icon: "school",
    color: "text-green-600",
    systemPrompt: "Highlight relevant coursework and academic achievements.",
    suggestions: ["Format dates", "Add certifications", "Check relevance"]
  },
  projects: {
    label: "Projects",
    icon: "rocket_launch",
    color: "text-orange-600",
    systemPrompt: "Focus on problem-solution-result methodology for projects.",
    suggestions: ["Describe tech stack", "Clarify my role", "Add live links"]
  }
};

// --- SUB-COMPONENTS (Material Design 3) ---

const ExperienceCard: React.FC<{ role: string, company: string, period: string, desc: string, active?: boolean }> = ({ role, company, period, desc, active }) => (
  <Card
    variant={active ? 'filled' : 'outlined'}
    hoverable
    className={`group transition-all p-4 md:p-5 ${active ? 'bg-secondary-container border-transparent' : 'bg-surface-variant/50 border-transparent hover:bg-surface-variant'}`}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className={`text-base font-bold leading-tight ${active ? 'text-secondary-onContainer' : 'text-[var(--md-sys-color-on-background)]'}`}>{role}</h4>
        <p className="text-xs md:text-sm text-outline font-medium mt-1">{company} • {period}</p>
      </div>
      <button
        className={`p-2 -mr-2 -mt-2 rounded-full hover:bg-black/5 transition-opacity focus:opacity-100 focus:bg-black/5 ${active ? 'text-secondary-onContainer' : 'text-outline opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}
        aria-label={`Edit experience at ${company}`}
      >
        <Icon name="edit" size="sm" />
      </button>
    </div>
    <p className={`text-sm leading-relaxed ${active ? 'text-secondary-onContainer/80' : 'text-outline'}`}>{desc}</p>

    {active && (
      <div className="mt-3 flex gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 text-xs font-medium text-secondary-onContainer">
          <Icon name="auto_awesome" size={14} />
          AI Analyzing
        </span>
      </div>
    )}
  </Card>
);

const ChatMessage: React.FC<{ sender: 'ai' | 'user', text: string }> = ({ sender, text }) => (
  <div className={`flex gap-3 ${sender === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${sender === 'ai' ? 'bg-primary-container text-primary-onContainer' : 'bg-secondary-container text-secondary-onContainer'}`}>
      <Icon name={sender === 'ai' ? 'smart_toy' : 'person'} size="sm" />
    </div>
    <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${sender === 'ai'
      ? 'bg-surface-variant text-[var(--md-sys-color-on-background)] rounded-tl-none'
      : 'bg-primary text-white rounded-tr-none'
      }`}>
      {text}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onLogout, userId, onNavigate }) => {
  // Mobile-specific state to switch between Form and Chat views
  const [mobileView, setMobileView] = useState<'form' | 'chat'>('form');

  // Initial state is empty, waiting for Firestore
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    jobTitle: "",
    bio: "",
    location: "",
    email: "",
    skills: [],
    experiences: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Logic State for Profile View
  const [activeCategory, setActiveCategory] = useState<OptimizationCategory>('experience');
  const [messages, setMessages] = useState<{ id: number, sender: 'ai' | 'user', text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- WORKSPACE SYNC ---
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      const unsubscribe = listenWorkspaceByUser(
        userId,
        (data) => {
          setIsLoading(false);
          if (data && data.profile) {
            setProfile(prev => ({
              ...prev,
              ...data.profile,
            }));

            // Set initial welcome message only if empty
            setMessages(prev => {
              if (prev.length > 0) return prev;
              const name = data.profile.fullName ? data.profile.fullName.split(' ')[0] : 'User';
              return [{
                id: 1,
                sender: 'ai',
                text: `Welcome back, ${name}. I'm ready to audit your profile. Select a category on the top right to focus our session.`
              }];
            });
          } else {
            // Default welcome if no profile data yet
            setMessages(prev => {
              if (prev.length > 0) return prev;
              return [{ id: 1, sender: 'ai', text: "Welcome! I'm ready to help you build your profile. Let's start by adding some details." }];
            });
          }
        },
        (error) => {
          console.error("Workspace sync error:", error);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user' as const, text };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsThinking(true);

    // Simulate AI Response (Placeholder for real AI integration)
    setTimeout(() => {
      const categoryConfig = CATEGORY_CONFIG[activeCategory];
      const responseText = `[${categoryConfig.label} Mode]: I've analyzed that input. (AI Integration Pending)`;

      setIsThinking(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: responseText }]);
    }, 1200);
  };

  useEffect(() => {
    if (mobileView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, mobileView]);

  return (
    // UX: Use dvh (dynamic viewport height) for mobile browsers to avoid address bar hiding content
    <div className="min-h-screen h-[100dvh] bg-surface-variant dark:bg-surface-darkVariant flex flex-col relative overflow-hidden">

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          userKey={userId || profile.email || ""}
        />
      )}

      {/* Top Bar - Simplified for Mobile */}
      <header className="bg-[var(--md-sys-color-background)] px-4 py-2 md:py-3 shadow-sm flex items-center justify-between sticky top-0 z-20 shrink-0 border-b border-outline-variant/10">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Icon name="diversity_3" className="text-primary text-xl md:text-2xl shrink-0" />
          <h1 className="font-display text-base md:text-lg font-medium truncate">
            Profile
          </h1>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant="text"
            icon="settings"
            onClick={() => setIsSettingsOpen(true)}
            className="!p-2 !h-10 !w-10 rounded-full min-w-0"
            title="Settings"
            aria-label="Open Settings"
          />
          <Button
            variant="text"
            icon="logout"
            onClick={onLogout}
            className="!p-2 !h-10 !w-10 rounded-full min-w-0 text-error hover:bg-error/10 hover:text-error"
            title="Logout"
            aria-label="Logout"
          />
        </div>
      </header>

      {/* Main Content Area - Scroll handling logic updated for mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-0 md:p-6 lg:p-8 flex flex-col h-full overflow-hidden relative">

        {/* Mobile Tab (View Switcher) - Floating Segmented Button */}
        <div className="md:hidden px-4 py-2 bg-[var(--md-sys-color-background)] border-b border-outline-variant/10 z-10 sticky top-0">
          <div className="flex p-1 bg-surface-variant rounded-full" role="tablist">
            <button
              onClick={() => { setMobileView('form'); }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${mobileView === 'form' ? 'bg-white shadow-sm text-primary' : 'text-outline'}`}
            >
              Profile
            </button>
            <button
              onClick={() => { setMobileView('chat'); }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${mobileView === 'chat' ? 'bg-white shadow-sm text-primary' : 'text-outline'}`}
            >
              AI Audit
            </button>
          </div>
        </div>

        <div id="panel-profile" role="tabpanel" className="flex flex-col h-full overflow-hidden relative">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 animate-fade-in flex-1 min-h-0 pb-0 md:pb-2">

            {/* LEFT COLUMN: Data Entry */}
            <div className={`lg:col-span-7 flex flex-col gap-4 md:gap-6 overflow-y-auto px-4 md:px-0 custom-scrollbar pb-24 md:pb-0 ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>

              {/* Profile Header Card */}
              <Card variant="elevated" className="p-4 md:p-6 mt-4 md:mt-0">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 min-w-0">
                    {/* Avatar or Placeholder */}
                    {profile.fullName ? (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-xl md:text-2xl font-bold shrink-0" aria-hidden="true">
                        {profile.fullName.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-surface-variant border border-outline-variant/20 flex items-center justify-center text-outline shrink-0 animate-pulse">
                        <Icon name="person" size="md" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {isLoading ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-6 bg-surface-variant rounded w-3/4"></div>
                          <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-lg md:text-xl font-normal font-display truncate">
                            {profile.fullName || "Your Name"}
                          </h2>
                          <p className="text-primary font-medium text-sm md:text-base truncate">
                            {profile.jobTitle || "Add your job title"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-outline mt-1 truncate">
                            <Icon name="location_on" size="sm" />
                            {profile.location || "Add location"}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outlined" size="sm" icon="edit" className="!rounded-full !px-0 !w-10 shrink-0" aria-label="Edit Profile" />
                </div>

                <div className="mt-4 p-3 bg-surface-variant/50 rounded-xl text-sm text-[var(--md-sys-color-on-background)] leading-relaxed min-h-[60px]">
                  {isLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-surface-variant rounded w-full"></div>
                      <div className="h-3 bg-surface-variant rounded w-5/6"></div>
                    </div>
                  ) : (
                    profile.bio || "Add a short bio to introduce yourself."
                  )}
                </div>
              </Card>

              {/* CV Analysis Quick Access */}
              <Card variant="outlined" className="p-4 md:p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group" onClick={() => onNavigate?.('cv-analysis')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon name="auto_awesome" size="md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--md-sys-color-on-background)] mb-1">Análisis Profesional de CV</h3>
                    <p className="text-xs text-outline">Donna te ayudará a mejorar tu currículum con IA</p>
                  </div>
                  <Icon name="arrow_forward" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>

              {/* Experience & Skills */}
              <Card variant="elevated" className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                    <Icon name="work_history" className="text-blue-600" />
                    Experience
                  </h3>
                  <Button variant="filled" size="sm" icon="add" className="!rounded-full !px-0 !w-8 !h-8" />
                </div>
                <div className="space-y-3">
                  {profile.experiences && profile.experiences.length > 0 ? (
                    profile.experiences.map((exp, i) => (
                      <ExperienceCard key={i} {...exp} active={activeCategory === 'experience' && i === 0} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-outline border border-dashed border-outline-variant/50 rounded-lg">
                      <p className="text-sm">No experience added yet.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card variant="elevated" className="p-4 md:p-6 mb-safe">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                    <Icon name="psychology" className="text-purple-600" />
                    Skills
                  </h3>
                  <Button variant="text" size="sm">Edit</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-surface-variant border border-outline-variant/50 text-sm font-medium text-[var(--md-sys-color-on-background)]">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-outline italic py-2">No skills added yet.</div>
                  )}
                  <Button variant="outlined" size="sm" icon="add" className="border-dashed">Add</Button>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: AI Copilot */}
            <Card
              variant="elevated"
              padding="none"
              className={`lg:col-span-5 flex flex-col h-full overflow-hidden border-none md:border border-outline-variant/20 shadow-none md:shadow-elevation-1 rounded-none md:rounded-[24px] bg-[var(--md-sys-color-background)] ${mobileView === 'form' ? 'hidden lg:flex' : 'flex'}`}
            >
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-outline-variant/20 bg-surface-variant/30 sticky top-0 z-10">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist">
                  {(Object.keys(CATEGORY_CONFIG) as OptimizationCategory[]).map(cat => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${activeCategory === cat
                        ? 'bg-secondary-container text-secondary-onContainer border-transparent'
                        : 'bg-transparent border-outline text-outline hover:bg-surface-variant'
                        }`}
                    >
                      <Icon name={CATEGORY_CONFIG[cat].icon} size="sm" />
                      {CATEGORY_CONFIG[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat History - Needs padding at bottom for input */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--md-sys-color-background)] pb-32" aria-live="polite">
                {messages.map((msg: any) => (
                  <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} />
                ))}
                {isThinking && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                      <Icon name="sync" size="sm" className="animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-variant rounded-tl-none">
                      <span className="sr-only">AI is thinking...</span>
                      <div className="flex gap-1 h-2 items-center">
                        <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input Area - Floating & Blur for Mobile Space */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-[var(--md-sys-color-background)]/90 backdrop-blur-md border-t border-outline-variant/20 z-20 pb-safe">

                {/* Suggestions Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                  {CATEGORY_CONFIG[activeCategory].suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-3 py-1 rounded-lg bg-surface-variant border border-outline-variant/50 text-[11px] font-medium text-primary whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Ask about ${CATEGORY_CONFIG[activeCategory].label}...`}
                      className="w-full h-12 pl-4 pr-12 rounded-full bg-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                      disabled={isThinking}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isThinking}
                      className="absolute right-1 top-1 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:bg-surface-variant disabled:text-outline transition-all hover:shadow-md active:scale-90"
                    >
                      <Icon name="arrow_upward" size="sm" />
                    </button>
                  </div>
                </div>
              </div>

            </Card>
          </div>
        </div>

      </main>
    </div>
  );
};
