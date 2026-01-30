import React, { useState, useRef, useEffect } from 'react';
import { AITrainingView } from './AITrainingView';
import { upsertWorkspaceForUser, listenWorkspaceByUser } from '../services/firestoreWorkspaces';

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
    fullName: "Candidate",
    jobTitle: "Open to Work",
    bio: "Complete your profile to unlock more features.",
    location: "Remote / Hybrid",
    email: "email@example.com"
};

type DashboardView = 'profile' | 'ai-training' | 'settings';
type SettingsTab = 'account' | 'privacy' | 'notifications' | 'avatar-prefs' | 'training-data';
type OptimizationCategory = 'experience' | 'skills' | 'education' | 'licenses' | 'volunteering' | 'projects';

interface CandidateDashboardProps {
    onLogout: () => void;
}

// --- CONFIGURATION: AI SYSTEM PROMPTS PER CATEGORY ---
const CATEGORY_CONFIG: Record<OptimizationCategory, {
    label: string;
    icon: string;
    color: string;
    systemPrompt: string;
    suggestedSkills: string[];
}> = {
    experience: {
        label: "Experience",
        icon: "work_history",
        color: "text-cyan-400",
        systemPrompt: "ACT AS: Expert Resume Auditor. GOAL: Maximize impact of work history. INSTRUCTIONS: 1. Demand 'Action Verb + Task + Result' structure. 2. Ask for quantified metrics (%, $, time saved). 3. Identify gaps in employment. 4. Suggest translation of passive tasks into active achievements.",
        suggestedSkills: ["Strategic Planning", "Team Leadership", "Project Management", "Process Optimization"]
    },
    skills: {
        label: "Skills",
        icon: "psychology",
        color: "text-indigo-400",
        systemPrompt: "ACT AS: Technical Recruiter & Keyword Strategist. GOAL: Optimize ATS ranking. INSTRUCTIONS: 1. Validate hard vs. soft skills balance. 2. Suggest industry-standard tools missing from the profile based on the job title. 3. Rate proficiency levels (Beginner to Expert).",
        suggestedSkills: ["Python", "React", "Data Analysis", "Public Speaking", "Agile Methodologies"]
    },
    education: {
        label: "Studies",
        icon: "school",
        color: "text-blue-400",
        systemPrompt: "ACT AS: Academic Advisor. GOAL: Highlight relevant education. INSTRUCTIONS: 1. If Recent Grad: Focus on coursework, GPA (if high), and thesis. 2. If Experienced: De-emphasize dates/details, focus on degree relevance. 3. format dates correctly.",
        suggestedSkills: ["Research", "Academic Writing", "Critical Thinking", "Thesis Defense"]
    },
    licenses: {
        label: "Licenses",
        icon: "verified",
        color: "text-emerald-400",
        systemPrompt: "ACT AS: Credential Verifier. GOAL: Validate professional standing. INSTRUCTIONS: 1. Ensure 'Issuing Organization' and 'Issue Date' are present. 2. Ask if the cert has an ID/URL. 3. Prioritize active certifications over expired ones.",
        suggestedSkills: ["PMP", "AWS Certified", "Scrum Master", "CPA", "Six Sigma"]
    },
    volunteering: {
        label: "Volunteer",
        icon: "volunteer_activism",
        color: "text-pink-400",
        systemPrompt: "ACT AS: Holistic Recruiter. GOAL: Extract transferable soft skills. INSTRUCTIONS: 1. Treat volunteer roles like work experience. 2. Highlight leadership, empathy, and community organization skills. 3. Connect cause to company values.",
        suggestedSkills: ["Community Outreach", "Fundraising", "Mentoring", "Event Planning"]
    },
    projects: {
        label: "Projects",
        icon: "rocket_launch",
        color: "text-orange-400",
        systemPrompt: "ACT AS: Tech Lead / Portfolio Reviewer. GOAL: Showcase practical application. INSTRUCTIONS: 1. Require 'Tech Stack' used. 2. Ask for the user's specific role (Solo vs Team). 3. Demand a Link (Repo/Live). 4. Focus on the 'Problem Solved'.",
        suggestedSkills: ["System Design", "Prototyping", "Full Stack Development", "UX Research"]
    }
};

