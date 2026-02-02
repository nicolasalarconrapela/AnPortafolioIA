import React from 'react';
import { ChevronLeft, Bot, Send } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { MarkdownView } from './MarkdownView';
import { CVProfile, ChatMessage } from '../types';

interface DonnaViewProps {
    profile: CVProfile;
    chatHistory: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    loading: boolean;
    activeTab: 'experience' | 'education' | 'projects' | 'skills';
    setActiveTab: (tab: 'experience' | 'education' | 'projects' | 'skills') => void;
    onSend: (e: React.FormEvent) => void;
    onBack: () => void;
    chatEndRef: React.RefObject<HTMLDivElement>;
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
    chatEndRef
}) => {
    
    const ActiveTabContent = () => {
          switch(activeTab) {
              case 'experience':
                  return (<div className="space-y-8 p-6">{profile.experience.map((role, roleIdx) => (<div key={roleIdx} className="flex gap-4"><div className="flex flex-col items-center shrink-0"><CompanyLogo name={role.company} className="w-12 h-12 bg-white" /></div><div className="flex-1 pb-8 border-b border-slate-100 last:border-0"><h3 className="text-lg font-bold text-slate-900">{role.role}</h3><p className="text-blue-600 font-medium">{role.company}</p><div className="text-sm text-slate-400 mb-3">{role.period}</div><div className="text-sm text-slate-600"><MarkdownView content={role.description} /></div></div></div>))}</div>);
              case 'education':
                  return (<div className="space-y-4 p-6">{profile.education.map((edu, i) => (<div key={i} className="bg-white border border-slate-200 p-6 rounded-lg flex items-center gap-4"><CompanyLogo name={edu.institution} className="w-16 h-16" /><div><h4 className="font-bold text-slate-800 text-lg">{edu.title}</h4><p className="text-base text-slate-600">{edu.institution}</p><p className="text-sm text-slate-400 mt-1">{edu.period}</p></div></div>))}</div>);
              case 'projects':
                  return (<div className="grid grid-cols-1 gap-4 p-6">{profile.projects.map((proj, i) => (<div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm"><h4 className="font-bold text-slate-800 text-lg mb-2">{proj.name}</h4><p className="text-sm text-slate-600 mb-4">{proj.description}</p><div className="flex flex-wrap gap-2">{proj.technologies.split(',').map((tech, t) => (<span key={t} className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{tech.trim()}</span>))}</div></div>))}</div>);
              case 'skills':
                  return (<div className="p-6"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Competencias</h4><div className="flex flex-wrap gap-2 mb-8">{profile.skills.map((s, i) => (<span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">{s}</span>))}</div></div>);
          }
      };

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50 font-sans">
                <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={onBack} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"><Bot className="w-6 h-6" /></div><div><h3 className="font-bold text-slate-800 text-sm">Donna</h3><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-[10px] text-slate-400">Online</span></div></div></div></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">{chatHistory.map((msg) => (<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}><MarkdownView content={msg.text} /><div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div>))}{loading && (<div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl p-4 flex space-x-1"><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div></div></div>)}<div ref={chatEndRef} /></div>
                    <div className="p-4 border-t border-slate-200 bg-white"><form onSubmit={onSend} className="relative"><input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-12 text-sm outline-none" placeholder="Escribe..." value={input} onChange={(e) => setInput(e.target.value)} /><button type="submit" disabled={!input.trim() || loading} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-600 rounded text-white disabled:bg-slate-300"><Send className="w-4 h-4" /></button></form></div>
                </div>
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="bg-white border-b border-slate-200 p-6 md:p-10 shrink-0 shadow-sm z-10"><h1 className="text-3xl font-extrabold text-slate-900">{profile.experience[0]?.role || "Candidato"}.</h1><p className="text-slate-500 mt-2">{profile.summary}</p><div className="flex gap-2 overflow-x-auto mt-6 no-scrollbar">{['experience', 'education', 'projects', 'skills'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${activeTab === tab ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>))}</div></div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin"><div className="max-w-4xl mx-auto"><ActiveTabContent /></div></div>
                </div>
        </div>
    );
};
