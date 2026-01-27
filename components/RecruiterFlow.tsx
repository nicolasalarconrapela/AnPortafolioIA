import React, { useState, useEffect } from 'react';
import { RecruiterSidebar } from './RecruiterSidebar';

export const RecruiterFlow: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Auto-advance simulation for step 3
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="flex w-full h-screen bg-[#020408] overflow-hidden font-display relative z-20">
      <RecruiterSidebar />
      
      <main className="flex-1 relative flex flex-col">
        {/* Top Header / Breadcrumbs - Only show when not complete to maximize space for dashboard view */}
        {!analysisComplete && (
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050b14]/50 backdrop-blur-sm z-30 transition-all duration-500">
                <div className="flex items-center gap-4">
                    <StepIndicator step={1} current={step} label="Language" />
                    <div className="w-8 h-px bg-white/10"></div>
                    <StepIndicator step={2} current={step} label="Job Context" />
                    <div className="w-8 h-px bg-white/10"></div>
                    <StepIndicator step={3} current={step} label="Interview Start" />
                </div>
            </header>
        )}

        <div className="flex-1 relative p-8 flex items-center justify-center overflow-y-auto">
             {/* Background Ambience */}
             <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 blur-[100px] rounded-full"></div>
                 <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/10 blur-[100px] rounded-full"></div>
             </div>

             {/* Steps Content */}
             <div className="relative z-10 w-full max-w-6xl h-full flex flex-col items-center justify-center">
                
                {step === 1 && (
                    <div className="w-full animate-fade-in flex flex-col items-center">
                        <div className="mb-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-wider uppercase">
                            Preferences
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4 text-center">Unified Language Selection</h1>
                        <p className="text-slate-400 text-center max-w-md mb-12">
                            This sets the primary language for your AI avatar interactions and candidate assessments.
                        </p>

                        <div className="flex flex-col md:flex-row gap-8 mb-12">
                            <LanguageCard 
                                flag="https://flagcdn.com/w320/us.png" 
                                title="English" 
                                subtitle="United States / United Kingdom" 
                                selected={true} 
                            />
                            <LanguageCard 
                                flag="https://flagcdn.com/w320/es.png" 
                                title="Español" 
                                subtitle="España / Latinoamérica" 
                                selected={false} 
                            />
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 text-white font-medium rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:scale-105"
                        >
                            Continue
                        </button>
                        <button className="mt-6 text-xs text-slate-500 hover:text-slate-400 transition-colors">
                            Configure regional settings later
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="w-full animate-fade-in">
                        <div className="glass-panel p-1 rounded-[2rem] border border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-50"></div>
                            
                            <div className="bg-[#050b14]/80 p-12 rounded-[1.8rem]">
                                <h1 className="text-3xl font-bold text-white mb-2 text-center">Configure Your Interview</h1>
                                <p className="text-slate-400 text-center mb-10">Provide the job context so the AI can tailor questions and technical challenges.</p>

                                <div className="flex flex-col md:flex-row gap-8 items-stretch mb-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-cyan-400">
                                            <span className="material-symbols-outlined text-lg">link</span>
                                            Paste Job Link
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                placeholder="https://company.com/careers/role" 
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none pl-4 pr-12"
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyan-400 transition-colors">search</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 italic">Supports LinkedIn, Indeed, and most ATS URLs.</p>
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <span className="text-xs font-bold text-slate-600 uppercase">OR</span>
                                    </div>

                                    <div className="flex-1">
                                         <div className="flex items-center gap-2 mb-3 text-sm font-medium text-cyan-400">
                                            <span className="material-symbols-outlined text-lg">upload_file</span>
                                            Upload Job Document
                                        </div>
                                        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-xl h-[120px] flex flex-col items-center justify-center cursor-pointer transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 text-slate-400 transition-all">
                                                <span className="material-symbols-outlined">cloud_upload</span>
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium">Drop PDF or Docx here</p>
                                            <p className="text-[10px] text-slate-500">Maximum file size: 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button 
                                        onClick={() => setStep(3)}
                                        className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all hover:scale-105"
                                    >
                                        <span className="material-symbols-outlined">analytics</span>
                                        Analyze Offer
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            The AI will extract technical requirements, soft skills, and culture fit criteria.
                        </p>
                    </div>
                )}

                {step === 3 && !analysisComplete && (
                    <div className="w-full flex flex-col items-center animate-fade-in relative">
                        <div className="absolute inset-0 bg-radial-glow pointer-events-none"></div>

                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold text-white mb-2">AI Analysis Engine</h1>
                            <div className="flex items-center gap-2 justify-center">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-cyan-400 text-xs tracking-widest uppercase font-bold">Processing Offer Content</span>
                            </div>
                        </div>

                        {/* Visualization */}
                        <div className="relative w-[500px] h-[400px] mb-12">
                            {/* Central Document Representation */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-slate-800/80 border border-slate-600 rounded-lg overflow-hidden transform rotate-[-5deg]">
                                 <div className="p-4 space-y-2 opacity-50">
                                     <div className="h-2 w-3/4 bg-slate-500 rounded"></div>
                                     <div className="h-2 w-full bg-slate-600 rounded"></div>
                                     <div className="h-2 w-5/6 bg-slate-600 rounded"></div>
                                     <div className="h-2 w-full bg-slate-600 rounded"></div>
                                     <div className="h-8 w-full bg-indigo-500/20 rounded border border-indigo-500/30 my-4"></div>
                                     <div className="h-2 w-full bg-slate-600 rounded"></div>
                                     <div className="h-2 w-4/5 bg-slate-600 rounded"></div>
                                 </div>
                                 {/* Scanning Effect */}
                                 <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-cyan-400/50 to-transparent blur-md animate-scan"></div>
                                 <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-scan"></div>
                            </div>

                            {/* Floating Extraction Nodes */}
                            <AnalysisNode 
                                icon="database" 
                                text="Extracted: Senior Developer" 
                                position="top-[-20px] left-[50px]" 
                                delay="0s"
                                color="cyan"
                            />
                            <AnalysisNode 
                                icon="psychology" 
                                text="Skills: React, Node.js, AWS" 
                                position="top-[100px] right-[-40px]" 
                                delay="1s"
                                color="indigo"
                            />
                            <AnalysisNode 
                                icon="verified" 
                                text="Requirements Verified" 
                                position="bottom-[100px] left-[-60px]" 
                                delay="2s"
                                color="purple"
                            />
                            <AnalysisNode 
                                icon="school" 
                                text="Years XP: 5+" 
                                position="bottom-[50px] right-[20px]" 
                                delay="1.5s"
                                color="cyan"
                            />
                             <AnalysisNode 
                                icon="location_on" 
                                text="Remote / New York" 
                                position="bottom-[-20px] left-[100px]" 
                                delay="2.5s"
                                color="indigo"
                            />
                        
                             {/* Connecting Lines (Simulated SVG) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                                <circle cx="50%" cy="50%" r="150" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
                                <circle cx="50%" cy="50%" r="220" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="10 10" className="animate-spin-reverse-slow opacity-50" />
                            </svg>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-16 mb-12">
                            <Metric value="87%" label="Context Depth" />
                            <Metric value="Active" label="Extraction" color="text-cyan-400" />
                            <Metric value="0.4s" label="Latency" />
                        </div>

                        <button className="px-8 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 flex items-center gap-3 animate-pulse">
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            Synthesizing Job Profile...
                        </button>
                         <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            The AI is mapping roles to technical benchmarks and culture pillars.
                        </p>
                    </div>
                )}

                {step === 3 && analysisComplete && (
                    <div className="w-full animate-fade-in flex flex-col h-full justify-center">
                        <div className="mb-8">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-4">
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                AI Scan Complete
                             </div>
                             <h1 className="text-4xl font-bold text-white mb-2">Job Analysis Complete</h1>
                             <p className="text-xl text-slate-400">
                                Lead Software Engineer <span className="text-cyan-400 font-medium">@ TechFlow Systems</span>
                             </p>
                        </div>

                        <div className="w-full rounded-3xl border border-slate-700/50 bg-[#0a101f]/80 p-8 lg:p-10 backdrop-blur-xl mb-8 relative overflow-hidden">
                             {/* Content Grid */}
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                                 {/* Left Column - Details */}
                                 <div className="lg:col-span-2 space-y-10">
                                     
                                     {/* Item 1 */}
                                     <div className="flex gap-6">
                                         <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
                                            <span className="material-symbols-outlined">code</span>
                                         </div>
                                         <div>
                                             <h3 className="text-lg font-bold text-white mb-3">Must-have Skills</h3>
                                             <div className="flex flex-wrap gap-2">
                                                 {['React.js', 'Node.js', 'System Design', 'GraphQL'].map(skill => (
                                                     <span key={skill} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium">
                                                         {skill}
                                                     </span>
                                                 ))}
                                             </div>
                                         </div>
                                     </div>

                                     {/* Item 2 */}
                                     <div className="flex gap-6">
                                         <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
                                            <span className="material-symbols-outlined">business_center</span>
                                         </div>
                                         <div>
                                             <h3 className="text-lg font-bold text-white mb-2">Experience Required</h3>
                                             <p className="text-slate-400 leading-relaxed">
                                                 5+ Years in Fintech, leading high-performance remote engineering teams through rapid scale-up phases.
                                             </p>
                                         </div>
                                     </div>

                                     {/* Item 3 */}
                                     <div className="flex gap-6">
                                         <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
                                            <span className="material-symbols-outlined">track_changes</span>
                                         </div>
                                         <div>
                                             <h3 className="text-lg font-bold text-white mb-2">Key Responsibilities</h3>
                                             <p className="text-slate-400 leading-relaxed">
                                                 Architecting scalable APIs, mentoring junior engineers, and defining the long-term technical roadmap for FlowCore.
                                             </p>
                                         </div>
                                     </div>

                                 </div>

                                 {/* Right Column - Score */}
                                 <div className="lg:col-span-1">
                                     <div className="h-full rounded-2xl bg-[#0f1623] border border-slate-700/50 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                                         <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                         
                                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 z-10">Match Preview</h4>
                                         
                                         <div className="relative w-48 h-48 flex items-center justify-center z-10">
                                             {/* Radial Progress SVG */}
                                             <svg className="w-full h-full transform -rotate-90">
                                                 <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                                 <circle cx="96" cy="96" r="88" stroke="url(#score-gradient)" strokeWidth="12" fill="transparent" strokeDasharray="552" strokeDashoffset="82" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                                                 <defs>
                                                     <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                         <stop offset="0%" stopColor="#06b6d4" />
                                                         <stop offset="100%" stopColor="#22d3ee" />
                                                     </linearGradient>
                                                 </defs>
                                             </svg>
                                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                 <span className="text-6xl font-bold text-white tracking-tighter">85<span className="text-3xl text-cyan-400">%</span></span>
                                                 <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mt-1">High Alignment</span>
                                             </div>
                                         </div>

                                         <p className="text-center text-xs text-slate-500 mt-8 z-10 px-4">
                                             Your profile closely aligns with the core requirements of this role.
                                         </p>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
                            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-all transform hover:scale-105 flex items-center gap-3 text-lg">
                                Confirm & Start Interview
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
                                Go back to job list
                            </button>
                        </div>

                    </div>
                )}

             </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const StepIndicator: React.FC<{step: number, current: number, label: string}> = ({step, current, label}) => {
    const active = current >= step;
    return (
        <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border border-slate-600 text-slate-500'}`}>
                {step}
            </div>
            <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
        </div>
    )
}

const LanguageCard: React.FC<{flag: string, title: string, subtitle: string, selected: boolean}> = ({flag, title, subtitle, selected}) => (
    <div className={`relative w-80 h-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${selected ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}>
        <img src={flag} alt={title} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        {selected && <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-black text-sm font-bold">check</span></div>}
        
        <div className="absolute bottom-4 left-4">
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            <p className="text-xs text-slate-300">{subtitle}</p>
        </div>
        {selected && <div className="absolute bottom-4 right-4 text-cyan-400 text-xs font-bold uppercase tracking-wider">Selected</div>}
    </div>
)

const AnalysisNode: React.FC<{icon: string, text: string, position: string, delay: string, color: string}> = ({icon, text, position, delay, color}) => {
    const colors = {
        cyan: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/30',
        indigo: 'bg-indigo-900/40 text-indigo-300 border-indigo-500/30',
        purple: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
    }[color] || 'bg-slate-900/40 text-slate-300';

    return (
        <div className={`absolute ${position} px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 text-xs font-medium animate-float shadow-lg z-20 ${colors}`} style={{animationDelay: delay}}>
            <span className="material-symbols-outlined text-sm">{icon}</span>
            {text}
        </div>
    )
}

const Metric: React.FC<{value: string, label: string, color?: string}> = ({value, label, color = 'text-white'}) => (
    <div className="text-center">
        <div className={`text-4xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
)