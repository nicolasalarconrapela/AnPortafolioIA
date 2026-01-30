import React, { useState, useEffect } from 'react';

interface AITrainingViewProps {
  onBack: () => void;
  onComplete: () => void;
  isDashboard?: boolean;
}

export const AITrainingView: React.FC<AITrainingViewProps> = ({ onBack, onComplete, isDashboard = false }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(isDashboard ? "Agent Online" : "Ready to calibrate");
  
  const [toneValue, setToneValue] = useState(65);
  const [detailValue, setDetailValue] = useState(40);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Analytical', 'Problem Solver']);

  const traits = [
    { id: 'Analytical', icon: 'query_stats' },
    { id: 'Creative', icon: 'lightbulb' },
    { id: 'Leader', icon: 'diversity_3' },
    { id: 'Problem Solver', icon: 'build' },
    { id: 'Empathetic', icon: 'volunteer_activism' },
    { id: 'Technical', icon: 'terminal' }
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
    setStatusText("Calibrating Neural Core...");
  };

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
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
        
        {/* LEFT: Visualizer - Resized for mobile */}
        <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-28 h-28 lg:w-56 lg:h-56 flex items-center justify-center">
                <div className={`absolute inset-0 border border-purple-500/20 rounded-full border-dashed ${isTraining ? 'animate-spin' : 'animate-spin-slow'}`}></div>
                <div className={`absolute inset-6 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 blur-lg opacity-40 ${isTraining ? 'animate-pulse' : ''}`}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-3xl lg:text-5xl text-white">psychology</span>
                    {isTraining && <span className="text-lg lg:text-xl font-bold text-white mt-1">{progress}%</span>}
                </div>
            </div>
            <div className="mt-4 text-center">
                <h3 className="text-base lg:text-xl font-bold text-white">{statusText}</h3>
                <p className="text-slate-500 text-[10px] lg:text-xs mt-1">AI agent personality calibration</p>
            </div>
        </div>

        {/* RIGHT: Controls - Fluid height */}
        <div className={`flex-1 flex flex-col gap-6 transition-all duration-500 ${isTraining ? 'opacity-30 pointer-events-none' : ''}`}>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        <span>Tone: {toneValue < 50 ? 'Casual' : 'Professional'}</span>
                        <span className="text-purple-400">{toneValue}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={toneValue} onChange={(e) => setToneValue(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Persona Traits</label>
                    <div className="grid grid-cols-2 gap-2">
                        {traits.map((trait) => (
                            <button 
                                key={trait.id} 
                                onClick={() => handleTraitToggle(trait.id)} 
                                className={`p-3 rounded-xl border flex items-center gap-2 transition-all text-left ${
                                    selectedTraits.includes(trait.id) 
                                    ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">{trait.icon}</span>
                                <span className="text-[10px] font-bold">{trait.id}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions - Always visible and tactile */}
            <div className="flex items-center gap-3 pt-6 border-t border-slate-800 mt-4">
                {!isDashboard && (
                    <button onClick={onBack} className="px-5 py-3 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-800 transition-colors">
                        Back
                    </button>
                )}
                <button 
                    onClick={handleStartTraining} 
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isTraining ? 'Initializing...' : (isDashboard ? 'Update Core' : 'Initialize Agent')}
                    <span className="material-symbols-outlined text-base">bolt</span>
                </button>
            </div>
        </div>
    </div>
  );
};
