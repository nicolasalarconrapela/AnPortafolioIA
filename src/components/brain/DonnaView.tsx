import React from 'react';
import { ChevronLeft, Bot, Send, Calendar } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { MarkdownView } from './MarkdownView';
import { CVProfile, ChatMessage } from '../../types_brain';

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
                    <div className="space-y-12 p-6">
                        {groups.map((group, groupIdx) => (
                            <div key={groupIdx} className="flex gap-6 relative">
                                {/* Vertical Timeline Line */}
                                {groupIdx !== groups.length - 1 && (
                                    <div className="absolute left-6 top-14 bottom-[-48px] w-0.5 bg-slate-100 hidden md:block"></div>
                                )}

                                <div className="flex flex-col items-center shrink-0 z-10">
                                    <CompanyLogo name={group.company} logoUrl={group.logo} className="w-12 h-12 bg-white ring-4 ring-slate-50" />
                                </div>

                                <div className="flex-1">
                                    <div className="mb-4">
                                        <h3 className="text-blue-600 font-bold text-lg leading-tight">{group.company}</h3>
                                    </div>

                                    <div className="space-y-8">
                                        {group.roles.map((role, roleIdx) => (
                                            <div key={roleIdx} className="relative">
                                                {/* Role Connector Dot */}
                                                {group.roles.length > 1 && (
                                                    <div className="absolute -left-[31px] top-2.5 w-2 h-2 rounded-full bg-blue-200 border-2 border-white md:block hidden"></div>
                                                )}

                                                <h4 className="text-slate-900 font-bold text-base mb-1">{role.role}</h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                                    <Calendar className="w-3 h-3 text-slate-300" />
                                                    <span>{role.startDate || 'Inicio'}</span>
                                                    <span className="text-slate-200">─</span>
                                                    <span className={role.current ? "text-green-600 font-extrabold" : ""}>
                                                        {role.current ? 'Actualidad' : (role.endDate || 'Fin')}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600 leading-relaxed">
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
                return (<div className="space-y-4 p-6">{profile.education?.map((edu, i) => (<div key={i} className="bg-white border border-slate-200 p-6 rounded-lg flex items-center gap-4"><CompanyLogo name={edu.institution} className="w-16 h-16" /><div><h4 className="font-bold text-slate-800 text-lg">{edu.title}</h4><p className="text-base text-slate-600">{edu.institution}</p><p className="text-sm text-slate-400 mt-1">{edu.period}</p></div></div>))}</div>);
            case 'projects':
                return (
                    <div className="grid grid-cols-1 gap-6 p-6">
                        {profile.projects?.map((proj, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {proj.images && proj.images.length > 0 && (
                                    <div className="h-48 overflow-x-auto flex snap-x snap-mandatory">
                                        {proj.images.map((img, idx) => (
                                            <img key={idx} src={img} alt={`${proj.name} screenshot`} className="w-full h-full object-cover shrink-0 snap-center" />
                                        ))}
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 text-lg">{proj.name}</h4>
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full">
                                                <Send className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                                        {(proj.startDate || proj.endDate) && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{proj.startDate || ''} {proj.startDate && proj.endDate ? '-' : ''} {proj.endDate || ''}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{proj.description}</p>
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                                        {(proj.technologies || '').split(',').map((tech, t) => (
                                            <span key={t} className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 uppercase tracking-wide">
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
                return (<div className="p-6"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Competencias</h4><div className="flex flex-wrap gap-2 mb-8">{profile.skills?.map((s, i) => (<span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">{s}</span>))}</div></div>);
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50 font-sans">
            <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isOffline ? 'bg-slate-500' : 'bg-blue-600'}`}>
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Donna</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${isOffline ? 'bg-slate-400' : 'bg-green-500'}`}></span>
                                <span className="text-[10px] text-slate-400">{isOffline ? 'Offline' : 'Online'}</span>
                            </div>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer relative group">
                        <input type="checkbox" checked={isOffline} onChange={(e) => setIsOffline(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-500"></div>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600">Offline</span>
                    </label>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                                <MarkdownView content={msg.text} />
                                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex space-x-1">
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {isOffline && (
                    <div className="px-4 pt-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient">
                        {suggestedQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => onSend(undefined, q)}
                                className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium border border-slate-200 transition-colors"
                            >
                                <span className="text-blue-400">✨</span> {q}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-4 border-t border-slate-200 bg-white">
                    <form onSubmit={onSend} className="relative">
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" placeholder={isOffline ? "Haz una pregunta offline..." : "Escribe a Donna..."} value={input} onChange={(e) => setInput(e.target.value)} />
                        <button type="submit" disabled={!input.trim() || loading} className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded text-white disabled:bg-slate-300 transition-colors ${isOffline ? 'bg-slate-500 hover:bg-slate-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="bg-white border-b border-slate-200 p-6 md:p-10 shrink-0 shadow-sm z-10"><h1 className="text-3xl font-extrabold text-slate-900">{profile.experience[0]?.role || "Candidato"}.</h1><p className="text-slate-500 mt-2">{profile.summary}</p><div className="flex gap-2 overflow-x-auto mt-6 no-scrollbar">{['experience', 'education', 'projects', 'skills'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${activeTab === tab ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>))}</div></div>
                <div className="flex-1 overflow-y-auto scrollbar-thin"><div className="max-w-4xl mx-auto">{renderContent()}</div></div>
            </div>
        </div>
    );
};
