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
  
  // Configuration State
  const [toneValue, setToneValue] = useState(65); // 0-100
  const [detailValue, setDetailValue] = useState(40); // 0-100
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Analytical', 'Problem Solver']);

  const traits = [
    { id: 'Analytical', icon: 'query_stats' },
    { id: 'Creative', icon: 'lightbulb' },
    { id: 'Leader', icon: 'diversity_3' },
    { id: 'Problem Solver', icon: 'build' },
    { id: 'Empathetic', icon: 'volunteer_activism' },
    { id: 'Strategic', icon: 'strategy' },
    { id: 'Diplomatic', icon: 'handshake' },
    { id: 'Technical', icon: 'terminal' }
  ];

  const handleTraitToggle = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      // Limit removed to allow unlimited selections
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setStatusText(isDashboard ? "Re-calibrating Neural Core..." : "Initializing Neural Core...");
  };

  // Simulation of training process
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // Simulate different stages based on progress
          if (prev === 20) setStatusText("Mapping Professional Experience...");
          if (prev === 50) setStatusText("Synthesizing Tone & Style...");
          if (prev === 80) setStatusText("Finalizing Personality Matrix...");
          return prev + 1;
        });
      }, 40); // Approx 4 seconds

      return () => clearInterval(interval);
    }
  }, [isTraining]);

  // Complete when progress hits 100
  useEffect(() => {
    if (progress === 100) {
      setStatusText(isDashboard ? "Optimization Complete." : "Calibration Complete.");
      setTimeout(() => {
        setIsTraining(false); // Reset training state for dashboard reuse
        setProgress(0);
        onComplete();
      }, 800);
    }
  }, [progress, onComplete, isDashboard]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-8 animate-fade-in text-left relative overflow-hidden">
        
        {/* LEFT: AI Core Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
            {/* The Orb */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Rotating Rings */}
                <div className={`absolute inset-0 border border-purple-500/20 rounded-full border-dashed ${isTraining ? 'animate-spin' : 'animate-spin-slow'} transition-all duration-[2000ms]`}></div>
                <div className={`absolute inset-4 border border-cyan-500/20 rounded-full border-dashed ${isTraining ? 'animate-spin-reverse-slow duration-700' : 'animate-spin-reverse-slow'} transition-all`}></div>
                
                {/* Glowing Core */}
                <div className={`absolute inset-16 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 blur-md ${isTraining ? 'animate-pulse' : 'animate-float'}`}></div>
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-purple-500/50 to-cyan-400/50 mix-blend-overlay"></div>
                
                {/* Icon/Status */}
                <div className="relative z-10 flex flex-col items-center">
                    <span className={`material-symbols-outlined text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] ${isTraining && 'animate-bounce'}`}>
                        {progress === 100 ? 'check_circle' : 'psychology'}
                    </span>
                    {isTraining && (
                         <span className="text-2xl font-bold text-white mt-2">{progress}%</span>
                    )}
                </div>

                {/* Particles/Effects */}
                {!isTraining && (
                    <div className="absolute top-0 right-0 p-2 animate-bounce delay-700">
                         <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
                    </div>
                )}
            </div>

            {/* Status Text */}
            <div className="mt-8 text-center">
                <h3 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 transition-all ${isTraining ? 'animate-pulse' : ''}`}>
                    {statusText}
                </h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                    {isTraining 
                        ? "Please wait while we calibrate your AI agent..." 
                        : (isDashboard ? "Agent is active and interviewing candidates." : "Configure how your AI represents you to recruiters.")}
                </p>
                
                {isTraining && (
                    <button 
                        onClick={() => { setIsTraining(false); setProgress(0); }}
                        className="mt-6 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-2 mx-auto animate-fade-in group"
                    >
                        <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">close</span>
                        Cancel
                    </button>
                )}
            </div>
        </div>

        {/* RIGHT: Calibration Controls */}
        <div className={`flex-1 bg-slate-900/40 border border-slate-700/50 rounded-2xl p-8 flex flex-col transition-all duration-500 ${isTraining ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <span className="material-symbols-outlined">tune</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Personality Matrix</h3>
                    <p className="text-xs text-slate-400">Fine-tune your agent's behavior</p>
                </div>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                
                {/* Sliders */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-3">
                            <span>Communication Tone</span>
                            <span className="text-purple-400">{toneValue}% | {toneValue < 50 ? 'Casual & Friendly' : 'Formal & Professional'}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={toneValue} 
                            onChange={(e) => setToneValue(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
                            <span>Casual</span>
                            <span>Formal</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-3">
                            <span>Response Detail</span>
                            <span className="text-cyan-400">{detailValue}% | {detailValue < 50 ? 'Concise & Direct' : 'Detailed & Thorough'}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={detailValue} 
                            onChange={(e) => setDetailValue(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                        />
                         <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
                            <span>Concise</span>
                            <span>Detailed</span>
                        </div>
                    </div>
                </div>

                {/* Traits Selection */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Key Traits
                        </label>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">
                            {selectedTraits.length} Selected
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {traits.map((trait) => {
                            const isSelected = selectedTraits.includes(trait.id);
                            return (
                                <button
                                    key={trait.id}
                                    onClick={() => handleTraitToggle(trait.id)}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                        isSelected 
                                        ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-purple-400' : 'text-slate-500'}`}>
                                        {trait.icon}
                                    </span>
                                    <span className="text-xs font-bold">{trait.id}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center gap-4">
                {!isDashboard && (
                    <button 
                        onClick={onBack} 
                        disabled={isTraining}
                        className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 text-sm font-bold transition-all disabled:opacity-50"
                    >
                        Back
                    </button>
                )}
                <button 
                    onClick={handleStartTraining} 
                    disabled={isTraining}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        {isTraining ? 'Calibrating...' : (isDashboard ? 'Update Configuration' : 'Initialize Agent')}
                        {!isTraining && <span className="material-symbols-outlined text-lg">rocket_launch</span>}
                    </span>
                </button>
            </div>
        </div>
    </div>
  );
};