import React, { useState, useRef, useEffect } from 'react';
import { AITrainingView } from './AITrainingView';
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
}

const DEFAULT_PROFILE: ProfileData = {
    fullName: "Alex Morgan",
    jobTitle: "Senior Product Designer",
    bio: "Passionate about creating accessible and inclusive user experiences.",
    location: "San Francisco, CA",
    email: "alex.morgan@example.com"
};

type OptimizationCategory = 'experience' | 'skills' | 'education' | 'projects';

interface CandidateDashboardProps {
    onLogout: () => void;
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
        // UX: Group focus within enables buttons to show when focused via keyboard
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
        <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
            sender === 'ai' 
            ? 'bg-surface-variant text-[var(--md-sys-color-on-background)] rounded-tl-none' 
            : 'bg-primary text-white rounded-tr-none'
        }`}>
            {text}
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'training'>('profile');
    
    // Mobile-specific state to switch between Form and Chat views
    const [mobileView, setMobileView] = useState<'form' | 'chat'>('form');
    
    const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Logic State for Profile View
    const [activeCategory, setActiveCategory] = useState<OptimizationCategory>('experience');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Welcome back, Alex. I'm ready to audit your profile. Select a category on the top right to focus our session." }
    ]);
    const [inputText, setInputText] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Mock Data
    const experiences = [
        { role: "Senior Product Designer", company: "TechFlow", period: "2020 - Present", desc: "Led the design system migration reducing dev time by 30%." },
        { role: "UX Designer", company: "Creative Sol", period: "2018 - 2020", desc: "Designed mobile-first interfaces for fintech clients." }
    ];

    const handleSendMessage = async (text: string = inputText) => {
        if (!text.trim()) return;
        
        const newMsg = { id: Date.now(), sender: 'user', text };
        // @ts-ignore
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setIsThinking(true);

        // Simulate AI Response
        setTimeout(() => {
            const categoryConfig = CATEGORY_CONFIG[activeCategory];
            const responseText = `[${categoryConfig.label} Mode]: I've analyzed that input. Consider quantifying your impact more. For example, instead of "Led design", try "Spearheaded design initiatives resulting in X% growth."`;
            
            setIsThinking(false);
            // @ts-ignore
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
                    userKey={profile.email || "demo-user"}
                />
            )}

            {/* Top Bar */}
            <header className="bg-[var(--md-sys-color-background)] px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <Icon name="diversity_3" className="text-primary text-xl md:text-2xl shrink-0" />
                    <h1 className="font-display text-base md:text-lg font-medium truncate">Candidate Portal</h1>
                </div>
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/50 mr-2">
                        <span className="text-xs font-bold text-secondary-onContainer">Profile Strength</span>
                        <div className="w-16 h-2 bg-white rounded-full overflow-hidden" role="progressbar" aria-valuenow={70} aria-valuemin={0} aria-valuemax={100} aria-label="Profile Strength 70%">
                            <div className="h-full bg-green-500 w-[70%]"></div>
                        </div>
                    </div>
                    
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
            <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 lg:p-8 flex flex-col h-full overflow-hidden">
                
                {/* Main Tabs - Semantic Tablist */}
                <div className="flex border-b border-outline-variant mb-2 md:mb-4 shrink-0 px-2" role="tablist" aria-label="Dashboard Views">
                    <Button 
                        variant="text"
                        onClick={() => setActiveTab('profile')}
                        role="tab"
                        aria-selected={activeTab === 'profile'}
                        aria-controls="panel-profile"
                        className={`rounded-b-none rounded-t-lg border-b-2 flex-1 md:flex-none justify-center transition-colors focus-visible:ring-inset ${
                            activeTab === 'profile' 
                            ? 'border-primary text-primary bg-primary/5 font-medium' 
                            : 'border-transparent text-outline hover:text-[var(--md-sys-color-on-background)]'
                        }`}
                        icon="badge"
                    >
                        My Profile
                    </Button>
                    <Button 
                        variant="text"
                        onClick={() => setActiveTab('training')}
                        role="tab"
                        aria-selected={activeTab === 'training'}
                        aria-controls="panel-training"
                        className={`rounded-b-none rounded-t-lg border-b-2 flex-1 md:flex-none justify-center transition-colors focus-visible:ring-inset ${
                            activeTab === 'training' 
                            ? 'border-primary text-primary bg-primary/5 font-medium' 
                            : 'border-transparent text-outline hover:text-[var(--md-sys-color-on-background)]'
                        }`}
                        icon="model_training"
                    >
                        AI Coach
                    </Button>
                </div>

                {activeTab === 'profile' && (
                    <div id="panel-profile" role="tabpanel" className="flex flex-col h-full overflow-hidden">
                        
                        {/* Mobile View Toggle - Semantic Tablist for View Switching */}
                        <div className="lg:hidden mx-2 mb-3 shrink-0">
                            <div className="bg-surface-variant/50 p-1 rounded-full border border-outline-variant/50 flex relative shadow-inner" role="tablist" aria-label="Mobile View Switcher">
                                <div 
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-full shadow-sm transition-all duration-300 ease-out ${
                                        mobileView === 'chat' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                                    }`} 
                                    aria-hidden="true"
                                ></div>
                                <button 
                                    role="tab"
                                    aria-selected={mobileView === 'form'}
                                    onClick={() => setMobileView('form')}
                                    className={`flex-1 relative z-10 py-2 text-xs font-medium rounded-full flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                                        mobileView === 'form' ? 'text-primary font-bold' : 'text-outline'
                                    }`}
                                >
                                    <Icon name="edit_note" size={16} filled={mobileView === 'form'} />
                                    Edit Data
                                </button>
                                <button 
                                    role="tab"
                                    aria-selected={mobileView === 'chat'}
                                    onClick={() => setMobileView('chat')}
                                    className={`flex-1 relative z-10 py-2 text-xs font-medium rounded-full flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                                        mobileView === 'chat' ? 'text-primary font-bold' : 'text-outline'
                                    }`}
                                >
                                    <Icon name="smart_toy" size={16} filled={mobileView === 'chat'} />
                                    AI Auditor
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 animate-fade-in flex-1 min-h-0 px-2 pb-2">
                            
                            {/* LEFT COLUMN: Data Entry & Display */}
                            <div className={`lg:col-span-7 flex flex-col gap-4 md:gap-6 overflow-y-auto pr-1 custom-scrollbar pb-20 ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
                                
                                {/* Profile Header Card */}
                                <Card variant="elevated" className="p-4 md:p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 min-w-0">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center text-xl md:text-2xl font-bold shrink-0" aria-hidden="true">
                                                {profile.fullName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg md:text-xl font-normal font-display truncate" title={profile.fullName}>{profile.fullName}</h2>
                                                <p className="text-primary font-medium text-sm md:text-base truncate">{profile.jobTitle}</p>
                                                <div className="flex items-center gap-2 text-xs text-outline mt-1 truncate">
                                                    <Icon name="location_on" size="sm" />
                                                    {profile.location}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outlined" size="sm" icon="edit" className="!rounded-full !px-0 !w-10 shrink-0" aria-label="Edit Profile" />
                                    </div>
                                    <div className="mt-4 p-3 bg-surface-variant/50 rounded-xl text-sm text-[var(--md-sys-color-on-background)] leading-relaxed">
                                        {profile.bio}
                                    </div>
                                </Card>

                                {/* Section: Experience */}
                                <Card variant="elevated" className="p-4 md:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                                            <Icon name="work_history" className="text-blue-600" />
                                            Experience
                                        </h3>
                                        <Button variant="filled" size="sm" icon="add" className="!rounded-full !px-0 !w-8 !h-8" aria-label="Add Experience" />
                                    </div>
                                    <div className="space-y-3">
                                        {experiences.map((exp, i) => (
                                            <ExperienceCard key={i} {...exp} active={activeCategory === 'experience' && i === 0} />
                                        ))}
                                    </div>
                                </Card>

                                {/* Section: Skills */}
                                <Card variant="elevated" className="p-4 md:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                                            <Icon name="psychology" className="text-purple-600" />
                                            Skills
                                        </h3>
                                        <Button variant="text" size="sm">Edit All</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'TypeScript', 'Node.js', 'Figma', 'System Design', 'Accessibility'].map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg bg-surface-variant border border-outline-variant/50 text-sm font-medium text-[var(--md-sys-color-on-background)] hover:bg-secondary-container hover:text-secondary-onContainer transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                        <Button variant="outlined" size="sm" icon="add" className="border-dashed">Add</Button>
                                    </div>
                                </Card>

                            </div>

                            {/* RIGHT COLUMN: AI Copilot */}
                            <Card 
                                variant="elevated" 
                                padding="none" 
                                className={`lg:col-span-5 flex flex-col h-full overflow-hidden border border-outline-variant/20 ${mobileView === 'form' ? 'hidden lg:flex' : 'flex'}`}
                            >
                                
                                {/* Chat Header & Category Selector */}
                                <div className="p-3 md:p-4 border-b border-outline-variant/20 bg-surface-variant/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon name="auto_awesome" className="text-primary" />
                                        <span className="font-bold text-sm uppercase tracking-wide text-primary">Profile Auditor</span>
                                    </div>
                                    
                                    {/* Horizontal Scroll Categories */}
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Audit Categories">
                                        {(Object.keys(CATEGORY_CONFIG) as OptimizationCategory[]).map(cat => (
                                            <button
                                                key={cat}
                                                role="tab"
                                                aria-selected={activeCategory === cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border focus-visible:ring-2 focus-visible:ring-primary ${
                                                    activeCategory === cat 
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

                                {/* Chat History */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--md-sys-color-background)]" aria-live="polite">
                                    {messages.map((msg: any) => (
                                        <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} />
                                    ))}
                                    {isThinking && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                                                <Icon name="sync" size="sm" className="animate-spin" />
                                            </div>
                                            <div className="p-3 rounded-2xl bg-surface-variant rounded-tl-none">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce delay-100"></span>
                                                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce delay-200"></span>
                                                </div>
                                                <span className="sr-only">AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef}></div>
                                </div>

                                {/* Suggestions */}
                                <div className="px-4 py-2 bg-surface-variant/30 overflow-x-auto no-scrollbar flex gap-2 border-t border-outline-variant/10 shrink-0">
                                    {CATEGORY_CONFIG[activeCategory].suggestions.map((suggestion, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="px-3 py-1 rounded-lg bg-[var(--md-sys-color-background)] border border-outline-variant text-[11px] font-medium text-primary hover:bg-primary-container transition-colors whitespace-nowrap shadow-sm flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>

                                {/* Input Area - Sticky Bottom with safe area padding */}
                                <div className="p-3 md:p-4 bg-[var(--md-sys-color-background)] border-t border-outline-variant/20 shrink-0 pb-safe">
                                    <Input 
                                        label={`Ask about your ${CATEGORY_CONFIG[activeCategory].label.toLowerCase()}...`}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        endIcon="arrow_upward"
                                        onEndIconClick={() => handleSendMessage()}
                                        className="!rounded-full"
                                        disabled={isThinking}
                                        aria-label="Message to AI Auditor"
                                    />
                                </div>

                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <Card id="panel-training" role="tabpanel" variant="elevated" className="p-4 md:p-8 animate-fade-in border border-outline-variant/20 flex-1 overflow-y-auto mx-2 mb-2">
                        <AITrainingView onBack={() => setActiveTab('profile')} onComplete={() => {}} isDashboard={true} />
                    </Card>
                )}

            </main>
        </div>
    );
};