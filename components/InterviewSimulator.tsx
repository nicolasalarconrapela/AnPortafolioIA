import React, { useState, useEffect, useRef } from 'react';

interface InterviewSimulatorProps {
  onBack: () => void;
}

type SessionState = 'setup' | 'connecting' | 'active' | 'feedback';

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ onBack }) => {
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [selectedType, setSelectedType] = useState('behavioral');
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [timer, setTimer] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{sender: 'ai'|'user', text: string}[]>([]);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (sessionState === 'active') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
      
      // Simulate initial AI greeting
      if (transcript.length === 0) {
        setTimeout(() => {
            setAiSpeaking(true);
            setTimeout(() => {
                setTranscript([{ sender: 'ai', text: "Hello Alex. I've reviewed your profile. Can you tell me about a time you had to resolve a conflict within your design team?" }]);
                setAiSpeaking(false);
            }, 2000);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [sessionState, transcript]);

  const handleStart = () => {
    setSessionState('connecting');
    setTimeout(() => setSessionState('active'), 3000);
  };

  const handleEnd = () => {
    setSessionState('feedback');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in relative overflow-hidden">
      
      {/* SETUP PHASE */}
      {sessionState === 'setup' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Interview Simulator</h1>
                    <p className="text-slate-400">Practice with our AI avatar in a realistic environment.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Settings Card */}
                    <div className="glass-panel p-8 rounded-3xl border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400">tune</span>
                            Session Configuration
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Interview Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Behavioral', 'Technical', 'System Design', 'Culture Fit'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setSelectedType(type.toLowerCase())}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                                selectedType === type.toLowerCase()
                                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Difficulty</label>
                                <input type="range" className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" defaultValue="50" />
                                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase">
                                    <span>Junior</span>
                                    <span>Senior</span>
                                    <span>Staff</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device Check */}
                    <div className="glass-panel p-8 rounded-3xl border border-slate-700/50 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-400">perm_device_information</span>
                            Device Check
                        </h3>

                        <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden mb-6 border border-slate-700 group">
                             {/* Fake Camera Feed */}
                             <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover opacity-80" alt="Camera Preview" />
                             
                             {/* Audio Meter Viz */}
                             <div className="absolute bottom-4 left-4 flex gap-1 items-end h-4">
                                 {[1,2,3,4,5].map(i => (
                                     <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 0.5 + 0.2}s` }}></div>
                                 ))}
                             </div>
                             
                             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-green-400 flex items-center gap-2">
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                 READY
                             </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">settings_voice</span>
                                Test Mic
                            </button>
                            <button onClick={handleStart} className="flex-[2] py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2">
                                Start Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* CONNECTING PHASE */}
      {sessionState === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 border-4 border-indigo-500/30 rounded-full animate-spin-slow border-t-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                       <span className="material-symbols-outlined text-4xl text-white animate-pulse">smart_toy</span>
                  </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Establishing Secure Link</h2>
              <p className="text-cyan-400 font-mono text-sm">Loading Neural Personality Model...</p>
          </div>
      )}

      {/* ACTIVE SESSION */}
      {sessionState === 'active' && (
          <div className="flex-1 flex flex-col relative bg-[#020408]">
              {/* Header */}
              <div className="h-16 border-b border-slate-800 bg-[#050b14]/90 flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-red-400 tracking-wider uppercase">Live Session</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-sm font-mono text-slate-300">{formatTime(timer)}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                       <span className="text-xs text-slate-400 font-medium">Topic:</span>
                       <span className="text-xs text-white font-bold capitalize">{selectedType}</span>
                  </div>
              </div>

              {/* Main Stage */}
              <div className="flex-1 relative p-4 lg:p-6 flex gap-4 lg:gap-6 overflow-hidden">
                  
                  {/* AI Avatar (Main Feed) */}
                  <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-[#0a101f] rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl group">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop" 
                        className="w-full h-full object-cover opacity-80 transition-transform duration-[10s] ease-in-out group-hover:scale-105" 
                        alt="AI Interviewer" 
                      />
                      
                      {/* AI Overlay UI */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 pt-20">
                           <div className="flex items-end justify-between">
                               <div>
                                   <div className="flex items-center gap-3 mb-2">
                                       <h3 className="text-2xl font-bold text-white">Sarah (AI)</h3>
                                       <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Interviewer</span>
                                   </div>
                                   {/* Waveform */}
                                   <div className="flex items-center gap-1 h-8">
                                       {[...Array(12)].map((_, i) => (
                                           <div 
                                            key={i} 
                                            className={`w-1.5 bg-cyan-400 rounded-full transition-all duration-100 ${aiSpeaking ? 'animate-pulse' : 'h-1 opacity-20'}`}
                                            style={{ height: aiSpeaking ? `${Math.random() * 100}%` : '4px' }}
                                           ></div>
                                       ))}
                                   </div>
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* User Feed (PIP) */}
                  <div className="absolute top-8 right-8 w-48 lg:w-64 aspect-[3/4] bg-slate-900 rounded-2xl border border-slate-600 shadow-2xl overflow-hidden z-20">
                       <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover mirror" alt="User" />
                       <div className="absolute bottom-3 left-3 flex gap-2">
                            {!micActive && <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center"><span className="material-symbols-outlined text-[12px] text-white">mic_off</span></div>}
                       </div>
                  </div>

                  {/* Transcript Overlay */}
                  <div className="absolute bottom-8 left-8 right-8 lg:right-auto lg:w-[500px] z-10 flex flex-col gap-2 pointer-events-none">
                      {transcript.map((msg, i) => (
                          <div key={i} className={`p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg animate-fade-in ${msg.sender === 'ai' ? 'bg-slate-900/80 rounded-tl-sm self-start' : 'bg-indigo-900/80 rounded-tr-sm self-end text-right'}`}>
                              <p className="text-sm lg:text-base text-slate-100 font-medium leading-relaxed">"{msg.text}"</p>
                          </div>
                      ))}
                  </div>

              </div>

              {/* Controls Bar */}
              <div className="h-20 bg-[#050b14] border-t border-slate-800 flex items-center justify-center gap-4 px-6 relative z-30">
                  <ControlButton 
                    icon={micActive ? "mic" : "mic_off"} 
                    active={micActive} 
                    onClick={() => setMicActive(!micActive)} 
                    color={micActive ? "bg-slate-800" : "bg-red-500/20 text-red-500"} 
                  />
                  <ControlButton 
                    icon={cameraActive ? "videocam" : "videocam_off"} 
                    active={cameraActive} 
                    onClick={() => setCameraActive(!cameraActive)}
                    color={cameraActive ? "bg-slate-800" : "bg-red-500/20 text-red-500"} 
                  />
                  
                  <button onClick={handleEnd} className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 mx-4">
                      <span className="material-symbols-outlined">call_end</span>
                      End Session
                  </button>

                  <ControlButton icon="chat_bubble" active={false} onClick={() => {}} color="bg-slate-800" />
                  <ControlButton icon="settings" active={false} onClick={() => {}} color="bg-slate-800" />
              </div>
          </div>
      )}

      {/* FEEDBACK PHASE */}
      {sessionState === 'feedback' && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col items-center">
              <div className="max-w-4xl w-full animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Performance Analysis</h1>
                        <p className="text-slate-400">Session duration: {formatTime(timer)} • Type: {selectedType}</p>
                      </div>
                      <button onClick={onBack} className="px-5 py-2.5 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-bold text-sm">
                          Return to Dashboard
                      </button>
                  </div>

                  {/* Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <ScoreCard label="Overall Match" score={85} color="text-green-400" />
                      <ScoreCard label="Communication" score={92} color="text-cyan-400" />
                      <ScoreCard label="Technical Depth" score={78} color="text-indigo-400" />
                  </div>

                  {/* Feedback Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="glass-panel p-6 rounded-2xl border border-green-500/20">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-green-400">thumb_up</span>
                              Strengths
                          </h3>
                          <ul className="space-y-3">
                              {['Clear articulation of conflict resolution', 'Used STAR method effectively', 'Maintained good eye contact'].map((item, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                                      <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="glass-panel p-6 rounded-2xl border border-orange-500/20">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-orange-400">lightbulb</span>
                              Areas for Improvement
                          </h3>
                          <ul className="space-y-3">
                              {['Could provide more specific technical details', 'Pause usage was slightly high', 'Elaborate more on the outcome metrics'].map((item, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                                      <span className="material-symbols-outlined text-orange-500 text-sm mt-0.5">warning</span>
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

const ControlButton: React.FC<{icon: string, active: boolean, onClick: () => void, color: string}> = ({icon, active, onClick, color}) => (
    <button 
        onClick={onClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${color} ${!color.includes('red') ? 'hover:bg-slate-700 text-white' : ''} border border-white/5`}
    >
        <span className="material-symbols-outlined">{icon}</span>
    </button>
)

const ScoreCard: React.FC<{label: string, score: number, color: string}> = ({label, score, color}) => (
    <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className={`text-4xl font-bold mb-2 ${color}`}>{score}%</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
            <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
        </div>
    </div>
)
