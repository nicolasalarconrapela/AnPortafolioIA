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

  // Auto-advance simulation for step 3 analysis
  useEffect(() => {
    if (step === 3 && !analysisComplete) {
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, analysisComplete]);

  // Handle preparation loading sequence
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
        
        {/* TOP BAR FOR MOBILE */}
        {!isPreparing && isAuthenticated && !interviewStarted && (
          <div className="lg:hidden flex items-center justify-between p-4 bg-[#050b14] border-b border-white/5 z-40">
            <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">deployed_code</span>
              </div>
              <span className="text-sm font-bold text-white">AnPortafolioIA</span>
            </div>
            <button onClick={() => setShowExitModal(true)} className="text-slate-400 p-2">
              <span className="material-symbols-outlined">home</span>
            </button>
          </div>
        )}

        {/* HOME BUTTON (Floating Top Right - Hidden on mobile if authenticated top bar exists) */}
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
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-8 lg:mb-12">
                    <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-4 border-2 border-indigo-500/30 rounded-full animate-pulse-slow opacity-40"></div>
                    
                    <div className="absolute inset-12 lg:inset-16 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-full shadow-[0_0_50px_rgba(34,211,238,0.4)] flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-white text-4xl lg:text-5xl animate-pulse">psychology</span>
                    </div>

                    <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
                    </div>
                </div>

                <div className="w-full max-w-sm">
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 tracking-tight">Preparing Interview Session</h2>
                    <p className="text-cyan-400 text-xs lg:text-sm font-mono mb-8 h-6 overflow-hidden">
                        <span className="animate-fade-in inline-block" key={currentPrepMsg}>
                            {PREPARING_MESSAGES[currentPrepMsg]}
                        </span>
                    </p>

                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-4 relative">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300 ease-out"
                            style={{ width: `${prepProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Neural Link</span>
                        <span className="text-cyan-400">{Math.round(prepProgress)}%</span>
                    </div>

                    <button 
                        onClick={handleCancelPreparation}
                        className="mt-8 mx-auto px-5 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 group animate-fade-in"
                    >
                        <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">cancel</span>
                        Cancel Sequence
                    </button>
                </div>
            </div>
        )}

        {/* Top Header / Breadcrumbs */}
        {!analysisComplete && !interviewStarted && !isPreparing && step !== 3 && (
            <header className="hidden lg:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-[#050b14]/50 backdrop-blur-sm z-30 transition-all duration-500 pr-24">
                <div className="flex items-center gap-4">
                    <StepIndicator step={1} current={step} label="Language" />
                    <div className="w-8 h-px bg-white/10"></div>
                    <StepIndicator step={2} current={step} label="Job Context" />
                    <div className="w-8 h-px bg-white/10"></div>
                    <StepIndicator step={3} current={step} label="Interview" />
                </div>
            </header>
        )}

        {/* INTERVIEW ROOM UI */}
        {interviewStarted ? (
            <div className="flex-1 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-[2px]"></div>
                
                {/* Responsive Interview Container */}
                <div className="relative w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 lg:pb-32">
                    
                    {/* Header bar with link (Mobile simplified) */}
                    <div className="absolute top-4 lg:top-8 left-0 right-0 flex justify-center z-40 px-4">
                        <div className="glass-panel rounded-full p-1.5 pl-4 pr-1.5 flex items-center gap-4 max-w-2xl w-full border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                             <span className="material-symbols-outlined text-cyan-400 text-sm hidden sm:block">link</span>
                             <span className="text-xs text-slate-300 font-mono truncate flex-1">tech-corp.com/careers/lead-designer</span>
                             <button className="px-4 py-1.5 bg-green-500/10 border border-green-500/50 hover:bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all">
                                Active
                             </button>
                        </div>
                    </div>

                    {/* Candidate Image */}
                    <div className="relative z-10 w-full lg:w-[600px] h-[50vh] lg:h-[700px] flex items-end justify-center mt-12 lg:mt-0">
                         <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop" 
                            alt="Candidate" 
                            className={`h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] mask-linear-fade transition-transform duration-500 ${candidateSpeaking ? 'scale-105 brightness-110' : ''}`}
                         />
                         
                         {candidateSpeaking && (
                             <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white text-xs font-bold animate-pulse">
                                 Liam is speaking...
                             </div>
                         )}
                    </div>

                    {/* Stats Card (Floating/Static on mobile) */}
                    <div className="absolute top-24 left-4 lg:top-32 lg:left-12 w-64 lg:w-80 glass-panel p-4 lg:p-5 rounded-2xl border border-white/10 animate-float z-20 scale-75 lg:scale-100 origin-top-left">
                        <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-cover" alt="Liam" />
                            <div>
                                <h3 className="text-white font-bold text-sm lg:text-lg leading-none">Liam Chen</h3>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[8px] lg:text-[10px] font-bold text-green-500 tracking-wider uppercase">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <MobileProgress label="Culture Fit" value="98%" progress={98} />
                            <MobileProgress label="Technical" value="94%" progress={94} color="bg-indigo-500" />
                        </div>
                    </div>

                    {/* Transcript Bubble (Most recent user message) */}
                    {chatMessages.length > 0 && (
                        <div className="absolute top-48 right-4 lg:right-12 max-w-[280px] lg:max-w-md animate-fade-in z-20 scale-90 lg:scale-100 origin-top-right">
                             <div className="glass-panel p-4 lg:p-6 rounded-2xl lg:rounded-3xl rounded-tr-sm border border-cyan-500/20 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                                <p className="text-sm lg:text-lg text-slate-200 leading-relaxed font-light">
                                    "{chatMessages[chatMessages.length - 1]}"
                                </p>
                             </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-4 lg:bottom-8 left-0 right-0 px-4 z-50">
                        <div className="max-w-4xl mx-auto">
                            <div className="hidden sm:flex justify-center gap-2 mb-4">
                                {['Ask about experience', 'Technical challenge', 'Soft skills check'].map((action, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSendMessage(action)}
                                        className="px-4 py-2 rounded-full glass-panel border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 text-xs transition-all"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>

                            <div className="glass-panel p-2 rounded-xl lg:rounded-2xl border border-white/10 flex items-center gap-2 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                 <button className="w-10 h-10 rounded-lg bg-slate-800/50 text-white flex items-center justify-center shrink-0 hover:bg-slate-700">
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                 </button>
                                 <input 
                                    type="text" 
                                    placeholder="Type question..." 
                                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 text-sm lg:text-lg min-w-0"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                                 />
                                 <button 
                                    onClick={() => handleSendMessage(chatInput)}
                                    className="w-10 h-10 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shrink-0 transition-colors"
                                 >
                                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                                 </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        ) : !isPreparing ? (
            <div className="flex-1 relative p-4 lg:p-8 flex items-center justify-center overflow-y-auto overflow-x-hidden">
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute top-[-10%] right-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-indigo-900/10 blur-[100px] rounded-full"></div>
                 <div className="absolute bottom-[-10%] left-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-cyan-900/10 blur-[100px] rounded-full"></div>
             </div>

             <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
                
                {step === 1 && (
                    <div className="w-full animate-fade-in flex flex-col items-center py-8">
                        <div className="mb-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
                            Preferences
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-bold text-white mb-4 text-center">Language Selection</h1>
                        <p className="text-slate-400 text-center max-w-md mb-8 lg:mb-12 text-sm">
                            Primary language for AI interactions and candidate assessments.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 mb-8 lg:mb-12 w-full max-w-2xl px-4">
                            <LanguageCard 
                                flag="https://flagcdn.com/w320/us.png" 
                                title="English" 
                                subtitle="US / UK" 
                                selected={selectedLanguage === 'en'}
                                onClick={() => setSelectedLanguage('en')}
                            />
                            <LanguageCard 
                                flag="https://flagcdn.com/w320/es.png" 
                                title="Español" 
                                subtitle="España / LATAM" 
                                selected={selectedLanguage === 'es'}
                                onClick={() => setSelectedLanguage('es')}
                            />
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            className="px-10 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 text-white font-medium rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="w-full animate-fade-in max-w-3xl px-4 py-8">
                        <div className="glass-panel p-6 lg:p-12 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-700/50">
                            <h1 className="text-xl lg:text-3xl font-bold text-white mb-2 text-center">Configure Interview</h1>
                            <p className="text-slate-400 text-center mb-8 lg:mb-10 text-sm">AI will tailor challenges based on job context.</p>

                            <div className="flex flex-col gap-6 lg:gap-8 mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-cyan-400 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm">link</span>
                                        Paste Link
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="https://company.com/job" 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none text-sm lg:text-base"
                                    />
                                </div>
                                <div className="flex items-center justify-center py-2">
                                    <div className="w-full h-px bg-slate-800"></div>
                                    <span className="px-4 text-[10px] font-bold text-slate-600">OR</span>
                                    <div className="w-full h-px bg-slate-800"></div>
                                </div>
                                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl py-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-400 mb-2">cloud_upload</span>
                                    <p className="text-xs text-slate-400">Upload PDF / DOCX</p>
                                </div>
                            </div>

                            <button onClick={() => setStep(3)} className="w-full lg:w-auto mx-auto bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                                <span className="material-symbols-outlined text-sm">analytics</span>
                                Analyze Offer
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && !analysisComplete && (
                    <div className="w-full flex flex-col items-center animate-fade-in relative z-10 py-8 px-4 overflow-hidden">
                        <div className="mb-6 lg:mb-8 text-center">
                            <h1 className="text-2xl lg:text-5xl font-bold text-white mb-4">AI Analysis Engine</h1>
                            <div className="flex items-center gap-2 justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span className="text-cyan-400 text-[10px] tracking-widest uppercase font-bold">Scanning Content</span>
                            </div>
                        </div>

                        {/* Responsive Visualization */}
                        <div className="relative w-full max-w-[800px] h-[350px] lg:h-[500px] flex items-center justify-center mb-8 overflow-hidden lg:overflow-visible">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-75 lg:scale-100">
                                <div className="w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] rounded-full border border-cyan-500/5 animate-spin-slow"></div>
                            </div>

                            <div className="relative w-48 h-64 lg:w-64 lg:h-80 bg-[#0a101f]/90 border border-cyan-500/20 rounded-xl overflow-hidden scale-90 lg:scale-100">
                                <div className="absolute inset-0 bg-grid-pattern opacity-5 lg:opacity-10"></div>
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400 laser-line animate-scan z-20"></div>
                                <div className="p-4 space-y-3 opacity-30">
                                    <div className="h-2 w-10 bg-cyan-400 rounded-full"></div>
                                    <div className="h-2 w-full bg-cyan-400 rounded-full"></div>
                                    <div className="h-2 w-4/6 bg-cyan-400 rounded-full"></div>
                                </div>
                            </div>

                            {/* Mobile-Friendly Node Layout */}
                            <div className="hidden lg:block">
                                <ProcessingNode icon="badge" label="Senior Developer" position="top-[15%] left-[5%]" delay="0s" />
                                <ProcessingNode icon="psychology" label="React, Node.js" position="top-[25%] right-[-5%]" delay="1.5s" />
                            </div>
                        </div>

                        <div className="flex items-center gap-8 lg:gap-16 mb-8 relative z-20">
                            <Metric value="87%" label="Context" />
                            <Metric value="Active" label="Extraction" color="text-cyan-400" />
                            <Metric value="0.4s" label="Speed" />
                        </div>

                        <button className="px-8 py-3 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 flex items-center gap-3 text-xs font-medium">
                            <span className="material-symbols-outlined animate-spin text-cyan-400 text-base">sync</span>
                            Synthesizing...
                        </button>
                    </div>
                )}

                {step === 3 && analysisComplete && (
                    <div className="w-full max-w-4xl animate-fade-in flex flex-col items-center py-6 px-4">
                        
                        {/* Success Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                <span className="material-symbols-outlined text-3xl text-green-400">check_circle</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                            <p className="text-slate-400 text-sm">AI has generated a tailored interview strategy based on the job context.</p>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
                            
                            {/* Card 1: Match Score */}
                            <div className="md:col-span-1 glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                     {/* SVG Circle for progress */}
                                     <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#22d3ee" strokeWidth="8" strokeDasharray="283" strokeDashoffset="28" strokeLinecap="round" className="animate-[spin_1s_ease-out_reverse]" />
                                     </svg>
                                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">94%</span>
                                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Match</span>
                                     </div>
                                </div>
                                <h3 className="text-sm font-bold text-slate-300">Role Compatibility</h3>
                                <p className="text-xs text-slate-500 mt-1">High alignment with extracted requirements.</p>
                            </div>

                            {/* Card 2: Strategic Insights */}
                            <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <span className="material-symbols-outlined text-6xl text-indigo-500">psychology</span>
                                 </div>

                                 <div className="relative z-10">
                                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-indigo-400">auto_awesome</span>
                                        Generated Strategy
                                     </h3>
                                     
                                     <div className="space-y-4">
                                         <div>
                                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                                <span className="font-bold">Primary Focus:</span>
                                                <span className="text-indigo-400">Technical Architecture</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full w-[70%]"></div>
                                            </div>
                                         </div>
                                         <div>
                                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                                <span className="font-bold">Secondary Focus:</span>
                                                <span className="text-purple-400">Team Leadership</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full w-[45%]"></div>
                                            </div>
                                         </div>
                                     </div>

                                     <div className="mt-6 flex flex-wrap gap-2">
                                        {['System Design', 'React Performance', 'Mentorship', 'Agile Process'].map((tag, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1">
                                                 {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>}
                                                 {tag}
                                            </span>
                                        ))}
                                     </div>
                                 </div>
                            </div>

                            {/* Card 3: Requirements Map */}
                            <div className="md:col-span-3 glass-panel p-6 rounded-2xl border border-slate-700/50">
                                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Requirement Extraction</h3>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                     <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
                                         <span className="material-symbols-outlined text-green-400 mt-0.5 text-lg">check_circle</span>
                                         <div>
                                             <h4 className="text-sm font-bold text-white">Frontend Core</h4>
                                             <p className="text-xs text-slate-400 mt-1">React, TypeScript, Next.js detected in job description.</p>
                                         </div>
                                     </div>
                                     <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
                                         <span className="material-symbols-outlined text-green-400 mt-0.5 text-lg">check_circle</span>
                                         <div>
                                             <h4 className="text-sm font-bold text-white">Experience Level</h4>
                                             <p className="text-xs text-slate-400 mt-1">Senior level (5+ years) requirements matched.</p>
                                         </div>
                                     </div>
                                     <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
                                         <span className="material-symbols-outlined text-orange-400 mt-0.5 text-lg">warning</span>
                                         <div>
                                             <h4 className="text-sm font-bold text-white">Soft Skills</h4>
                                             <p className="text-xs text-slate-400 mt-1">"Radical candor" culture fit needs verification.</p>
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all">
                                Adjust Parameters
                            </button>
                            <button 
                                onClick={handleStartInterview}
                                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all transform hover:scale-105 active:scale-95"
                            >
                                Start Interview Session
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

             </div>
            </div>
            ) : null}

            {showExitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
                    <div className="glass-panel border border-slate-700/50 p-6 lg:p-8 rounded-2xl max-w-md w-full">
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-2">Leave Session?</h3>
                        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                            Progress will be lost. Return to home?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setShowExitModal(false)} className="px-4 py-2 rounded-lg text-slate-400 text-sm font-medium">Cancel</button>
                            <button onClick={onExit} className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm transition-all active:scale-95">Yes, Leave</button>
                        </div>
                    </div>
                </div>
            )}

      </main>
    </div>
  );
};

const MobileProgress: React.FC<{label: string, value: string, progress: number, color?: string}> = ({label, value, progress, color = 'bg-green-400'}) => (
  <div>
      <div className="flex justify-between text-[8px] lg:text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
          <span>{label}</span>
          <span>{value}</span>
      </div>
      <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
      </div>
  </div>
)

const StepIndicator: React.FC<{step: number, current: number, label: string}> = ({step, current, label}) => {
    const active = current >= step;
    return (
        <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${active ? 'bg-cyan-500 text-black' : 'border border-slate-600 text-slate-500'}`}>{step}</div>
            <span className={`text-[11px] font-medium ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
        </div>
    )
}

const LanguageCard: React.FC<{flag: string, title: string, subtitle: string, selected: boolean; onClick?: () => void}> = ({flag, title, subtitle, selected, onClick}) => (
    <div onClick={onClick} className={`relative flex-1 min-w-[140px] h-32 lg:h-48 rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${selected ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'opacity-60 hover:opacity-100'}`}>
        <img src={flag} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-3 left-3">
            <h3 className="text-sm lg:text-xl font-bold text-white">{title}</h3>
            <p className="text-[8px] lg:text-xs text-slate-300">{subtitle}</p>
        </div>
        {selected && <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-black text-[12px] font-bold">check</span></div>}
    </div>
)

const ProcessingNode: React.FC<{label: string, icon: string, position: string, delay: string}> = ({label, icon, position, delay}) => (
    <div 
        className={`absolute ${position} px-4 py-2 rounded-full bg-[#0a101f]/90 border border-slate-700/50 flex items-center gap-3 text-xs font-medium text-slate-300 shadow-xl backdrop-blur-sm animate-float z-30`}
        style={{ animationDelay: delay }}
    >
        <span className="material-symbols-outlined text-cyan-500 text-sm">{icon}</span>
        {label}
    </div>
)

const Metric: React.FC<{value: string, label: string, color?: string}> = ({value, label, color = 'text-white'}) => (
    <div className="text-center">
        <div className={`text-xl lg:text-3xl font-bold mb-1 ${color}`}>{value}</div>
        <div className="text-[8px] lg:text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</div>
    </div>
);