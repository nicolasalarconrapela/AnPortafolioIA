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
              setTranscript(prev => [...prev, { sender: 'ai', text: step.text }]);
              
              timeout = setTimeout(() => {
                  setSpeakerState('user_listening');
                  setCurrentScriptIndex(prev => prev + 1);
              }, step.duration);
          } 
          else if (step.sender === 'user') {
              setSpeakerState('user_listening');
              
              timeout = setTimeout(() => {
                  setSpeakerState('user_speaking');
                  setTimeout(() => {
                      setTranscript(prev => [...prev, { sender: 'user', text: step.text }]);
                      setSpeakerState('ai_thinking');
                      setTimeout(() => {
                          setCurrentScriptIndex(prev => prev + 1);
                      }, 1500);

                  }, step.duration);
              }, 1000);
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
    }, 2000);
  };

  const handleEnd = () => {
    setSessionState('feedback');
  };

  const handleTestMic = () => {
      setMicStatus('testing');
      setTimeout(() => {
          setMicStatus('ok');
      }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in relative overflow-hidden bg-surface-variant dark:bg-surface-darkVariant">
      
      {/* SETUP PHASE */}
      {sessionState === 'setup' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-4xl w-full">
                <h1 className="text-3xl font-display font-normal text-[var(--md-sys-color-on-background)] mb-2 text-center">Interview Simulator</h1>
                <p className="text-outline text-center mb-10">Configure your session before connecting.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settings Card */}
                    <div className="bg-[var(--md-sys-color-background)] p-8 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col">
                        <h3 className="text-lg font-medium text-[var(--md-sys-color-on-background)] mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            Settings
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block">Interview Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Behavioral', 'Technical', 'System Design', 'Culture'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setSelectedType(type.toLowerCase())}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                                selectedType === type.toLowerCase()
                                                ? 'bg-secondary-container border-secondary-container text-secondary-onContainer'
                                                : 'border-outline-variant text-outline hover:border-outline'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-surface-variant border border-outline-variant/30 flex gap-3 items-start">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--md-sys-color-on-background)]">Pro Tip</h4>
                                    <p className="text-xs text-outline mt-1 leading-relaxed">Use the STAR method (Situation, Task, Action, Result) for better scoring on behavioral questions.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device Check */}
                    <div className="bg-[var(--md-sys-color-background)] p-8 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col">
                        <h3 className="text-lg font-medium text-[var(--md-sys-color-on-background)] mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">videocam</span>
                            Preview
                        </h3>

                        <div className="flex-1 bg-black rounded-[16px] relative overflow-hidden mb-6 aspect-video">
                             <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover opacity-90" alt="Camera Preview" />
                             
                             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2">
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                 Camera On
                             </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleTestMic}
                                disabled={micStatus === 'testing'}
                                className={`flex-1 h-12 rounded-full border border-outline font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                                    micStatus === 'ok' ? 'bg-green-100 text-green-700 border-green-200' : 'hover:bg-surface-variant'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {micStatus === 'ok' ? 'check' : (micStatus === 'testing' ? 'progress_activity' : 'mic')}
                                </span>
                                {micStatus === 'ok' ? 'Mic Working' : 'Test Mic'}
                            </button>
                            <button onClick={handleStart} className="flex-[2] h-12 bg-primary text-white hover:bg-primary-hover shadow-elevation-1 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all state-layer">
                                Start Interview
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
              <div className="w-16 h-16 border-4 border-surface-variant border-t-primary rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)]">Connecting to AI Agent...</h2>
          </div>
      )}

      {/* ACTIVE SESSION */}
      {sessionState === 'active' && (
          <div className="flex-1 flex flex-col relative bg-[#202124] text-white"> {/* Meet Dark Theme */}
              
              {/* Main Stage */}
              <div className="flex-1 relative p-4 flex gap-4 overflow-hidden justify-center items-center">
                  
                  {/* AI Avatar */}
                  <div className="relative bg-[#3c4043] rounded-[12px] overflow-hidden shadow-lg h-full max-w-4xl aspect-video flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop" 
                        className={`w-full h-full object-cover transition-opacity duration-500 ${speakerState === 'ai_speaking' ? 'opacity-100' : 'opacity-80'}`} 
                        alt="AI Interviewer" 
                      />
                      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-sm font-medium">
                          Sarah (Interviewer)
                      </div>
                      
                      {/* User PIP */}
                      <div className={`absolute top-4 right-4 w-48 aspect-video bg-[#202124] rounded-[8px] shadow-lg overflow-hidden border-2 transition-colors ${speakerState === 'user_speaking' ? 'border-green-500' : 'border-transparent'}`}>
                           <img src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg" className="w-full h-full object-cover" alt="User" />
                           {!micActive && (
                               <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                   <span className="material-symbols-outlined text-white">mic_off</span>
                               </div>
                           )}
                      </div>
                  </div>

                  {/* Transcript Sidebar */}
                  {showChatOverlay && (
                      <div className="w-80 h-full bg-white rounded-[16px] text-black flex flex-col shadow-lg overflow-hidden animate-fade-in-right">
                          <div className="p-4 border-b flex justify-between items-center bg-white">
                              <h3 className="font-display font-medium text-lg">Transcript</h3>
                              <button onClick={() => setShowChatOverlay(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                                  <span className="material-symbols-outlined">close</span>
                              </button>
                          </div>
                          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                              {transcript.map((msg, i) => (
                                  <div key={i} className={`flex flex-col ${msg.sender === 'ai' ? 'items-start' : 'items-end'}`}>
                                      <div className={`text-xs mb-1 text-gray-500`}>{msg.sender === 'ai' ? 'Interviewer' : 'You'}</div>
                                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm ${msg.sender === 'ai' ? 'bg-white border text-gray-800 rounded-tl-none' : 'bg-blue-100 text-blue-900 rounded-tr-none'}`}>
                                          {msg.text}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

              </div>

              {/* Controls Bar */}
              <div className="h-20 bg-[#202124] flex items-center justify-center gap-4 relative z-30">
                  <span className="absolute left-6 text-white/80 font-mono text-sm">{formatTime(timer)}</span>
                  
                  <ControlButton 
                    icon={micActive ? "mic" : "mic_off"} 
                    active={micActive} 
                    onClick={() => setMicActive(!micActive)} 
                    danger={!micActive}
                  />
                  <ControlButton 
                    icon={cameraActive ? "videocam" : "videocam_off"} 
                    active={cameraActive} 
                    onClick={() => setCameraActive(!cameraActive)}
                    danger={!cameraActive}
                  />
                  
                  <button onClick={handleEnd} className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 mx-2">
                      <span className="material-symbols-outlined">call_end</span>
                  </button>

                  <ControlButton 
                    icon="chat" 
                    active={showChatOverlay} 
                    onClick={() => setShowChatOverlay(!showChatOverlay)} 
                    variant="secondary"
                  />
              </div>
          </div>
      )}

      {/* FEEDBACK PHASE */}
      {sessionState === 'feedback' && (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
              <div className="max-w-4xl w-full">
                  <div className="flex items-center justify-between mb-8">
                      <h1 className="text-3xl font-display font-normal text-[var(--md-sys-color-on-background)]">Analysis Report</h1>
                      <button onClick={onBack} className="h-10 px-6 rounded-full border border-outline text-primary hover:bg-surface-variant font-medium text-sm transition-colors">
                          Exit
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="md:col-span-1 bg-[var(--md-sys-color-background)] p-6 rounded-[24px] border border-outline-variant/30 flex flex-col items-center justify-center text-center shadow-sm">
                          <div className="w-24 h-24 rounded-full border-4 border-surface-variant flex items-center justify-center mb-2 relative">
                              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" className="text-surface-variant" strokeWidth="8" />
                                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" className="text-green-600" strokeWidth="8" strokeDasharray="240" strokeDashoffset="40" strokeLinecap="round" />
                              </svg>
                              <span className="text-3xl font-bold text-[var(--md-sys-color-on-background)]">87</span>
                          </div>
                          <span className="text-sm font-medium text-outline">Overall Score</span>
                      </div>
                      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <ScoreCard label="Communication" score={92} icon="chat" />
                          <ScoreCard label="Technical Depth" score={78} icon="code" />
                          <ScoreCard label="Culture Fit" score={95} icon="diversity_3" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-[var(--md-sys-color-background)] p-6 rounded-[24px] border border-outline-variant/30 shadow-sm">
                          <h3 className="text-lg font-medium text-[var(--md-sys-color-on-background)] mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-green-600">thumb_up</span>
                              Strengths
                          </h3>
                          <ul className="space-y-3">
                              {['Clear articulation of conflict resolution strategies.', 'Effectively used the STAR method for behavioral answers.', 'Maintained excellent eye contact and pacing.'].map((item, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-[var(--md-sys-color-on-background)]">
                                      <span className="material-symbols-outlined text-green-600 text-lg mt-0.5">check</span>
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="bg-[var(--md-sys-color-background)] p-6 rounded-[24px] border border-outline-variant/30 shadow-sm">
                          <h3 className="text-lg font-medium text-[var(--md-sys-color-on-background)] mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-orange-600">lightbulb</span>
                              Improvements
                          </h3>
                          <ul className="space-y-3">
                              {['Could provide more specific metrics on the outcome of the optimization.', 'Pause usage was slightly high during the technical question.'].map((item, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-[var(--md-sys-color-on-background)]">
                                      <span className="material-symbols-outlined text-orange-600 text-lg mt-0.5">arrow_upward</span>
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

const ControlButton: React.FC<{icon: string, active: boolean, onClick: () => void, danger?: boolean, variant?: 'secondary'}> = ({icon, active, onClick, danger, variant}) => (
    <button 
        onClick={onClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            danger 
            ? 'bg-red-600/20 text-red-500 hover:bg-red-600/30' 
            : (active 
                ? (variant === 'secondary' ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] text-white hover:bg-[#4a4e51]') 
                : 'bg-[#3c4043] text-white hover:bg-[#4a4e51]')
        }`}
    >
        <span className={`material-symbols-outlined ${!active && !danger && variant !== 'secondary' ? 'text-gray-400' : ''}`}>{icon}</span>
    </button>
)

const ScoreCard: React.FC<{label: string, score: number, icon: string}> = ({label, score, icon}) => (
    <div className="bg-[var(--md-sys-color-background)] p-6 rounded-[24px] border border-outline-variant/30 flex flex-col items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-primary text-2xl mb-2">{icon}</span>
        <div className="text-2xl font-bold text-[var(--md-sys-color-on-background)]">{score}%</div>
        <div className="text-xs text-outline font-medium uppercase">{label}</div>
    </div>
)