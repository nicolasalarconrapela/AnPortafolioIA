import React, { useState, useEffect, useRef } from 'react';

interface LinkedinSyncViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export const LinkedinSyncView: React.FC<LinkedinSyncViewProps> = ({ onBack, onComplete }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hi Alex! I've analyzed your resume. Your experience at TechFlow looks impressive. I noticed you mentioned scaling the design system there.", time: '10:02 AM' },
    { id: 2, sender: 'user', text: "Thanks! It's been a great journey so far. Building the component library for TechFlow was one of my biggest challenges.", time: '10:03 AM' },
    { id: 3, sender: 'ai', text: <span>I noticed you listed <span className="text-cyan-400 font-bold">'Project Management'</span> as a key skill. Can you describe a specific challenge you overcame in your last role involving this skill?</span>, time: '10:03 AM' }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col gap-5 animate-fade-in text-left relative min-h-full">
        
        {/* Header Profile Card */}
        <div className="flex flex-col md:flex-row gap-5 p-5 rounded-2xl bg-[#0a101f]/80 border border-slate-700/50 items-start md:items-center shadow-lg shrink-0">
             {/* Avatar & Info */}
             <div className="relative shrink-0">
                 <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" alt="Profile" className="w-20 h-20 rounded-2xl object-cover border border-slate-600" />
                 <button className="absolute bottom-[-6px] right-[-6px] p-1.5 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer shadow-md">
                    <span className="material-symbols-outlined text-[12px] text-white">edit</span>
                 </button>
             </div>
             <div className="flex-1 min-w-0">
                 <h2 className="text-2xl font-bold text-white leading-tight">Alex Chen</h2>
                 <p className="text-cyan-400 font-medium text-sm mt-0.5">Senior Product Designer <span className="text-slate-600 mx-1">|</span> <span className="text-slate-300">5 YOE</span></p>
                 <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> San Francisco, CA</span>
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">mail</span> alex.chen@design.co</span>
                 </div>
             </div>
             <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                 <button className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-700 transition-all cursor-default">
                     <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                     Analysis Complete
                 </button>
             </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 overflow-visible lg:overflow-hidden">
            {/* Left Column: Experience & Skills */}
            <div className="flex-1 overflow-visible lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar space-y-5">
                
                {/* Experience Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                         <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400 text-base">work_history</span> Experience</h3>
                         <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">add</span></button>
                    </div>
                    {/* Cards */}
                    <div className="space-y-3">
                        <ExperienceCard 
                           role="Senior Product Designer" 
                           company="TechFlow Inc." 
                           period="Jan 2020 - Present • 4 yrs 3 mos" 
                           desc="Leading the design system initiative and managing a team of 3 junior designers. Spearheaded the redesign of the core dashboard increasing user retention by 15%."
                           logo="TF"
                           color="bg-cyan-900/50 text-cyan-400"
                        />
                        <ExperienceCard 
                           role="Product Designer" 
                           company="Acme Corp" 
                           period="Jun 2018 - Dec 2019 • 1 yr 7 mos" 
                           desc="Designed mobile-first experiences for e-commerce clients. Collaborated closely with engineering to implement pixel-perfect UIs and accessible components."
                           logo="A"
                           color="bg-indigo-900/50 text-indigo-400"
                        />
                    </div>
                </div>

                {/* Skills Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                         <h3 className="text-sm font-bold text-white flex items-center gap-2"><span className="material-symbols-outlined text-purple-400 text-base">auto_awesome</span> Skills & Proficiency</h3>
                         <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-[#0a101f]/50 border border-slate-700/30 rounded-2xl">
                        <SkillBar name="Figma" level="Expert" progress={95} color="bg-blue-500" />
                        <SkillBar name="React / Tailwind" level="Advanced" progress={85} color="bg-cyan-500" />
                        <SkillBar name="UX Research" level="Expert" progress={90} color="bg-indigo-500" />
                        <SkillBar name="Prototyping" level="Advanced" progress={80} color="bg-purple-500" />
                        
                        <button className="col-span-1 md:col-span-2 mt-2 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 text-xs font-bold hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">add</span> Add Skill
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Chat (TalentFlow AI) */}
            <div className="w-full lg:w-[380px] flex flex-col bg-[#0a101f] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shrink-0 h-[500px] lg:h-auto ring-1 ring-white/5 order-first lg:order-last">
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-slate-800 bg-[#0f1623] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#0f1623] rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white leading-none">TalentFlow AI</h4>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Interviewing Agent</span>
                        </div>
                    </div>
                    <button className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                </div>

                {/* Context Bar */}
                <div className="px-4 py-2 bg-[#0a101f]/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                        <span className="material-symbols-outlined text-xs">target</span>
                        Focus: Experience @ TechFlow
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">Context Lock</span>
                        <div className="w-8 h-4 bg-slate-800 rounded-full relative cursor-pointer border border-slate-700">
                            <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div ref={scrollRef} className="flex-1 p-4 space-y-5 overflow-y-auto bg-slate-900/20 scroll-smooth min-h-[300px]">
                    {messages.map((msg) => (
                         <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm mt-1 ${
                                msg.sender === 'ai' 
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                : 'border-slate-600 overflow-hidden'
                            }`}>
                                {msg.sender === 'ai' 
                                    ? <span className="material-symbols-outlined text-xs">smart_toy</span> 
                                    : <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover" alt="User" />
                                }
                            </div>
                            <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-3 text-xs leading-relaxed shadow-md ${
                                    msg.sender === 'ai' 
                                    ? 'bg-[#1e293b] text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/50' 
                                    : 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500/50'
                                }`}>
                                    {typeof msg.text === 'string' ? msg.text : msg.text}
                                </div>
                                <span className="text-[9px] text-slate-500 mt-1.5 px-1 font-medium">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50 bg-[#0f1623] relative z-20">
                    {/* Quick Chips */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar mask-linear-fade-right">
                        {['Tell me more', 'Skip question', 'Edit details'].map((action, i) => (
                            <button key={i} className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full text-[10px] text-slate-300 transition-all font-medium active:scale-95 hover:text-white group">
                                {action}
                                <span className="inline-block w-0 group-hover:w-1 transition-all"></span>
                            </button>
                        ))}
                    </div>

                    {/* Glowing Input */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
                        <div className="relative bg-[#0a101f] rounded-xl p-1.5 flex gap-2 border border-slate-700 group-hover:border-slate-600 transition-colors">
                            <input 
                                className="bg-transparent flex-1 text-xs text-white px-3 py-2.5 outline-none placeholder-slate-500 font-medium" 
                                placeholder="Type your answer..." 
                            />
                            <div className="flex items-center gap-1 pr-1">
                                 <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 active:scale-95"><span className="material-symbols-outlined text-lg">mic</span></button>
                                 <button className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"><span className="material-symbols-outlined text-lg">send</span></button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2.5 px-1">
                        <p className="text-[9px] text-slate-500 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            AI Active & Listening
                        </p>
                        <span className="text-[9px] text-slate-600 font-medium">Enter to send</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between shrink-0">
             <button onClick={onBack} className="text-slate-500 hover:text-white text-xs font-bold px-4 py-2 transition-colors flex items-center gap-2 group">
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back
             </button>
             <button onClick={onComplete} className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 active:scale-95">
                Confirm & Continue
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
             </button>
        </div>
    </div>
  )
}

const ExperienceCard: React.FC<{role: string, company: string, period: string, desc: string, logo: string, color: string}> = ({role, company, period, desc, logo, color}) => (
    <div className="p-4 rounded-xl bg-[#0f1623] border border-slate-700/50 hover:border-indigo-500/30 transition-all group relative">
        <div className="flex gap-4 items-start">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center font-bold text-sm shrink-0`}>
                {logo}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{role}</h4>
                        <p className="text-xs text-slate-400 mb-1">{company} • {period}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded text-slate-400 hidden sm:block">
                        <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">{desc}</p>
            </div>
        </div>
        
        {/* Analyze AI Button Overlay */}
        <div className="absolute top-4 right-4 sm:right-10">
            <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100">
                <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                Analyze
            </button>
        </div>
    </div>
)

const SkillBar: React.FC<{name: string, level: string, progress: number, color: string}> = ({name, level, progress, color}) => (
    <div>
        <div className="flex justify-between text-[10px] font-bold text-white mb-1.5">
            <span>{name}</span>
            <span className={color.replace('bg-', 'text-').replace('500', '400')}>{level}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
)