import React, { useState, useEffect, useRef } from 'react';

interface InterviewSimulatorProps {
  onBack: () => void;
}

type SessionState = 'setup' | 'connecting' | 'active' | 'feedback';
type SpeakerState = 'ai_speaking' | 'user_listening' | 'user_speaking' | 'ai_thinking';

const MOCK_SCRIPT = [
    { sender: 'ai', text: "Hello Alex. I've analyzed your profile. I see you have significant experience with Design Systems. Can you describe a conflict you faced while scaling a system?", duration: 5000 },
    { sender: 'user', text: "Sure. At TechFlow, engineering pushed back on our token naming convention. It was causing friction in the handoff process...", duration: 4000 },
    { sender: 'ai', text: "Interesting. How did you resolve that misalignment?", duration: 3000 },
    { sender: 'user', text: "I organized a workshop with the lead engineers. We audited the existing codebase and agreed on a hybrid naming scheme that worked for both teams.", duration: 4500 },
    { sender: 'ai', text: "Collaboration is key. Now, looking at your technical skills, how would you optimize a large React application experiencing render lag?", duration: 5000 },
    { sender: 'user', text: "I would start by profiling with React DevTools. Usually, it's about memoizing expensive calculations and virtualizing long lists.", duration: 4000 },
    { sender: 'ai', text: "Excellent answer. That covers the basics. Let's wrap up. Do you have any questions for me regarding the role?", duration: 4000 },
    { sender: 'user', text: "Not at this moment, thank you.", duration: 2000 },
    { sender: 'ai', text: "Thank you, Alex. I'm processing your results now. Ending session.", duration: 3000 }
];

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ onBack }) => {
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [speakerState, setSpeakerState] = useState<SpeakerState>('ai_thinking');
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  
  // Settings
  const [selectedType, setSelectedType] = useState('behavioral');
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'ok'>('idle');
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  
  // Data
  const [transcript, setTranscript] = useState<{sender: 'ai'|'user', text: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Session Timer
  useEffect(() => {
    let interval: any;
    if (sessionState === 'active') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  // Conversation Engine
  useEffect(() => {
      if (sessionState !== 'active') return;

      let timeout: any;
      const step = MOCK_SCRIPT[currentScriptIndex];

      if (!step) {
          setTimeout(() => setSessionState('feedback'), 1000);
          return;
      }

      const processStep = () => {
          if (step.sender === 'ai') {
              setSpeakerState('ai_speaking');
              // Add to transcript immediately for AI
              setTranscript(prev => [...prev, { sender: 'ai', text: step.text }]);
              
              timeout = setTimeout(() => {
                  setSpeakerState('user_listening');
                  setCurrentScriptIndex(prev => prev + 1);
              }, step.duration);
          } 
          else if (step.sender === 'user') {
              // Wait a bit before user "starts speaking" (simulated latency/thinking)
              setSpeakerState('user_listening');
              
              timeout = setTimeout(() => {
                  setSpeakerState('user_speaking');
                  // Simulate user speaking time
                  setTimeout(() => {
                      setTranscript(prev => [...prev, { sender: 'user', text: step.text }]);
                      setSpeakerState('ai_thinking');
                      
                      // AI Thinking time
                      setTimeout(() => {
                          setCurrentScriptIndex(prev => prev + 1);
                      }, 1500);

                  }, step.duration);
              }, 1000); // 1s delay before user speaks
          }
      };

      processStep();

      return () => clearTimeout(timeout);
  }, [sessionState, currentScriptIndex]);


  const handleStart = () => {
    setSessionState('connecting');
    setTimeout(() => {
        setSessionState('active');
        setCurrentScriptIndex(0);
        setTranscript([]);
    }, 3000);
  };

  const handleEnd = () => {
    setSessionState('feedback');
  };

  const handleTestMic = () => {
      setMicStatus('testing');
      setIsMicTesting(true);
      setTimeout(() => {
          setMicStatus('ok');
          setIsMicTesting(false);
      }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in relative overflow-hidden bg-[#020408]">
      
      {/* SETUP PHASE */}
      {sessionState === 'setup' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-8 lg:mb-12">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">Interview Simulator</h1>
                    <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base">Calibrate your audio and video settings before entering the simulation with our AI recruiter.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    {/* Settings Card */}
                    <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-700/50 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <span className="material-symbols-outlined text-lg">tune</span>
                            </div>
                            Session Configuration
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Interview Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Behavioral', 'Technical', 'System Design', 'Culture Fit'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setSelectedType(type.toLowerCase())}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                                selectedType === type.toLowerCase()
                                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Difficulty Level</label>
                                <input type="range" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" defaultValue="50" />
                                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                                    <span>Junior</span>
                                    <span>Senior</span>
                                    <span>Staff</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-3 items-start">
                                <span className="material-symbols-outlined text-indigo-400 text-xl mt-0.5">info</span>
                                <div>
                                    <h4 className="text-sm font-bold text-indigo-300">Tips</h4>
                                    <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">Speak clearly and use the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device Check */}
                    <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-700/50 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <span className="material-symbols-outlined text-lg">perm_device_information</span>
                            </div>
                            Device Check
                        </h3>

                        <div className="flex-1 bg-black rounded-2xl relative overflow-hidden mb-6 border border-slate-700 group min-h-[250px]">
                             {/* Fake Camera Feed */}
                             <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover opacity-80" alt="Camera Preview" />
                             
                             {/* Audio Meter Viz */}
                             <div className="absolute bottom-4 left-4 flex gap-1 items-end h-6">
                                 {[1,2,3,4,5,6].map(i => (
                                     <div key={i} className="w-1.5 bg-green-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDuration: `${Math.random() * 0.3 + 0.1}s` }}></div>
                                 ))}
                             </div>
                             
                             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-green-400 flex items-center gap-2 border border-green-500/30">
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                 SYSTEM READY
                             </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleTestMic}
                                disabled={micStatus === 'testing'}
                                className={`flex-1 py-3.5 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    micStatus === 'ok' 
                                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                }`}
                            >
                                <span className={`material-symbols-outlined ${micStatus === 'testing' ? 'animate-spin' : ''}`}>
                                    {micStatus === 'ok' ? 'check' : (micStatus === 'testing' ? 'refresh' : 'settings_voice')}
                                </span>
                                {micStatus === 'ok' ? 'Mic OK' : (micStatus === 'testing' ? 'Testing...' : 'Test Mic')}
                            </button>
                            <button onClick={handleStart} className="flex-[2] py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95">
                                Start Session
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* CONNECTING PHASE */}
      {sessionState === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              
              <div className="relative w-40 h-40 mb-10">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-4 border-4 border-indigo-500/30 rounded-full animate-spin-slow border-t-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                       <span className="material-symbols-outlined text-5xl text-white animate-pulse">smart_toy</span>
                  </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Establishing Secure Link</h2>
              <div className="flex flex-col items-center gap-2">
                <p className="text-cyan-400 font-mono text-sm">Loading Neural Personality Model...</p>
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 animate-[pulse_1s_infinite] w-full origin-left"></div>
                </div>
              </div>
          </div>
      )}

      {/* ACTIVE SESSION */}
      {sessionState === 'active' && (
          <div className="flex-1 flex flex-col relative bg-[#020408]">
              {/* Header */}
              <div className="h-16 border-b border-slate-800 bg-[#050b14]/90 flex items-center justify-between px-4 lg:px-6 z-20">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Live</span>
                      </div>
                      <span className="text-sm font-mono text-slate-300 w-16">{formatTime(timer)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                       <span className="text-xs text-slate-400 hidden sm:inline-block">Simulated Interview Environment v2.4</span>
                       <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                       <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-400 hidden sm:inline-block">Topic:</span>
                           <span className="text-xs text-white font-bold capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700">{selectedType}</span>
                       </div>
                  </div>
              </div>

              {/* Main Stage */}
              <div className="flex-1 relative p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
                  
                  {/* AI Avatar (Main Feed) */}
                  <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-[#0a101f] rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl group w-full h-full">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop" 
                        className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${speakerState === 'ai_speaking' ? 'scale-105 brightness-110' : 'scale-100 opacity-80'}`} 
                        alt="AI Interviewer" 
                      />
                      
                      {/* AI Overlay UI */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 lg:p-8 pt-24">
                           <div className="flex items-end justify-between">
                               <div>
                                   <div className="flex items-center gap-3 mb-2">
                                       <h3 className="text-xl lg:text-2xl font-bold text-white">Sarah (AI)</h3>
                                       {speakerState === 'ai_speaking' && (
                                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">Speaking</span>
                                       )}
                                       {speakerState === 'ai_thinking' && (
                                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">Thinking</span>
                                       )}
                                   </div>
                                   {/* AI Waveform */}
                                   <div className="flex items-center gap-1 h-8">
                                       {[...Array(16)].map((_, i) => (
                                           <div 
                                            key={i} 
                                            className={`w-1 bg-cyan-400 rounded-full transition-all duration-75 ease-in-out`}
                                            style={{ 
                                                height: speakerState === 'ai_speaking' ? `${Math.random() * 100}%` : '4px',
                                                opacity: speakerState === 'ai_speaking' ? 1 : 0.2
                                            }}
                                           ></div>
                                       ))}
                                   </div>
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* User Feed (PIP) - Mobile Optimized Position */}
                  <div className={`absolute top-4 right-4 lg:top-8 lg:right-8 w-28 lg:w-64 aspect-[3/4] bg-slate-900 rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden z-20 ${speakerState === 'user_speaking' ? 'border-green-500 shadow-[0_0_20px_rgba(34,199,89,0.3)] scale-105' : 'border-slate-600'}`}>
                       <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover mirror" alt="User" />
                       
                       <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex justify-between items-end">
                                <div className="flex gap-1 items-end h-3 lg:h-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className={`w-0.5 lg:w-1 bg-green-500 rounded-full`} style={{ 
                                            height: (speakerState === 'user_speaking' && micActive) ? `${Math.random() * 100}%` : '20%' 
                                        }}></div>
                                    ))}
                                </div>
                                {!micActive && <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-red-500/80 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] lg:text-[12px] text-white">mic_off</span></div>}
                            </div>
                       </div>
                  </div>

                  {/* Transcript Overlay */}
                  <div ref={scrollRef} className={`absolute bottom-8 left-4 right-4 lg:left-8 lg:right-auto lg:w-[450px] max-h-[200px] lg:max-h-[300px] overflow-y-auto no-scrollbar z-10 flex flex-col gap-3 pointer-events-none pb-20 mask-linear-fade-top transition-opacity ${showChatOverlay ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                      {transcript.map((msg, i) => (
                          <div key={i} className={`p-4 rounded-2xl backdrop-blur-md border shadow-lg animate-fade-in transition-all ${msg.sender === 'ai' ? 'bg-slate-900/80 border-slate-700/50 rounded-tl-sm self-start' : 'bg-indigo-600/80 border-indigo-500/30 rounded-tr-sm self-end text-right'}`}>
                              <p className="text-sm lg:text-base text-slate-100 font-medium leading-relaxed">"{msg.text}"</p>
                          </div>
                      ))}
                      {speakerState === 'ai_thinking' && (
                          <div className="self-start p-3 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/30 flex gap-1">
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                          </div>
                      )}
                  </div>

              </div>

              {/* Controls Bar - Mobile Optimized */}
              <div className="h-20 lg:h-24 bg-[#050b14] border-t border-slate-800 flex items-center justify-evenly lg:justify-center gap-2 lg:gap-6 px-4 relative z-30 pb-2 lg:pb-4">
                  <ControlButton 
                    icon={micActive ? "mic" : "mic_off"} 
                    active={micActive} 
                    onClick={() => setMicActive(!micActive)} 
                    color={micActive ? "bg-slate-800" : "bg-red-500/20 text-red-500"} 
                    tooltip="Toggle Mic"
                  />
                  <ControlButton 
                    icon={cameraActive ? "videocam" : "videocam_off"} 
                    active={cameraActive} 
                    onClick={() => setCameraActive(!cameraActive)}
                    color={cameraActive ? "bg-slate-800" : "bg-red-500/20 text-red-500"} 
                    tooltip="Toggle Camera"
                  />
                  
                  <button onClick={handleEnd} className="h-12 lg:h-14 px-6 lg:px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 lg:gap-3 transition-all shadow-lg shadow-red-900/20 mx-2 active:scale-95 group">
                      <span className="material-symbols-outlined text-xl lg:text-2xl group-hover:scale-110 transition-transform">call_end</span>
                      <span className="hidden sm:inline">End Session</span>
                  </button>

                  <ControlButton 
                    icon={showChatOverlay ? "chat_bubble" : "chat_bubble_outline"} 
                    active={showChatOverlay} 
                    onClick={() => setShowChatOverlay(!showChatOverlay)} 
                    color={showChatOverlay ? "bg-slate-700 text-cyan-400" : "bg-slate-800"} 
                    tooltip="Toggle Transcript" 
                  />
                  <ControlButton icon="settings" active={false} onClick={() => alert("Settings Modal")} color="bg-slate-800" tooltip="Settings" />
              </div>
          </div>
      )}

      {/* FEEDBACK PHASE */}
      {sessionState === 'feedback' && (
          <div className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center custom-scrollbar">
              <div className="max-w-5xl w-full animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-6 border-b border-slate-800 gap-4 sm:gap-0 text-center sm:text-left">
                      <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Performance Analysis</h1>
                        <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">timer</span> {formatTime(timer)} Duration</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">category</span> {selectedType}</span>
                        </div>
                      </div>
                      <button onClick={onBack} className="px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-bold text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined">dashboard</span>
                          Return to Dashboard
                      </button>
                  </div>

                  {/* Top Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <div className="md:col-span-1 glass-panel p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                          <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center mb-3 relative">
                              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="#22d3ee" strokeWidth="8" strokeDasharray="290" strokeDashoffset="40" strokeLinecap="round" />
                              </svg>
                              <span className="text-3xl font-bold text-white">87</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-400">Overall Score</h4>
                      </div>
                      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <ScoreCard label="Communication" score={92} color="text-cyan-400" icon="chat" />
                          <ScoreCard label="Technical Depth" score={78} color="text-indigo-400" icon="code" />
                          <ScoreCard label="Culture Fit" score={95} color="text-purple-400" icon="diversity_3" />
                      </div>
                  </div>

                  {/* Detailed Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-green-500/20 bg-gradient-to-b from-green-900/10 to-transparent">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                <span className="material-symbols-outlined">thumb_up</span>
                              </div>
                              Strengths
                          </h3>
                          <ul className="space-y-4">
                              {['Clear articulation of conflict resolution strategies.', 'Effectively used the STAR method for behavioral answers.', 'Maintained excellent eye contact and pacing.', 'Showed deep understanding of frontend performance.'].map((item, i) => (
                                  <li key={i} className="flex gap-4 text-sm text-slate-300">
                                      <span className="material-symbols-outlined text-green-500 text-base mt-0.5 shrink-0">check_circle</span>
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-orange-500/20 bg-gradient-to-b from-orange-900/10 to-transparent">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                                <span className="material-symbols-outlined">lightbulb</span>
                              </div>
                              Areas for Improvement
                          </h3>
                          <ul className="space-y-4">
                              {['Could provide more specific metrics on the outcome of the optimization.', 'Pause usage was slightly high during the technical question.', 'Elaborate more on the cross-functional collaboration aspect.'].map((item, i) => (
                                  <li key={i} className="flex gap-4 text-sm text-slate-300">
                                      <span className="material-symbols-outlined text-orange-500 text-base mt-0.5 shrink-0">arrow_upward</span>
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{icon: string, active: boolean, onClick: () => void, color: string, tooltip?: string}> = ({icon, active, onClick, color, tooltip}) => (
    <button 
        onClick={onClick}
        title={tooltip}
        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all ${color} ${!color.includes('red') ? 'hover:bg-slate-700 text-slate-200 hover:text-white' : ''} border border-white/5 hover:scale-105 active:scale-95`}
    >
        <span className="material-symbols-outlined text-xl lg:text-2xl">{icon}</span>
    </button>
)

const ScoreCard: React.FC<{label: string, score: number, color: string, icon: string}> = ({label, score, color, icon}) => (
    <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className={`absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className={`text-4xl font-bold mb-2 ${color}`}>{score}%</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800">
            <div className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
        </div>
    </div>
)