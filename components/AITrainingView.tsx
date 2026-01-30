import React, { useState, useEffect } from 'react';

interface AITrainingViewProps {
  onBack: () => void;
  onComplete: () => void;
  isDashboard?: boolean;
}

export const AITrainingView: React.FC<AITrainingViewProps> = ({ onBack, onComplete, isDashboard = false }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(isDashboard ? "Coach Online" : "Ready to configure coach");
  
  const [strictnessValue, setStrictnessValue] = useState(75);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['ATS Expert', 'Storyteller']);

  const coachingStyles = [
    { id: 'ATS Expert', icon: 'find_in_page', desc: 'Keyword Optimization' },
    { id: 'Storyteller', icon: 'auto_stories', desc: 'Narrative Building' },
    { id: 'Executive', icon: 'diamond', desc: 'Leadership Focus' },
    { id: 'Tech Recruiter', icon: 'terminal', desc: 'Skill Validation' },
    { id: 'Mentor', icon: 'volunteer_activism', desc: 'Supportive Growth' },
    { id: 'Strategist', icon: 'strategy', desc: 'Market Positioning' }
  ];

  const handleTraitToggle = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setStatusText("Loading Career Frameworks...");
  };

  useEffect(() => {
    if (isTraining) {
      const messages = [
        "Indexing Certification Standards...",
        "Analyzing Volunteer Impact Patterns...",
        "Calibrating Project Showcase Modules...",
        "Loading Education Verification Protocols...",
        "Finalizing Career Strategy Engine..."
      ];
      
      let msgIndex = 0;
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev % 20 === 0 && prev < 80) {
             setStatusText(messages[msgIndex++ % messages.length]);
          }
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setIsTraining(false);
        onComplete();
      }, 500);
    }
  }, [progress, onComplete]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 animate-fade-in relative pb-10">
        
        {/* LEFT: Visualizer */}
        <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-28 h-28 lg:w-56 lg:h-56 flex items-center justify-center">
                <div className={`absolute inset-0 border border-cyan-500/20 rounded-full border-dashed ${isTraining ? 'animate-spin' : 'animate-spin-slow'}`}></div>
                <div className={`absolute inset-6 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-500 blur-lg opacity-40 ${isTraining ? 'animate-pulse' : ''}`}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-3xl lg:text-5xl text-white">school</span>
                    {isTraining && <span className="text-lg lg:text-xl font-bold text-white mt-1">{progress}%</span>}
                </div>
            </div>
            <div className="mt-4 text-center">
                <h3 className="text-base lg:text-xl font-bold text-white">{statusText}</h3>
                <p className="text-slate-500 text-[10px] lg:text-xs mt-1">Specialized Career & Profile Optimization</p>
            </div>
        </div>

        {/* RIGHT: Controls */}
        <div className={`flex-1 flex flex-col gap-6 transition-all duration-500 ${isTraining ? 'opacity-30 pointer-events-none' : ''}`}>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        <span>Feedback Style: {strictnessValue < 40 ? 'Encouraging' : (strictnessValue > 80 ? 'Ruthless' : 'Balanced')}</span>
                        <span className="text-cyan-400">{strictnessValue}% Intensity</span>
                    </div>
                    <input type="range" min="0" max="100" value={strictnessValue} onChange={(e) => setStrictnessValue(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                    <p className="text-[10px] text-slate-500 mt-2">
                        Adjusts how critically the AI reviews your Experience, Projects, and Certifications.
                    </p>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Coaching Expertise</label>
                    <div className="grid grid-cols-2 gap-2">
                        {coachingStyles.map((trait) => (
                            <button 
                                key={trait.id} 
                                onClick={() => handleTraitToggle(trait.id)} 
                                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left group ${
                                    selectedTraits.includes(trait.id) 
                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-white' 
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${selectedTraits.includes(trait.id) ? 'text-cyan-400' : 'text-slate-600'}`}>{trait.icon}</span>
                                <div>
                                    <span className="text-xs font-bold block">{trait.id}</span>
                                    <span className="text-[9px] opacity-70">{trait.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-slate-800 mt-4">
                {!isDashboard && (
                    <button onClick={onBack} className="px-5 py-3 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-800 transition-colors">
                        Back
                    </button>
                )}
                <button 
                    onClick={handleStartTraining} 
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-cyan-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isTraining ? 'Configuring Coach...' : (isDashboard ? 'Update Coach Settings' : 'Initialize Career Coach')}
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                </button>
            </div>
        </div>
    </div>
  );
};
