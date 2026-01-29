import React, { useState, useRef, useEffect } from 'react';
import { AITrainingView } from './AITrainingView';
import { InterviewSimulator } from './InterviewSimulator';

type DashboardView = 'profile' | 'ai-training' | 'settings' | 'interview-simulator';
type SettingsTab = 'account' | 'privacy' | 'notifications' | 'avatar-prefs' | 'training-data';
type AIChatMode = 'optimizer' | 'interviewer' | 'market';

interface CandidateDashboardProps {
    onLogout: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<DashboardView>('profile');
  const [showNotification, setShowNotification] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation Logic
  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  const toggleNotifications = () => {
      setShowNotification(!showNotification);
      if (!showNotification) {
          setTimeout(() => setShowNotification(false), 3000);
      }
  };

  return (
    <div className="relative z-20 flex flex-col w-full h-screen bg-[#020408] overflow-hidden animate-fade-in">
        
        {/* APP HEADER */}
        <header className="h-16 border-b border-slate-800 bg-[#050b14]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-10 shrink-0 z-30 relative">
            <div className="flex items-center gap-4 lg:gap-12">
                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-slate-400 hover:text-white p-1"
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('profile')}>
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-lg">A</div>
                    <span className="text-xl font-bold text-white tracking-tight hidden sm:block">AnPortafolioIA</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    <NavButton label="Profile" active={activeView === 'profile'} onClick={() => handleViewChange('profile')} icon="id_card" />
                    <NavButton label="Simulator" active={activeView === 'interview-simulator'} onClick={() => handleViewChange('interview-simulator')} icon="videocam" />
                    <NavButton label="AI Agent" active={activeView === 'ai-training'} onClick={() => handleViewChange('ai-training')} icon="smart_toy" />
                    <NavButton label="Settings" active={activeView === 'settings'} onClick={() => handleViewChange('settings')} icon="settings" />
                </nav>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                {/* Profile Completion - Desktop Only */}
                <div className="hidden lg:flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Completion</span>
                    <span className="text-[10px] font-bold text-purple-400">65%</span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[65%]"></div>
                    </div>
                </div>

                <div className="h-6 w-px bg-slate-800 hidden lg:block"></div>

                {/* User Actions */}
                <div className="flex items-center gap-3 lg:gap-4">
                    <button onClick={toggleNotifications} className="text-slate-400 hover:text-white relative p-2 rounded-full hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050b14]"></span>
                    </button>
                    <img 
                        onClick={() => handleViewChange('settings')}
                        src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" 
                        className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-slate-600 object-cover cursor-pointer hover:border-purple-500 transition-colors" 
                        alt="User" 
                    />
                    <button 
                        onClick={onLogout}
                        className="hidden lg:flex p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined">power_settings_new</span>
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {showNotification && (
                <div className="absolute top-16 right-4 lg:right-6 w-72 lg:w-80 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl animate-fade-in z-50">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm">campaign</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">New Interview Invite</h4>
                            <p className="text-xs text-slate-400 mt-1">TechCorp Inc. has invited you to a technical screening.</p>
                        </div>
                    </div>
                </div>
            )}
        </header>

        {/* MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-[#050b14]/95 backdrop-blur-xl border-b border-slate-800 z-40 p-4 md:hidden animate-fade-in flex flex-col gap-2 shadow-2xl">
                <MobileNavItem label="Profile" active={activeView === 'profile'} onClick={() => handleViewChange('profile')} icon="id_card" />
                <MobileNavItem label="Simulator" active={activeView === 'interview-simulator'} onClick={() => handleViewChange('interview-simulator')} icon="videocam" />
                <MobileNavItem label="AI Agent" active={activeView === 'ai-training'} onClick={() => handleViewChange('ai-training')} icon="smart_toy" />
                <MobileNavItem label="Settings" active={activeView === 'settings'} onClick={() => handleViewChange('settings')} icon="settings" />
                <div className="h-px bg-slate-800 my-2"></div>
                <button 
                    onClick={onLogout}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 text-red-400 hover:bg-red-500/10"
                >
                    <span className="material-symbols-outlined text-xl">power_settings_new</span>
                    Log Out
                </button>
            </div>
        )}

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#020408] to-[#020408]">
            {activeView === 'settings' ? (
                // Settings has its own layout structure
                <div className="w-full min-h-full">
                    <SettingsView onLogout={onLogout} />
                </div>
            ) : activeView === 'interview-simulator' ? (
                // Interview Simulator takes full height
                <div className="w-full h-full">
                    <InterviewSimulator onBack={() => setActiveView('profile')} />
                </div>
            ) : (
                // Other views use the standard centered container
                <div className="max-w-7xl mx-auto flex flex-col gap-6 p-4 lg:p-10 min-h-full pb-20">
                    
                    {/* VIEW: PROFILE (DEFAULT) */}
                    {activeView === 'profile' && <ProfileView />}

