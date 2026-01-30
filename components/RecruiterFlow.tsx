import React, { useState, useEffect, useRef } from 'react';
import { RecruiterSidebar } from './RecruiterSidebar';

interface RecruiterFlowProps {
    isAuthenticated?: boolean;
    onExit: () => void;
}

const PREPARING_MESSAGES = [
  "Initializing Neural Pathways...",
  "Synthesizing Professional Persona...",
  "Injecting Job Context & Requirements...",
  "Calibrating Real-time Feedback Engine...",
  "Synchronizing Avatar Biometrics...",
  "Finalizing Interview Environment..."
];

export const RecruiterFlow: React.FC<RecruiterFlowProps> = ({ isAuthenticated = false, onExit }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [prepProgress, setPrepProgress] = useState(0);
  const [currentPrepMsg, setCurrentPrepMsg] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [candidateSpeaking, setCandidateSpeaking] = useState(false);

  const handleSendMessage = (text: string) => {
      if (!text.trim()) return;
      setChatMessages(prev => [...prev, text]);
      setChatInput("");
      
      // Simulate Candidate Response
      setCandidateSpeaking(true);
      setTimeout(() => {
          setCandidateSpeaking(false);
      }, 3000);
  };

  useEffect(() => {
    if (step === 3 && !analysisComplete) {
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, analysisComplete]);

  useEffect(() => {
    if (isPreparing) {
      const duration = 6000;
      const interval = 50;
      const progressStep = 100 / (duration / interval);
      
      const timer = setInterval(() => {
        setPrepProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                setIsPreparing(false);
                setInterviewStarted(true);
            }, 500);
            return 100;
          }
          return prev + progressStep;
        });
      }, interval);

      const msgInterval = setInterval(() => {
        setCurrentPrepMsg(prev => (prev + 1) % PREPARING_MESSAGES.length);
      }, 1000);

      return () => {
        clearInterval(timer);
        clearInterval(msgInterval);
      };
    }
  }, [isPreparing]);

  const handleStartInterview = () => {
    setIsPreparing(true);
  };

  const handleCancelPreparation = () => {
    setIsPreparing(false);
    setPrepProgress(0);
  };

  return (
    <div className="flex w-full h-screen bg-[#020408] overflow-hidden font-display relative z-20">
      {isAuthenticated && !isPreparing && !interviewStarted && (
        <RecruiterSidebar 
          isAuthenticated={true} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <main className="flex-1 relative flex flex-col transition-all duration-500 overflow-hidden">
        
        {/* TOP BAR FOR MOBILE - INCLUDES PROGRESS */}
        {!isPreparing && isAuthenticated && !interviewStarted && (
          <div className="lg:hidden flex items-center justify-between p-4 bg-[#050b14]/80 backdrop-blur-md border-b border-white/5 z-40">
            <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Step {step} of 3
                </span>
                <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 w-6 rounded-full transition-all ${step >= s ? 'bg-cyan-400' : 'bg-slate-800'}`}></div>
                    ))}
                </div>
            </div>
            <button onClick={() => setShowExitModal(true)} className="text-slate-400 p-2">
              <span className="material-symbols-outlined">home</span>
            </button>
          </div>
        )}

        {/* HOME BUTTON (Desktop or Unauthenticated) */}
        {!isPreparing && (!isAuthenticated || interviewStarted) && (
            <button 
                onClick={() => setShowExitModal(true)}
                className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-500 backdrop-blur-md transition-all group shadow-lg"
                title="Return Home"
            >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">home</span>
            </button>
        )}

        {/* PREPARING SCREEN */}
        {isPreparing && (
            <div className="absolute inset-0 z-[60] bg-[#020408] flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-40 h-40 lg:w-64 lg:h-64 mb-8">
                    <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-4 border-2 border-indigo-500/30 rounded-full animate-pulse-slow opacity-40"></div>
                    <div className="absolute inset-10 lg:inset-16 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-full shadow-[0_0_50px_rgba(34,211,238,0.4)] flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-white text-3xl lg:text-5xl animate-pulse">psychology</span>
                    </div>
                    <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
                    </div>
                </div>

                <div className="w-full max-w-sm">
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 tracking-tight">Preparing Session</h2>
                    <p className="text-cyan-400 text-xs font-mono mb-8 h-6 overflow-hidden">
                        <span className="animate-fade-in inline-block" key={currentPrepMsg}>
                            {PREPARING_MESSAGES[currentPrepMsg]}
                        </span>
                    </p>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-4 relative">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300 ease-out" style={{ width: `${prepProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Neural Link</span>
                        <span className="text-cyan-400">{Math.round(prepProgress)}%</span>
                    </div>
                    <button onClick={handleCancelPreparation} className="mt-8 mx-auto px-6 py-2.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-sm">cancel</span> Cancel Sequence
                    </button>
                </div>
            </div>
        )}

        {/* Top Header - Desktop only */}
        {!analysisComplete && !interviewStarted && !isPreparing && step !== 3 && (
            <header className="hidden lg:flex h-20 border-b border-white/5 items-center justify-between px-10 bg-[#050b14]/50 backdrop-blur-md z-30 transition-all duration-500 pr-24">
                <div className="flex items-center gap-6">
                    <StepIndicator step={1} current={step} label="Language" />
                    <div className="w-12 h-px bg-white/10"></div>
                    <StepIndicator step={2} current={step} label="Job Context" />
                    <div className="w-12 h-px bg-white/10"></div>
                    <StepIndicator step={3} current={step} label="Analysis" />
                </div>
            </header>
        )}

        {/* SETUP CONTENT */}
        {!isPreparing && !interviewStarted && (
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col p-4 md:p-8 lg:p-12 items-center justify-center">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-indigo-900/5 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-cyan-900/5 blur-[100px] rounded-full"></div>
                </div>

                <div className="w-full max-w-4xl flex flex-col items-center">
                    
                    {step === 1 && (
                        <div className="w-full animate-fade-in flex flex-col items-center py-6">
                            <div className="mb-4 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold tracking-widest uppercase">
                                Step 01
                            </div>
                            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-4 text-center">Language Selection</h1>
                            <p className="text-slate-400 text-center max-w-md mb-10 text-sm lg:text-base px-4">
                                Choose the primary language for your AI agent to conduct the assessment.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-12 w-full max-w-2xl px-2">
                                <LanguageCard 
                                    flag="https://flagcdn.com/w320/us.png" 
                                    title="English" 
                                    subtitle="Universal / Professional" 
                                    selected={selectedLanguage === 'en'}
                                    onClick={() => setSelectedLanguage('en')}
                                />
                                <LanguageCard 
                                    flag="https://flagcdn.com/w320/es.png" 
                                    title="Español" 
                                    subtitle="LATAM / España" 
                                    selected={selectedLanguage === 'es'}
                                    onClick={() => setSelectedLanguage('es')}
                                />
                            </div>

                            <button onClick={() => setStep(2)} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cyan-900/20">
                                Continue to Job Setup
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="w-full animate-fade-in max-w-3xl flex flex-col items-center py-6">
                            <div className="mb-4 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-widest uppercase">
                                Step 02
                            </div>
                            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 text-center">Job Context</h1>
                            <p className="text-slate-400 text-center mb-10 text-sm lg:text-base px-4">Provide details about the open position to calibrate AI focus.</p>

                            <div className="glass-panel p-6 md:p-10 rounded-3xl border border-slate-700/50 w-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none"></div>
                                
                                <div className="flex flex-col gap-6 lg:gap-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">
                                            <span className="material-symbols-outlined text-sm">link</span>
                                            Paste Job URL
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                placeholder="https://company.com/careers/lead-designer" 
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:border-cyan-500 outline-none text-sm group-hover:border-slate-600 transition-all pr-12"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400">
                                                <span className="material-symbols-outlined">captive_portal</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-px bg-slate-800"></div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Or upload PDF</span>
                                        <div className="flex-1 h-px bg-slate-800"></div>
                                    </div>

                                    <div className="group relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl py-10 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-800/20 active:scale-[0.98]">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                                            <span className="material-symbols-outlined">cloud_upload</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-300">Choose Job Description File</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">PDF, DOCX • Max 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full justify-center">
                                <button onClick={() => setStep(1)} className="px-8 py-4 border border-slate-700 rounded-xl text-slate-400 font-bold text-sm hover:text-white hover:bg-slate-800 transition-all">
                                    Go Back
                                </button>
                                <button onClick={() => setStep(3)} className="flex-1 sm:flex-none px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-900/30 active:scale-95">
                                    <span className="material-symbols-outlined text-sm">analytics</span>
                                    Analyze Requirements
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && !analysisComplete && (
                        <div className="w-full flex flex-col items-center animate-fade-in py-10 px-4">
                            <div className="mb-12 text-center">
                                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">AI Neural Scan</h1>
                                <p className="text-slate-400 text-sm lg:text-base max-w-md mx-auto">Identifying core requirements, soft skills, and experience benchmarks.</p>
                            </div>

                            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center mb-12">
                                <div className="absolute inset-0 border border-cyan-500/5 rounded-full animate-spin-slow"></div>
                                <div className="absolute inset-10 border border-indigo-500/5 rounded-full animate-spin-reverse-slow"></div>
                                
                                <div className="relative w-full max-w-[280px] h-[350px] bg-[#0a101f]/90 border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm scale-90 sm:scale-100">
                                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-scan z-20"></div>
                                    <div className="p-6 space-y-4 opacity-40">
                                        <div className="h-3 w-16 bg-cyan-400 rounded-full"></div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-slate-700 rounded-full"></div>
                                            <div className="h-2 w-5/6 bg-slate-700 rounded-full"></div>
                                            <div className="h-2 w-4/6 bg-slate-700 rounded-full"></div>
                                        </div>
                                        <div className="pt-8 h-3 w-20 bg-indigo-400 rounded-full"></div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-2 bg-slate-700 rounded-full"></div>
                                            <div className="h-2 bg-slate-700 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating nodes for visual interest - Responsive positioning */}
                                <div className="hidden sm:block">
                                    <div className="absolute top-10 left-0 animate-float-delayed"><ProcessingNode icon="person_search" label="Profile Match" /></div>
                                    <div className="absolute bottom-20 right-0 animate-float"><ProcessingNode icon="terminal" label="Tech Stack" /></div>
                                </div>
                            </div>

                            <div className="flex gap-10 lg:gap-20">
                                <Metric value="94%" label="Confidence" />
                                <Metric value="Processing" label="Mode" color="text-cyan-400" />
                                <Metric value="82ms" label="Latency" />
                            </div>
                        </div>
                    )}

                    {step === 3 && analysisComplete && (
                        <div className="w-full max-w-4xl animate-fade-in flex flex-col items-center py-6 px-4">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                    <span className="material-symbols-outlined text-3xl text-green-400">task_alt</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Strategy Finalized</h2>
                                <p className="text-slate-400 text-sm lg:text-base">Target parameters identified. Ready to begin the interview.</p>
                            </div>

                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-12">
                                <AnalysisCard title="Match Persona" value="Lead / Senior" icon="account_box" color="cyan" />
                                <AnalysisCard title="Primary Focus" value="System Design" icon="hub" color="indigo" />
                                <AnalysisCard title="Secondary Focus" value="Leadership" icon="groups" color="purple" />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button onClick={() => setAnalysisComplete(false)} className="px-8 py-4 border border-slate-700 rounded-xl text-slate-400 font-bold text-sm hover:text-white hover:bg-slate-800 transition-all">
                                    Re-analyze Offer
                                </button>
                                <button 
                                    onClick={handleStartInterview}
                                    className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/30 transition-all hover:scale-105 active:scale-95"
                                >
                                    Initialize Live Session
                                    <span className="material-symbols-outlined">bolt</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* MODAL SALIDA */}
        {showExitModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
                <div className="glass-panel border border-slate-700/50 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
                    <h3 className="text-xl font-bold text-white mb-3">Terminate Session?</h3>
                    <p className="text-slate-400 mb-10 text-sm leading-relaxed">
                        Unsaved configuration progress will be discarded. Do you wish to return to the landing page?
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setShowExitModal(false)} className="px-5 py-2.5 rounded-xl text-slate-400 text-sm font-bold hover:bg-slate-800">Cancel</button>
                        <button onClick={onExit} className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm transition-all hover:bg-red-500 active:scale-95 shadow-lg shadow-red-900/20">Exit Now</button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

// HELPERS
const ProcessingNode: React.FC<{label: string, icon: string}> = ({label, icon}) => (
    <div className="px-5 py-3 rounded-2xl bg-[#0a101f]/90 border border-slate-700/50 flex items-center gap-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
        <span className="material-symbols-outlined text-cyan-400 text-sm">{icon}</span>
        {label}
    </div>
)

const LanguageCard: React.FC<{flag: string, title: string, subtitle: string, selected: boolean; onClick: () => void}> = ({flag, title, subtitle, selected, onClick}) => (
    <div onClick={onClick} className={`relative flex-1 min-h-[140px] md:h-52 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group border-2 ${selected ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'}`}>
        <img src={flag} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
        <div className="absolute bottom-4 left-4">
            <h3 className="text-lg lg:text-2xl font-bold text-white">{title}</h3>
            <p className="text-[10px] lg:text-xs text-slate-300 font-medium uppercase tracking-widest">{subtitle}</p>
        </div>
        {selected && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-900/50">
                <span className="material-symbols-outlined text-black text-[14px] font-black">check</span>
            </div>
        )}
    </div>
)

const StepIndicator: React.FC<{step: number, current: number, label: string}> = ({step, current, label}) => {
    const active = current >= step;
    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${active ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-900/40' : 'bg-slate-800 text-slate-500'}`}>{step}</div>
            <span className={`text-sm font-bold tracking-tight ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
        </div>
    )
}

const Metric: React.FC<{value: string, label: string, color?: string}> = ({value, label, color = 'text-white'}) => (
    <div className="text-center">
        <div className={`text-2xl lg:text-4xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{label}</div>
    </div>
);

const AnalysisCard: React.FC<{title: string, value: string, icon: string, color: string}> = ({title, value, icon, color}) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-white/10 transition-colors">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);
