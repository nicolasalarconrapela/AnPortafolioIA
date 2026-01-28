import React from 'react';

interface LinkedinSyncViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export const LinkedinSyncView: React.FC<LinkedinSyncViewProps> = ({ onBack, onComplete }) => {
  return (
    <div className="w-full h-full flex flex-col gap-5 animate-fade-in text-left relative max-h-[calc(100vh-140px)] lg:max-h-full">
        
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
                 <button className="w-full md:w-auto px-4 py-2 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#0077b5]/20 transition-all">
                     <span className="material-symbols-outlined text-sm animate-spin-slow">sync</span>
                     Synced 2m ago
                 </button>
             </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 overflow-hidden">
            {/* Left Column: Experience & Skills */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
                
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
            <div className="w-full lg:w-[360px] flex flex-col bg-[#0a101f] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shrink-0 h-[500px] lg:h-auto">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700/50 bg-[#0f1623] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white leading-none">TalentFlow AI</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[9px] text-green-500 font-bold tracking-wider uppercase">Interviewing</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-lg">more_vert</span></button>
                </div>

                {/* Context Bar */}
                <div className="px-4 py-2 bg-[#0a101f] border-b border-slate-700/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-medium">
                        <span className="material-symbols-outlined text-xs">target</span>
                        Focus: Experience @ TechFlow
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Context Lock</span>
                        <div className="w-6 h-3 bg-purple-500/20 rounded-full relative cursor-pointer">
                            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-900/30">
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30 mt-1">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-2xl rounded-tl-sm text-xs text-slate-300 leading-relaxed border border-slate-700/50">
                            Hi Alex! I see you've synced your LinkedIn profile. Your experience at TechFlow looks impressive. I noticed you mentioned scaling the design system there.
                        </div>
                    </div>

                    <div className="flex gap-3 flex-row-reverse">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-600">
                             <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 bg-indigo-600 rounded-2xl rounded-tr-sm text-xs text-white leading-relaxed shadow-lg">
                            Thanks! It's been a great journey so far. Building the component library for TechFlow was one of my biggest challenges.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30 mt-1">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-2xl rounded-tl-sm text-xs text-slate-300 leading-relaxed border border-slate-700/50">
                            I noticed you listed <span className="text-cyan-400 font-bold italic">'Project Management'</span> as a key skill. Can you describe a specific challenge you overcame in your last role involving this skill?
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50 bg-[#0f1623]">
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                         <button className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 transition-colors">Tell me more</button>
                         <button className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 transition-colors">Skip question</button>
                    </div>
                    <div className="bg-[#0a101f] rounded-xl p-1.5 flex gap-2 border border-slate-700 focus-within:border-indigo-500/50 transition-colors">
                        <input className="bg-transparent flex-1 text-xs text-white px-3 py-2 outline-none placeholder-slate-600" placeholder="Type your answer..." />
                        <div className="flex items-center gap-1 pr-1">
                             <button className="p-2 text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-base">mic</span></button>
                             <button className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white transition-colors shadow-lg"><span className="material-symbols-outlined text-base">send</span></button>
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-600 text-center mt-2">AI responses generated in real-time based on Profile & LinkedIn data.</p>
                </div>
            </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between shrink-0">
             <button onClick={onBack} className="text-slate-500 hover:text-white text-xs font-bold px-4 py-2 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back
             </button>
             <button onClick={onComplete} className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
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
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded text-slate-400">
                        <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">{desc}</p>
            </div>
        </div>
        
        {/* Analyze AI Button Overlay */}
        <div className="absolute top-4 right-10">
            <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all opacity-0 group-hover:opacity-100">
                <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                Analyze with AI
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