// --- SUB-COMPONENTS ---

const NavButton: React.FC<{ label: string, active: boolean, onClick: () => void, icon: string }> = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`px-3 lg:px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${active ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
    >
        <span className={`material-symbols-outlined text-base ${active ? 'text-purple-400' : ''}`}>{icon}</span>
        {label}
    </button>
);

const MobileNavItem: React.FC<{ label: string, active: boolean, onClick: () => void, icon: string }> = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`w-full px-4 py-4 rounded-xl text-base font-bold transition-all flex items-center gap-4 ${active ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-800/30'}`}
    >
        <span className={`material-symbols-outlined text-2xl ${active ? 'text-purple-400' : ''}`}>{icon}</span>
        {label}
    </button>
);

const SettingsNavItem: React.FC<{ label: string, icon: string, active: boolean, onClick: () => void }> = ({ label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-2 border-transparent'
            }`}
    >
        <span className={`material-symbols-outlined text-xl ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`}>{icon}</span>
        {label}
    </button>
);

const ExperienceCard: React.FC<{ role: string, company: string, period: string, desc: string, logo: string, color: string, active: boolean }> = ({ role, company, period, desc, logo, color, active }) => (
    <div className={`p-4 md:p-6 rounded-2xl transition-all group relative cursor-pointer ${active ? 'bg-[#1e1b4b]/30 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'bg-[#0f1623] border border-slate-700/30 hover:border-slate-600'}`}>
        <div className="flex gap-4 md:gap-5 items-start">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${color} flex items-center justify-center font-bold text-sm shrink-0 shadow-lg`}>
                {logo}
            </div>
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                        <h4 className="text-base md:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{role}</h4>
                        <p className="text-xs md:text-sm text-slate-400 font-medium">{company} <span className="mx-1">•</span> {period}</p>
                    </div>
                    {active ? (
                        <button onClick={(e) => { e.stopPropagation(); alert("Analyzing with AI..."); }} className="mt-2 sm:mt-0 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500/20 w-fit">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            Analyze
                        </button>
                    ) : (
                        <button className="hidden sm:block p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    )}
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">{desc}</p>
            </div>
        </div>
    </div>
);

// --- VIEW COMPONENTS ---

const ProfileView: React.FC<{ profile: ProfileData }> = ({ profile }) => {
    // Chat & Logic State
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I'm your Career Coach. Select a category (Experience, Skills, Projects...) to start a specialized audit." }
    ]);
    const [inputText, setInputText] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [activeCategory, setActiveCategory] = useState<OptimizationCategory>('experience');
    const [quickReplies, setQuickReplies] = useState<string[]>([]);

    // Data State (Empty by default)
    const [experiences, setExperiences] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial load suggestions
    useEffect(() => {
        setQuickReplies(["Audit my profile", "Suggest Keywords", "Optimize summary"]);
    }, []);

    const changeCategory = (cat: OptimizationCategory) => {
        setActiveCategory(cat);
        const config = CATEGORY_CONFIG[cat];

        // Inject system message to UI to show context switch
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            text: `Context switched to **${config.label}**. ${config.systemPrompt.split('GOAL:')[1].split('.')[0]}. How can I help?`
        }]);
        setQuickReplies(config.suggestedSkills.slice(0, 3));
    };

    // AI Logic Engine
    const generateAIResponse = (input: string, category: OptimizationCategory): { text: string, replies: string[] } => {
        const lowerInput = input.toLowerCase();
        const config = CATEGORY_CONFIG[category];

        // Simulating the AI utilizing the specific prompt
        if (category === 'experience') {
            return {
                text: "I'm analyzing your Experience as a Resume Auditor. Please paste a bullet point from your CV, and I will rewrite it using the STAR method.",
                replies: ["Paste Bullet Point", "Review Action Verbs", "Switch Category"]
            };
        }
        if (category === 'projects') {
            return {
                text: "Acting as Tech Lead. For your project, please tell me: 1. The core problem it solved. 2. The exact tech stack used. 3. Your specific contribution (not the team's).",
                replies: ["Describe Project", "List Tech Stack", "Upload Repo Link"]
            };
        }
        if (category === 'skills') {
            return {
                text: `Scanning for ${config.label}. Based on current market trends, have you considered adding: ${config.suggestedSkills[0]} or ${config.suggestedSkills[1]}? Validate your proficiency level for me.`,
                replies: [`Add ${config.suggestedSkills[0]}`, `Add ${config.suggestedSkills[1]}`, "Verify Levels"]
            };
        }
        if (category === 'education' || category === 'licenses') {
            return {
                text: `Verifying ${config.label}. ensure you include the Issue Date and Authority. Does your certification have a credential ID URL?`,
                replies: ["Add Date", "Add Credential ID", "Skip"]
            };
        }
        if (category === 'volunteering') {
            return {
                text: "Let's translate this volunteering into soft skills. Did you lead a team or organize events? I can help you list 'Leadership' or 'Event Management' as transferable skills.",
                replies: ["Analyze Soft Skills", "List Leadership", "Skip"]
            };
        }

        return {
            text: `I am focused on ${config.label}. Provide details so I can apply the optimization prompt: "${config.systemPrompt.substring(0, 50)}..."`,
            replies: config.suggestedSkills.slice(0, 3)
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
        const thinkingTime = Math.random() * 1000 + 800;

        setTimeout(() => {
            const response = generateAIResponse(text, activeCategory);
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

    const handleAddExperience = () => {
        alert("Add Experience Modal Placeholder");
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
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-500">person</span>
                        </div>
                        <button className="absolute bottom-[-6px] right-[-6px] p-2 bg-slate-800 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-700 transition-colors cursor-pointer shadow-lg z-10" onClick={() => alert("Edit Profile Modal")}>
                            <span className="material-symbols-outlined text-[14px] text-white block">edit</span>
                        </button>
                    </div>
                </div>

                {/* Info Content */}
                <div className="flex-1 min-w-0 relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">{profile.fullName || "Candidate"}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                        <span className="text-cyan-400 font-bold">{profile.jobTitle || "Open to Work"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span> {profile.location || "Remote"}</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">mail</span> {profile.email || "email@example.com"}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start h-full animate-fade-in">
                {/* Left Column: Experience & Skills */}
                <div className="flex-1 w-full space-y-6">

                    {/* Experience Section */}
                    <div className="bg-[#0f1623]/50 border border-slate-800/50 rounded-3xl p-1 min-h-[200px]">
                        <div className="flex items-center justify-between mb-2 p-4 md:p-5 pb-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400">work</span> Experience
                            </h3>
                            <button onClick={handleAddExperience} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">add</span></button>
                        </div>
                        {/* Cards */}
                        <div className="space-y-1 p-2">
                            {experiences.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl m-2">
                                    <p className="text-slate-500 text-sm">No experience listed yet.</p>
                                    <button onClick={handleAddExperience} className="mt-2 text-indigo-400 hover:text-indigo-300 text-xs font-bold">Add Experience</button>
                                </div>
                            ) : (
                                experiences.map((exp, i) => (
                                    <ExperienceCard key={i} {...exp} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-[#0f1623]/50 border border-slate-800/50 rounded-3xl p-6 min-h-[200px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><span className="material-symbols-outlined text-purple-400">auto_awesome</span> Skills & Proficiency</h3>
                            <button onClick={() => alert("Edit Skills Modal")} className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">edit</span></button>
                        </div>

                        {skills.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-slate-500 text-sm mb-4">No skills detected.</p>
                                <button className="col-span-1 md:col-span-2 mt-4 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm font-bold hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2 hover:bg-slate-800/30 w-full">
                                    <span className="material-symbols-outlined text-base">add</span> Add Skill
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Skills mapping would go here */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Chat (Career Coach AI) */}
                <div className="w-full lg:w-[400px] flex flex-col bg-[#0f1623] border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shrink-0 h-[600px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-0 transition-all duration-300">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-700/50 bg-[#0f1623] flex flex-col gap-3 z-10 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-colors duration-500 from-indigo-500 to-purple-600`}>
                                    <span className="material-symbols-outlined text-white text-xl">
                                        {CATEGORY_CONFIG[activeCategory].icon}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white leading-none">Career Coach AI</h4>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-400`}></span>
                                        <span className={`text-[10px] font-bold tracking-wider uppercase text-cyan-400`}>
                                            Mode: {CATEGORY_CONFIG[activeCategory].label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setMessages([{ id: Date.now(), sender: 'ai', text: "Chat reset. Select a category below." }])} className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800"><span className="material-symbols-outlined text-lg">refresh</span></button>
                        </div>

                        {/* Category Selector (Scrollable) */}
                        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 mask-linear-fade-right">
                            {(Object.keys(CATEGORY_CONFIG) as OptimizationCategory[]).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => changeCategory(cat)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${activeCategory === cat
                                            ? `bg-slate-800 border-slate-600 ${CATEGORY_CONFIG[cat].color}`
                                            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">{CATEGORY_CONFIG[cat].icon}</span>
                                    {CATEGORY_CONFIG[cat].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Context Bar */}
                    <div className="px-5 py-2 bg-[#0a101f] border-b border-slate-700/30 flex items-center justify-between z-10 relative shadow-sm">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                            <span className="material-symbols-outlined text-xs">smart_toy</span>
                            Active Prompt: <span className="text-white truncate max-w-[200px]">{CATEGORY_CONFIG[activeCategory].systemPrompt.substring(8, 40)}...</span>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-5 space-y-6 overflow-y-auto bg-gradient-to-b from-[#0a101f] to-[#0f1623] custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.sender === 'ai' && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 shadow-lg bg-indigo-900/30 text-indigo-400 border-indigo-500/30`}>
                                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    </div>
                                )}
                                {msg.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-600 shadow-md bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400 text-xs">person</span>
                                    </div>
                                )}
                                <div className={`p-3.5 text-sm leading-relaxed shadow-lg max-w-[80%] ${msg.sender === 'ai'
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
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar min-h-[32px] mask-linear-fade-right">
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

                        <div className="bg-[#0a101f] rounded-2xl p-1.5 flex gap-2 border border-slate-700 focus-within:border-cyan-500/50 transition-colors shadow-inner">
                            <input
                                className="bg-transparent flex-1 text-sm text-white px-4 py-3 outline-none placeholder-slate-600"
                                placeholder={isThinking ? "Coach is thinking..." : `Ask about ${CATEGORY_CONFIG[activeCategory].label}...`}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={isThinking}
                            />
                            <div className="flex items-center gap-1 pr-1">
                                <button className="p-2.5 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800"><span className="material-symbols-outlined text-xl">mic</span></button>
                                <button onClick={() => handleSendMessage()} disabled={!inputText.trim() || isThinking} className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-white transition-colors shadow-lg"><span className="material-symbols-outlined text-xl">send</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const SettingsView: React.FC<{ onLogout: () => void, profile: ProfileData, onSave: (data: ProfileData) => Promise<void> }> = ({ onLogout, profile, onSave }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [formData, setFormData] = useState<ProfileData>(profile);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
            alert("Profile saved successfully!");
        } catch (e) {
            console.error(e);
            alert("Error saving profile");
        } finally {
            setIsSaving(false);
        }
    };

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
            <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto custom-scrollbar">
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
                                <div className="w-full h-full rounded-full border-4 border-[#0a101f] bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-500">person</span>
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 p-2 bg-slate-800 rounded-full border border-slate-700 text-white hover:bg-slate-700 transition-colors shadow-lg">
                                <span className="material-symbols-outlined text-sm block">edit</span>
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 z-10">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{formData.fullName || "Candidate"}</h2>
                                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Free Member</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-6 mx-auto md:mx-0">
                                Complete your profile to unlock more features.
                            </p>
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
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Job Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Developer"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Bio</label>
                                    <textarea
                                        placeholder="Tell us about yourself..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none transition-colors h-32 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>

                        {/* Avatar Settings & Danger Zone */}
                        <div className="space-y-8">
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
};

// --- MAIN COMPONENT ---

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onLogout }) => {
    const [activeView, setActiveView] = useState<DashboardView>('profile');
    const [showNotification, setShowNotification] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Profile State
    const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        // 1. Resolve User ID
        let id = localStorage.getItem("anportafolio_user_id");
        if (!id) {
            id = "user_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("anportafolio_user_id", id);
        }
        setUserId(id);

        // 2. Listen to Firebase
        const unsubscribe = listenWorkspaceByUser(id, (data) => {
            if (data && data.profile) {
                setProfile(prev => ({ ...prev, ...data.profile }));
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSaveProfile = async (newProfile: ProfileData) => {
        if (!userId) return;
        // We save it inside the 'profile' field of the workspace
        await upsertWorkspaceForUser(userId, { profile: newProfile });
    };

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
            <header className="h-16 border-b border-slate-800 bg-[#050b14]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 lg:px-10 shrink-0 z-30 relative">
                <div className="flex items-center gap-4 lg:gap-12">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-slate-400 hover:text-white p-2 -ml-2"
                    >
                        <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('profile')}>
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-purple-900/20">A</div>
                        <span className="text-xl font-bold text-white tracking-tight hidden sm:block">AnPortafolioIA</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                        <NavButton label="Profile" active={activeView === 'profile'} onClick={() => handleViewChange('profile')} icon="id_card" />
                        <NavButton label="Career Coach" active={activeView === 'ai-training'} onClick={() => handleViewChange('ai-training')} icon="school" />
                        <NavButton label="Settings" active={activeView === 'settings'} onClick={() => handleViewChange('settings')} icon="settings" />
                    </nav>
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                    {/* Profile Completion - Desktop/Tablet Only */}
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Profile Completion</span>
                        <span className="text-[10px] font-bold text-slate-500">0%</span>
                        <div className="w-16 lg:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[5%]"></div>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

                    {/* User Actions */}
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button onClick={toggleNotifications} className="text-slate-400 hover:text-white relative p-2 rounded-full hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                        <div
                            onClick={() => handleViewChange('settings')}
                            className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-slate-600 cursor-pointer hover:border-purple-500 transition-colors bg-slate-800 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                        </div>
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
                    <div className="absolute top-16 right-4 lg:right-6 w-[calc(100vw-2rem)] sm:w-80 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl animate-fade-in z-50">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-sm">notifications_off</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">No new notifications</h4>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-[#050b14]/95 backdrop-blur-xl border-b border-slate-800 z-40 p-4 md:hidden animate-fade-in flex flex-col gap-2 shadow-2xl h-[calc(100vh-4rem)] overflow-y-auto">
                    <MobileNavItem label="Profile" active={activeView === 'profile'} onClick={() => handleViewChange('profile')} icon="id_card" />
                    <MobileNavItem label="Career Coach" active={activeView === 'ai-training'} onClick={() => handleViewChange('ai-training')} icon="school" />
                    <MobileNavItem label="Settings" active={activeView === 'settings'} onClick={() => handleViewChange('settings')} icon="settings" />
                    <div className="h-px bg-slate-800 my-2"></div>
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
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
                        <SettingsView onLogout={onLogout} profile={profile} onSave={handleSaveProfile} />
                    </div>
                ) : (
                    // Other views use the standard centered container
                    <div className="max-w-7xl mx-auto flex flex-col gap-6 p-4 md:p-6 lg:p-10 min-h-full pb-20">

                        {/* VIEW: PROFILE (DEFAULT) */}
                        {activeView === 'profile' && <ProfileView profile={profile} />}

                        {/* VIEW: AI TRAINING */}
                        {activeView === 'ai-training' && (
                            <div className="flex-1 flex flex-col h-full animate-fade-in">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-white mb-2">Career Coach Configuration</h1>
                                    <p className="text-slate-400 text-sm">Customize how your AI agent analyzes your profile and prepares you for interviews.</p>
                                </div>
                                <div className="flex-1 bg-[#0a101f]/50 border border-slate-800 rounded-3xl overflow-hidden p-4 md:p-6 lg:p-8">
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
