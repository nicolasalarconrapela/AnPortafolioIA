
import React from 'react';
import { ChevronLeft, Bot, Send, Calendar, Download } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { MarkdownView } from './MarkdownView';
import { CVProfile, ChatMessage } from '../../types_brain';
import { Button } from './Button';

interface DonnaViewProps {
    profile: CVProfile;
    chatHistory: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    loading: boolean;
    activeTab: 'experience' | 'education' | 'projects' | 'skills';
    setActiveTab: (tab: 'experience' | 'education' | 'projects' | 'skills') => void;
    onSend: (e?: React.FormEvent, text?: string) => void;
    onBack: () => void;
    chatEndRef: React.RefObject<HTMLDivElement>;
    isOffline: boolean;
    setIsOffline: (val: boolean) => void;
    suggestedQuestions: string[];
}

export const DonnaView: React.FC<DonnaViewProps> = ({
    profile,
    chatHistory,
    input,
    setInput,
    loading,
    activeTab,
    setActiveTab,
    onSend,
    onBack,
    chatEndRef,
    isOffline,
    setIsOffline,
    suggestedQuestions
}) => {

    const renderContent = () => {
        switch (activeTab) {
            case 'experience':
                const groups: { company: string, logo?: string, roles: any[] }[] = [];
                profile.experience?.forEach(exp => {
                    const lastGroup = groups[groups.length - 1];
                    if (lastGroup && lastGroup.company === exp.company) {
                        lastGroup.roles.push(exp);
                    } else {
                        groups.push({ company: exp.company, logo: exp.logo, roles: [exp] });
                    }
                });

                return (
                    <div className="space-y-10 p-6 md:p-8 animate-fade-in">
                        {groups.map((group, groupIdx) => (
                            <div key={groupIdx} className="flex gap-6 relative group">
                                {/* Vertical Timeline Line */}
                                {groupIdx !== groups.length - 1 && (
                                    <div className="absolute left-6 top-14 bottom-[-40px] w-[2px] bg-outline-variant/30 hidden md:block group-hover:bg-primary/20 transition-colors"></div>
                                )}

                                <div className="flex flex-col items-center shrink-0 z-10">
                                    <CompanyLogo name={group.company} logoUrl={group.logo} className="w-12 h-12 bg-surface ring-4 ring-[var(--md-sys-color-background)] rounded-xl shadow-sm" />
                                </div>

                                <div className="flex-1">
                                    <div className="mb-5">
                                        <h3 className="text-primary font-bold text-lg leading-tight">{group.company}</h3>
                                    </div>

                                    <div className="space-y-8">
                                        {group.roles.map((role, roleIdx) => (
                                            <div key={roleIdx} className="relative pl-0 md:pl-2">
                                                {/* Role Connector Dot */}
                                                {group.roles.length > 1 && (
                                                    <div className="absolute -left-[32px] top-2.5 w-2 h-2 rounded-full bg-outline-variant border-2 border-[var(--md-sys-color-background)] md:block hidden"></div>
                                                )}

                                                <h4 className="text-[var(--md-sys-color-on-background)] font-bold text-base mb-1">{role.role}</h4>
                                                <div className="flex items-center gap-2 text-xs font-bold text-outline mb-3 uppercase tracking-wider bg-surface-variant/30 inline-block px-2 py-1 rounded-md">
                                                    <Calendar className="w-3 h-3 text-outline" />
                                                    <span>{role.startDate || 'Inicio'}</span>
                                                    <span className="text-outline/50">─</span>
                                                    <span className={role.current ? "text-tertiary font-extrabold" : ""}>
                                                        {role.current ? 'Actualidad' : (role.endDate || 'Fin')}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-[var(--md-sys-color-on-background)]/80 leading-relaxed">
                                                    <MarkdownView content={role.description} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'education':
                return (
                    <div className="space-y-4 p-6 md:p-8 animate-fade-in">
                        {profile.education?.map((edu, i) => (
                            <div key={i} className="bg-surface border border-outline-variant/30 p-6 rounded-[20px] flex items-center gap-6 shadow-sm hover:shadow-elevation-1 transition-shadow">
                                <CompanyLogo name={edu.institution} className="w-16 h-16 rounded-xl" />
                                <div>
                                    <h4 className="font-bold text-[var(--md-sys-color-on-background)] text-lg">{edu.title}</h4>
                                    <p className="text-base text-primary font-medium">{edu.institution}</p>
                                    <p className="text-sm text-outline mt-1 font-mono">{edu.period}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'projects':
                return (
                    <div className="grid grid-cols-1 gap-6 p-6 md:p-8 animate-fade-in">
                        {profile.projects?.map((proj, i) => (
                            <div key={i} className="bg-surface border border-outline-variant/30 rounded-[24px] overflow-hidden shadow-sm hover:shadow-elevation-2 transition-all">
                                {proj.images && proj.images.length > 0 && (
                                    <div className="h-56 overflow-x-auto flex snap-x snap-mandatory no-scrollbar bg-surface-variant/20">
                                        {proj.images.map((img, idx) => (
                                            <img key={idx} src={img} alt={`${proj.name} screenshot`} className="w-full h-full object-cover shrink-0 snap-center" />
                                        ))}
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-[var(--md-sys-color-on-background)] text-xl">{proj.name}</h4>
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                                                <Send className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-outline mb-4 bg-surface-variant/30 w-fit px-2 py-1 rounded-md">
                                        {(proj.startDate || proj.endDate) && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                <span className="uppercase tracking-wide">{proj.startDate || ''} {proj.startDate && proj.endDate ? '-' : ''} {proj.endDate || ''}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-[var(--md-sys-color-on-background)]/80 mb-6 leading-relaxed">{proj.description}</p>
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant/20">
                                        {(proj.technologies || '').split(',').map((tech, t) => (
                                            <span key={t} className="text-[10px] font-bold bg-secondary-container text-secondary-onContainer px-3 py-1 rounded-full uppercase tracking-wider">
                                                {tech.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'skills':
                return (
                    <div className="p-6 md:p-8 animate-fade-in">
                        <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-6">Competencias & Stack</h4>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {profile.skills?.map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-surface text-[var(--md-sys-color-on-background)] text-sm font-medium rounded-xl border border-outline-variant/50 shadow-sm hover:border-primary hover:text-primary transition-colors cursor-default">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-[var(--md-sys-color-background)] font-sans text-[var(--md-sys-color-on-background)]">
            
            {/* Chat Column */}
            <div className="w-full md:w-[420px] bg-surface border-r border-outline-variant/20 flex flex-col shrink-0 z-20 shadow-xl md:shadow-none">
                <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 text-outline hover:text-primary hover:bg-surface-variant rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${isOffline ? 'bg-outline' : 'bg-primary'}`}>
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--md-sys-color-on-background)] text-sm">Donna AI</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-outline-variant' : 'bg-green-500 animate-pulse'}`}></span>
                                <span className="text-[10px] text-outline font-medium uppercase tracking-wide">{isOffline ? 'Offline Mode' : 'Online'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer relative group" title="Toggle AI Mode">
                            <input type="checkbox" checked={isOffline} onChange={(e) => setIsOffline(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-6 bg-surface-variant border border-outline rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:bg-primary-container peer-checked:border-primary transition-all"></div>
                            <span className="absolute left-1 top-1 bg-outline w-4 h-4 rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-primary"></span>
                        </label>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin bg-surface-variant/20">
                    {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[85%] rounded-[20px] px-5 py-3.5 text-sm shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-sm' 
                                    : 'bg-surface text-[var(--md-sys-color-on-background)] border border-outline-variant/30 rounded-tl-sm'
                            }`}>
                                <MarkdownView content={msg.text} />
                                <div className={`text-[10px] mt-1.5 text-right font-medium opacity-70`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-surface border border-outline-variant/30 rounded-[20px] rounded-tl-sm p-4 flex space-x-1.5 shadow-sm">
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {isOffline && (
                    <div className="px-4 py-3 bg-surface border-t border-outline-variant/10">
                        <p className="text-[10px] text-outline uppercase tracking-wider mb-2 font-bold">Sugerencias:</p>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSend(undefined, q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-surface-variant hover:bg-surface-variant/80 text-[var(--md-sys-color-on-background)] rounded-lg text-xs font-medium border border-transparent hover:border-primary transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-4 bg-surface border-t border-outline-variant/20">
                    <form onSubmit={onSend} className="relative flex items-center gap-2">
                        <input 
                            className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-full py-3.5 pl-5 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[var(--md-sys-color-on-background)] placeholder-outline" 
                            placeholder={isOffline ? "Pregunta sobre el perfil..." : "Escribe a Donna..."} 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || loading} 
                            className={`absolute right-2 p-2 rounded-full text-white transition-all disabled:opacity-50 disabled:scale-90 ${isOffline ? 'bg-outline' : 'bg-primary shadow-lg shadow-primary/30 hover:scale-105 active:scale-95'}`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Profile Content Column */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--md-sys-color-background)] relative">
                
                {/* Profile Header */}
                <div className="bg-surface/50 backdrop-blur-md border-b border-outline-variant/20 p-6 md:p-8 shrink-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-medium text-[var(--md-sys-color-on-background)] mb-2">
                                    {profile.experience[0]?.role || "Candidato"}.
                                </h1>
                                <p className="text-outline text-base max-w-2xl leading-relaxed line-clamp-2 md:line-clamp-none">
                                    {profile.summary}
                                </p>
                            </div>
                            <Button variant="outline" className="hidden md:flex gap-2" onClick={() => window.print()}>
                                <Download size={16} /> PDF
                            </Button>
                        </div>

                        {/* Navigation Tabs (Chips) */}
                        <div className="flex gap-2 overflow-x-auto mt-8 no-scrollbar pb-1">
                            {['experience', 'education', 'projects', 'skills'].map((tab) => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab as any)} 
                                    className={`
                                        px-5 py-2.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap
                                        ${activeTab === tab 
                                            ? 'bg-secondary-container text-secondary-onContainer border-secondary-container shadow-sm' 
                                            : 'bg-surface text-outline border-outline-variant hover:bg-surface-variant hover:text-[var(--md-sys-color-on-background)]'
                                        }
                                    `}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profile Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--md-sys-color-background)]">
                    <div className="max-w-4xl mx-auto min-h-full pb-20">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