                    {/* VIEW: AI TRAINING */}
                    {activeView === 'ai-training' && (
                        <div className="flex-1 flex flex-col h-full animate-fade-in">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-white mb-2">AI Neural Core</h1>
                                <p className="text-slate-400 text-sm">Re-calibrate your agent's responses and personality traits.</p>
                            </div>
                            <div className="flex-1 bg-[#0a101f]/50 border border-slate-800 rounded-3xl overflow-hidden p-4 lg:p-6">
                                <AITrainingView 
                                    onBack={() => setActiveView('profile')} 
                                    onComplete={() => {
                                        setActiveView('profile');
                                    }} 
                                    isDashboard={true}
                                />
                            </div>
                        </div>
                    )}
                    
                </div>
            )}
        </main>
    </div>
  )
}

// --- SUB-COMPONENTS ---

const NavButton: React.FC<{label: string, active: boolean, onClick: () => void, icon: string}> = ({label, active, onClick, icon}) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${active ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
    >
        <span className={`material-symbols-outlined text-base ${active ? 'text-purple-400' : ''}`}>{icon}</span>
        {label}
    </button>
)

const MobileNavItem: React.FC<{label: string, active: boolean, onClick: () => void, icon: string}> = ({label, active, onClick, icon}) => (
    <button 
        onClick={onClick}
        className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${active ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-800/30'}`}
    >
        <span className={`material-symbols-outlined text-xl ${active ? 'text-purple-400' : ''}`}>{icon}</span>
        {label}
    </button>
)

const ProfileView: React.FC = () => {
    // Chat & Logic State
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hi Alex! I've analyzed your TechFlow experience. Your leadership on the Design System is a strong asset. Shall we optimize your profile description?" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [chatMode, setChatMode] = useState<AIChatMode>('optimizer');
    const [quickReplies, setQuickReplies] = useState<string[]>(["Yes, optimize it", "Analyze my skills", "Not now"]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // AI Logic Engine
    const generateAIResponse = (input: string, mode: AIChatMode): { text: string, replies: string[] } => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('salary') || lowerInput.includes('rate') || lowerInput.includes('money')) {
            return {
                text: "Based on recent placements for Senior Product Designers in SF, the base salary range is $165k - $195k. Your current profile suggests you could target the upper end due to your System Design experience.",
                replies: ["How do I negotiate?", "Show market data", "Update my expected salary"]
            };
        }

        if (lowerInput.includes('optimize') || lowerInput.includes('improve') || lowerInput.includes('better')) {
            return {
                text: "I've rephrased your 'TechFlow' description to emphasize impact: 'Architected a scalable Design System reducing dev handoff time by 40%'. Would you like to apply this change?",
                replies: ["Apply changes", "Try another variation", "Keep original"]
            };
        }

        if (lowerInput.includes('skill') || lowerInput.includes('react') || lowerInput.includes('figma')) {
            return {
                text: "React and Figma are your top-performing keywords. Adding 'Prototyping' or 'Motion Design' could increase your match rate for Senior roles by 12%.",
                replies: ["Add Prototyping", "Analyze gaps", "I'm not a motion designer"]
            };
        }

        if (lowerInput.includes('interview') || lowerInput.includes('practice')) {
            return {
                text: "I can simulate a Behavioral Interview right now. I'll act as a Recruiter from a Fintech company. Ready to start?",
                replies: ["Start Simulation", "What questions will they ask?", "Maybe later"]
            };
        }

        if (mode === 'interviewer') {
            return {
                text: "Let's focus on your STAR method. Can you describe a time you disagreed with a Product Manager?",
                replies: ["I have an example", "Give me a tip first", "Skip question"]
            };
        }
        
        if (mode === 'market') {
            return {
                text: "The job market for Designers is active. I see 14 open roles matching your profile today. Most require Design System experience.",
                replies: ["Show roles", "Auto-apply to top 3", "Refine criteria"]
            };
        }

        return {
            text: "I understand. Is there anything specific about your profile, skills, or upcoming interviews you'd like to discuss?",
            replies: ["Analyze my resume", "Mock Interview", "Market Trends"]
        };
    };

    const handleSendMessage = (text: string = inputText) => {
        if (!text.trim()) return;
        
        // Add User Message
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: text }]);
        setInputText("");
        setIsThinking(true);
        setQuickReplies([]); // Clear old replies while thinking

        // Simulate AI Latency
        const thinkingTime = Math.random() * 1000 + 1000; // 1-2 seconds

        setTimeout(() => {
            const response = generateAIResponse(text, chatMode);
            setIsThinking(false);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                sender: 'ai', 
                text: response.text 
            }]);
            setQuickReplies(response.replies);
        }, thinkingTime);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const handleAddSkill = () => {
        const result = window.prompt("Enter new skill:");
        if (result) {
            handleSendMessage(`I just added the skill: ${result}`);
        }
    };

    return (
    <>
        {/* Profile Header Card */}
        <div className="flex flex-col md:flex-row gap-6 p-6 rounded-3xl bg-[#0a101f] border border-slate-700/50 items-start md:items-center shadow-2xl relative overflow-hidden group animate-fade-in">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-900/30 transition-all duration-1000"></div>

                {/* Avatar & Info */}
                <div className="relative shrink-0 flex flex-row md:flex-col items-center gap-4 md:gap-0">
                    <div className="p-1 rounded-[1.2rem] bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700/50 relative">
                        <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" alt="Profile" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover" />
                        <button className="absolute bottom-[-6px] right-[-6px] p-2 bg-slate-800 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-700 transition-colors cursor-pointer shadow-lg z-10" onClick={() => alert("Edit Profile Modal")}>
                            <span className="material-symbols-outlined text-[14px] text-white block">edit</span>
                        </button>
                    </div>
                </div>

                {/* Info Content ... */}
                <div className="flex-1 min-w-0 relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">Alex Chen</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                    <span className="text-cyan-400 font-bold">Senior Product Designer</span> 
                    <span className="text-slate-600 hidden md:inline">|</span> 
                    <span className="text-indigo-400 font-bold block md:inline w-full md:w-auto">5 YOE</span>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span> San Francisco, CA</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">mail</span> alex.chen@design.co</span>
                    </div>
                </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start h-full animate-fade-in">
            {/* Left Column: Experience & Skills */}
            <div className="flex-1 w-full space-y-6">
                
                {/* Experience Section */}
                <div className="bg-[#0f1623]/50 border border-slate-800/50 rounded-3xl p-1">
                    <div className="flex items-center justify-between mb-2 p-4 md:p-5 pb-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">work</span> Experience
                        </h3>
                        <button onClick={() => alert("Add Experience Modal")} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">add</span></button>
                    </div>
                    {/* Cards */}
                    <div className="space-y-1 p-2">
                        <ExperienceCard 
                        role="Senior Product Designer" 
                        company="TechFlow Inc." 
                        period="Jan 2020 - Present • 4 yrs 3 mos" 
                        desc="Leading the design system initiative and managing a team of 3 junior designers. Spearheaded the redesign of the core dashboard increasing user retention by 15% through data-driven UX improvements."
                        logo="TF"
                        color="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        active={true}
                        />
                        <ExperienceCard 
                        role="Product Designer" 
                        company="Acme Corp" 
                        period="Jun 2018 - Dec 2019 • 1 yr 7 mos" 
                        desc="Designed mobile-first experiences for e-commerce clients. Collaborated closely with engineering to implement pixel-perfect UIs and accessible components."
                        logo="A"
                        color="bg-slate-800 text-slate-400 border border-slate-700"
                        active={false}
                        />
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-[#0f1623]/50 border border-slate-800/50 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><span className="material-symbols-outlined text-purple-400">auto_awesome</span> Skills & Proficiency</h3>
                        <button onClick={() => alert("Edit Skills Modal")} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">edit</span></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <SkillBar name="Figma" level="Expert" progress={95} color="bg-blue-500" />
                        <SkillBar name="React / Tailwind" level="Advanced" progress={85} color="bg-purple-500" />
                        <SkillBar name="UX Research" level="Expert" progress={90} color="bg-blue-500" />
                        <SkillBar name="Design Systems" level="Expert" progress={92} color="bg-blue-500" />
                        <SkillBar name="Prototyping" level="Advanced" progress={80} color="bg-purple-500" />
                        
                        <button onClick={handleAddSkill} className="col-span-1 md:col-span-2 mt-4 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm font-bold hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2 hover:bg-slate-800/30">
                            <span className="material-symbols-outlined text-base">add</span> Add Skill
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Chat (TalentFlow AI) */}
            <div className="w-full lg:w-[400px] flex flex-col bg-[#0f1623] border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shrink-0 h-[600px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-0 transition-all duration-300">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700/50 bg-[#0f1623] flex flex-col gap-3 z-10 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-colors duration-500 ${chatMode === 'optimizer' ? 'from-indigo-500 to-purple-600' : chatMode === 'interviewer' ? 'from-green-500 to-teal-600' : 'from-orange-500 to-red-600'}`}>
                                <span className="material-symbols-outlined text-white text-xl">
                                    {chatMode === 'optimizer' ? 'smart_toy' : chatMode === 'interviewer' ? 'record_voice_over' : 'query_stats'}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white leading-none">TalentFlow AI</h4>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${chatMode === 'optimizer' ? 'bg-purple-400' : chatMode === 'interviewer' ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                                    <span className={`text-[10px] font-bold tracking-wider uppercase ${chatMode === 'optimizer' ? 'text-purple-400' : chatMode === 'interviewer' ? 'text-green-400' : 'text-orange-400'}`}>
                                        {chatMode === 'optimizer' ? 'Profile Optimizer' : chatMode === 'interviewer' ? 'Mock Interviewer' : 'Market Analyst'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setMessages([{ id: Date.now(), sender: 'ai', text: "Chat cleared. How can I help you now?" }])} className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800"><span className="material-symbols-outlined text-lg">refresh</span></button>
                    </div>
                    
                    {/* Mode Selector */}
                    <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
                        <button onClick={() => setChatMode('optimizer')} className={`flex-1 py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${chatMode === 'optimizer' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                             <span className="material-symbols-outlined text-sm">auto_fix_high</span> Optimize
                        </button>
                        <button onClick={() => setChatMode('interviewer')} className={`flex-1 py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${chatMode === 'interviewer' ? 'bg-slate-800 text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                             <span className="material-symbols-outlined text-sm">mic</span> Prep
                        </button>
                        <button onClick={() => setChatMode('market')} className={`flex-1 py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${chatMode === 'market' ? 'bg-slate-800 text-orange-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                             <span className="material-symbols-outlined text-sm">trending_up</span> Market
                        </button>
                    </div>
                </div>

                {/* Context Bar ... */}
                <div className="px-5 py-2 bg-[#0a101f] border-b border-slate-700/30 flex items-center justify-between z-10 relative shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        <span className="material-symbols-outlined text-xs">target</span>
                        Focus: <span className="text-white">TechFlow Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-4 bg-slate-800 border border-slate-700 rounded-full relative cursor-pointer">
                            <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-5 space-y-6 overflow-y-auto bg-gradient-to-b from-[#0a101f] to-[#0f1623] custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 shadow-lg ${chatMode === 'optimizer' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' : chatMode === 'interviewer' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-orange-900/30 text-orange-400 border-orange-500/30'}`}>
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                </div>
                            )}
                            {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-600 shadow-md">
                                    <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className={`p-3.5 text-sm leading-relaxed shadow-lg max-w-[80%] ${
                                msg.sender === 'ai' 
                                ? 'bg-slate-800/90 backdrop-blur-sm rounded-2xl rounded-tl-sm text-slate-200 border border-slate-700/50' 
                                : 'bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl rounded-tr-sm text-white border border-white/10'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    
                    {isThinking && (
                        <div className="flex gap-4 animate-fade-in">
                             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 mt-1">
                                <span className="material-symbols-outlined text-sm text-slate-500">more_horiz</span>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-2xl rounded-tl-sm flex gap-1 items-center border border-slate-800">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50 bg-[#0f1623] relative z-10">
                    {/* Dynamic Quick Replies */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar min-h-[32px]">
                        {quickReplies.map((reply, i) => (
                             <button 
                                key={i} 
                                onClick={() => handleSendMessage(reply)} 
                                disabled={isThinking}
                                className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-lg text-[10px] text-slate-300 font-bold transition-all animate-fade-in active:scale-95 disabled:opacity-50"
                             >
                                {reply}
                             </button>
                        ))}
                    </div>

                    <div className="bg-[#0a101f] rounded-2xl p-1.5 flex gap-2 border border-slate-700 focus-within:border-purple-500/50 transition-colors shadow-inner">
                        <input 
                            className="bg-transparent flex-1 text-sm text-white px-4 py-3 outline-none placeholder-slate-600" 
                            placeholder={isThinking ? "AI is typing..." : "Ask about your profile..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isThinking}
                        />
                        <div className="flex items-center gap-1 pr-1">
                            <button className="p-2.5 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800"><span className="material-symbols-outlined text-xl">mic</span></button>
                            <button onClick={() => handleSendMessage()} disabled={!inputText.trim() || isThinking} className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-white transition-colors shadow-lg"><span className="material-symbols-outlined text-xl">send</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
)}

const SettingsView: React.FC<{onLogout: () => void}> = ({onLogout}) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    return (
        <div className="flex flex-col lg:flex-row w-full h-full animate-fade-in relative">
            
            {/* Mobile Settings Nav */}
            <div className="lg:hidden w-full overflow-x-auto p-4 border-b border-slate-800 flex gap-2 no-scrollbar bg-[#050b14]">
                {['account', 'privacy', 'notifications', 'avatar-prefs', 'training-data'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as SettingsTab)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Desktop Settings Sidebar */}
            <aside className="w-64 flex-col border-r border-slate-800 hidden lg:flex bg-[#050b14]/50 shrink-0">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Settings</h2>
                    <nav className="space-y-1">
                        <SettingsNavItem label="Account" icon="person" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
                        <SettingsNavItem label="Privacy" icon="lock" active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} />
                        <SettingsNavItem label="Notifications" icon="notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    </nav>

                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4">AI & Avatar</h2>
                    <nav className="space-y-1">
                        <SettingsNavItem label="Avatar Preferences" icon="face" active={activeTab === 'avatar-prefs'} onClick={() => setActiveTab('avatar-prefs')} />
                        <SettingsNavItem label="AI Training Data" icon="model_training" active={activeTab === 'training-data'} onClick={() => setActiveTab('training-data')} />
                    </nav>
                </div>
                
                <div className="mt-auto p-6 border-t border-slate-800">
                     <button onClick={onLogout} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-2 py-2 group">
                        <span className="material-symbols-outlined text-xl group-hover:text-red-400">power_settings_new</span>
                        <span className="text-sm font-bold group-hover:text-red-400">Log Out</span>
                     </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-10 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Account Settings</h1>
                    <p className="text-slate-400 text-sm mb-8">Manage your profile details and AI preferences.</p>

                    {/* Profile Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-[#0a101f] p-6 lg:p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl text-center md:text-left">
                         {/* Background Effects */}
                         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-900/20 to-indigo-900/20 blur-[80px] rounded-full pointer-events-none"></div>
                         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

                         {/* Avatar */}
                         <div className="relative shrink-0">
                             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                                 <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full rounded-full object-cover border-4 border-[#0a101f]" alt="Profile" />
                             </div>
                             <button className="absolute bottom-1 right-1 p-2 bg-slate-800 rounded-full border border-slate-700 text-white hover:bg-slate-700 transition-colors shadow-lg">
                                <span className="material-symbols-outlined text-sm block">edit</span>
                             </button>
                         </div>

                         {/* Info */}
                         <div className="flex-1 z-10">
                             <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                 <h2 className="text-2xl md:text-3xl font-bold text-white">Alex Chen</h2>
                                 <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Premium Member</span>
                             </div>
                             <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-6 mx-auto md:mx-0">
                                Senior Product Designer specializing in AI interfaces. Located in San Francisco, CA.
                             </p>
                             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                 <button onClick={() => alert("Public view link copied!")} className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                     <span className="material-symbols-outlined text-lg">visibility</span>
                                     Public View
                                 </button>
                             </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                        {/* Personal Information */}
                        <div className="bg-[#0a101f]/50 border border-slate-700/50 rounded-3xl p-6 lg:p-8 flex flex-col shadow-lg">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                                <div className="w-10 h-10 rounded-lg bg-cyan-900/20 flex items-center justify-center text-cyan-400">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">Personal Information</h3>
                            </div>

                            <div className="space-y-5 flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Full Name</label>
                                        <input type="text" defaultValue="Alex Chen" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Job Title</label>
                                        <input type="text" defaultValue="Product Designer" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Portfolio URL</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg">link</span>
                                        <input type="text" defaultValue="https://alexchen.design" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Bio</label>
                                    <textarea defaultValue="Passionate about building accessible and inclusive digital products." className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors h-32 resize-none" />
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all active:scale-95">Save Changes</button>
                            </div>
                        </div>

                        {/* Avatar Settings & Danger Zone */}
                        <div className="space-y-8">
                            {/* Avatar Settings */}
                            <div className="bg-[#0a101f]/50 border border-slate-700/50 rounded-3xl p-6 lg:p-8 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                                
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800 relative z-10">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-900/20 flex items-center justify-center text-indigo-400">
                                        <span className="material-symbols-outlined">face</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Avatar Settings</h3>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {/* Mini Preview */}
                                    <div className="w-full h-32 rounded-xl bg-slate-900 relative overflow-hidden border border-slate-700 group">
                                        <img src="https://www.shutterstock.com/image-illustration/animated-young-business-man-avatar-260nw-2574951157.jpg" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Avatar Model" />
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-white tracking-wider">AI ACTIVE</span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-slate-400">Model</p>
                                                <p className="text-xs font-bold text-white">v2.4</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Preview Mode</span>
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-200">Publicly Visible</span>
                                            <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-200">Allow AI Scouting</span>
                                            <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slider */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                            <span>Voice Pitch</span>
                                            <span className="text-cyan-400">Medium</span>
                                        </div>
                                        <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                                        <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-bold uppercase tracking-widest">
                                            <span>Deep</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-[#0a101f]/50 border border-red-500/20 rounded-3xl p-6 flex items-center justify-between group hover:border-red-500/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-red-500">warning</span>
                                    <span className="text-sm font-bold text-red-400">Danger Zone</span>
                                </div>
                                <button onClick={() => alert("Are you sure? This cannot be undone.")} className="text-xs font-bold text-red-500 hover:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SettingsNavItem: React.FC<{label: string, icon: string, active: boolean, onClick: () => void}> = ({label, icon, active, onClick}) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            active 
            ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 text-white' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-2 border-transparent'
        }`}
    >
        <span className={`material-symbols-outlined text-xl ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`}>{icon}</span>
        {label}
    </button>
)

const ExperienceCard: React.FC<{role: string, company: string, period: string, desc: string, logo: string, color: string, active: boolean}> = ({role, company, period, desc, logo, color, active}) => (
    <div className={`p-6 rounded-2xl transition-all group relative cursor-pointer ${active ? 'bg-[#1e1b4b]/30 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'bg-[#0f1623] border border-slate-700/30 hover:border-slate-600'}`}>
        <div className="flex gap-5 items-start">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center font-bold text-sm shrink-0 shadow-lg`}>
                {logo}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{role}</h4>
                        <p className="text-sm text-slate-400 font-medium">{company} <span className="mx-1">•</span> {period}</p>
                    </div>
                    {active ? (
                        <button onClick={(e) => { e.stopPropagation(); alert("Analyzing with AI..."); }} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500/20">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            Analyze with AI
                        </button>
                    ) : (
                        <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-light">{desc}</p>
            </div>
        </div>
    </div>
)

const SkillBar: React.FC<{name: string, level: string, progress: number, color: string}> = ({name, level, progress, color}) => {
    let textColor = 'text-blue-400';
    if (color.includes('purple')) textColor = 'text-purple-400';
    if (color.includes('cyan')) textColor = 'text-cyan-400';

    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-white mb-2.5">
                <span>{name}</span>
                <span className={`${textColor} text-[10px] uppercase tracking-wider`}>{level}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}