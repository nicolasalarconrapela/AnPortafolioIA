
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
    <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-8 animate-fade-in relative pb-4 h-full">
        
        {/* LEFT: Visualizer - Adaptive (Small Bar on Mobile, Big Circle on Desktop) */}
        <div 
            className="flex flex-row lg:flex-col items-center justify-between lg:justify-center shrink-0 lg:w-1/3 bg-[var(--md-sys-color-background)] rounded-[16px] lg:rounded-[24px] p-4 lg:p-8 border border-outline-variant/30 shadow-sm transition-all sticky top-0 z-10"
            role="region" 
            aria-label="Training Status Visualizer"
        >
            {/* Mobile Compact View */}
            <div className="flex items-center gap-3 lg:hidden w-full">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary-container text-primary-onContainer shrink-0 relative overflow-hidden`}>
                    {isTraining && <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>}
                    <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[var(--md-sys-color-on-background)] truncate">{statusText}</h3>
                    {isTraining && (
                        <div className="w-full h-1 bg-surface-variant rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}
                </div>
                <span className="text-xs font-mono font-bold text-primary">{isTraining ? `${progress}%` : 'Ready'}</span>
            </div>

            {/* Desktop Hero View */}
            <div className="hidden lg:flex relative w-40 h-40 items-center justify-center mb-6">
                <div className={`absolute inset-0 rounded-full border-4 border-dashed border-primary/20 ${isTraining ? 'animate-spin-slow' : ''}`}></div>
                <div className={`absolute inset-4 rounded-full bg-primary/5 ${isTraining ? 'animate-pulse' : ''}`}></div>
                <div className="relative z-10 flex flex-col items-center justify-center bg-primary-container w-24 h-24 rounded-full text-primary-onContainer shadow-elevation-1">
                    <span className="material-symbols-outlined text-4xl" aria-hidden="true">school</span>
                    {isTraining && (
                        <span 
                            className="absolute -bottom-8 text-lg font-bold text-primary"
                            role="progressbar" 
                            aria-valuenow={progress} 
                            aria-valuemin={0} 
                            aria-valuemax={100}
                        >
                            {progress}%
                        </span>
                    )}
                </div>
            </div>
            
            <div className="hidden lg:block text-center max-w-xs" aria-live="polite">
                <h3 className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)] mb-2">{statusText}</h3>
                <p className="text-sm text-outline">
                    {isTraining 
                        ? "Please wait while we calibrate your personal agent..." 
                        : "Customize how the AI analyzes your profile and prepares you for interviews."}
                </p>
            </div>
        </div>

        {/* RIGHT: Controls */}
        <div className={`flex-1 flex flex-col gap-4 md:gap-6 transition-all duration-500 overflow-y-auto px-1 md:pr-2 custom-scrollbar pb-safe ${isTraining ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            
            {/* Slider Card */}
            <div className="bg-[var(--md-sys-color-background)] p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-outline-variant/30 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" aria-hidden="true">tune</span>
                        <h4 className="font-medium text-[var(--md-sys-color-on-background)]" id="intensity-label">Feedback Intensity</h4>
                    </div>
                    <span className="text-xs md:text-sm font-bold text-primary bg-primary-container px-2 py-1 rounded-md">
                        {strictnessValue}%
                    </span>
                </div>
                
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={strictnessValue}
                    aria-labelledby="intensity-label" 
                    onChange={(e) => setStrictnessValue(parseInt(e.target.value))} 
                    className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover mb-2 touch-pan-x" 
                />
                
                <div className="flex justify-between text-[10px] md:text-xs text-outline font-medium uppercase tracking-wider" aria-hidden="true">
                    <span>Soft</span>
                    <span>Balanced</span>
                    <span>Critical</span>
                </div>
            </div>

            {/* Persona Grid */}
            <div className="bg-[var(--md-sys-color-background)] p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-outline-variant/30 shadow-sm flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-secondary" aria-hidden="true">psychology</span>
                    <h4 className="font-medium text-[var(--md-sys-color-on-background)]">Coaching Persona</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Select Coaching Styles">
                    {coachingStyles.map((trait) => {
                        const isSelected = selectedTraits.includes(trait.id);
                        return (
                            <button 
                                key={trait.id} 
                                onClick={() => handleTraitToggle(trait.id)}
                                aria-pressed={isSelected}
                                className={`p-3 md:p-4 rounded-[16px] border flex items-center md:items-start gap-3 transition-all text-left group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none active:scale-[0.98] ${
                                    isSelected 
                                    ? 'bg-secondary-container border-secondary-container text-secondary-onContainer shadow-sm' 
                                    : 'bg-surface-variant/30 border-outline-variant/50 text-[var(--md-sys-color-on-background)] hover:bg-surface-variant hover:border-outline-variant'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-xl md:text-2xl ${isSelected ? 'text-secondary-onContainer' : 'text-outline group-hover:text-primary'}`} aria-hidden="true">
                                    {trait.icon}
                                </span>
                                <div className="z-10 flex-1 min-w-0">
                                    <span className="text-sm font-bold block mb-0.5 truncate">{trait.id}</span>
                                    <span className={`text-xs ${isSelected ? 'text-secondary-onContainer/80' : 'text-outline'} truncate block`}>{trait.desc}</span>
                                </div>
                                {isSelected && (
                                    <span className="text-secondary-onContainer/50 material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions - Sticky on Mobile */}
            <div className="flex items-center gap-3 mt-auto pt-4 sticky bottom-0 bg-[var(--md-sys-color-background)]/90 backdrop-blur-sm p-1 z-10 lg:static lg:bg-transparent">
                {!isDashboard && (
                    <button onClick={onBack} className="px-4 py-3 rounded-full border border-outline text-primary font-medium text-sm hover:bg-surface-variant transition-colors shrink-0">
                        Back
                    </button>
                )}
                <button 
                    onClick={handleStartTraining} 
                    className="flex-1 h-12 rounded-full bg-primary text-white hover:bg-primary-hover shadow-elevation-1 hover:shadow-elevation-2 transition-all font-medium text-sm flex items-center justify-center gap-2 state-layer active:scale-95"
                >
                    {isTraining ? 'Configuring...' : (isDashboard ? 'Update Coach' : 'Initialize Coach')}
                    {!isTraining && <span className="material-symbols-outlined text-lg" aria-hidden="true">auto_awesome</span>}
                </button>
            </div>
        </div>
    </div>
  );
};