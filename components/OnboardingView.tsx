import React, { useState } from 'react';
import { AvatarCreator } from './AvatarCreator';

interface OnboardingViewProps {
  onComplete: () => void;
}

const STEPS_CONFIG = [
    {
        id: 'avatar',
        icon: 'face',
        title: 'Create Your 3D Avatar',
        desc: 'Design your photorealistic AI avatar for interviews.',
        color: 'cyan'
    },
    {
        id: 'linkedin',
        icon: 'work_history',
        title: 'Sync LinkedIn Profile',
        desc: 'Import your professional experience instantly.',
        color: 'indigo'
    },
    {
        id: 'ai',
        icon: 'smart_toy',
        title: 'Train Your AI Assistant',
        desc: 'Personalize your AI with your preferences and goals.',
        color: 'purple'
    }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [isWelcome, setIsWelcome] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>(['avatar', 'linkedin', 'ai']);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Determine which steps are active based on user selection
  const activeSteps = STEPS_CONFIG.filter(step => selectedItems.includes(step.id));
  const currentStep = activeSteps[currentStepIndex];

  const handleStart = () => {
    if (selectedItems.length === 0) {
        onComplete();
        return;
    }
    setIsWelcome(false);
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
      if (currentStepIndex < activeSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  const handleBack = () => {
      if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
      } else {
          // If on the first step, go back to Welcome screen to change selection
          setIsWelcome(true);
      }
  };

  const toggleSelection = (id: string) => {
    if (selectedItems.includes(id)) {
        setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
        setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div className="relative z-20 flex w-full h-screen bg-[#020408] items-center justify-center p-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full transition-all duration-1000 ${!isWelcome ? 'opacity-50 scale-150' : ''}`}></div>
            <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full transition-all duration-1000 ${!isWelcome ? 'opacity-50 scale-150' : ''}`}></div>
        </div>

        {isWelcome ? (
            // WELCOME SCREEN
            <div className="relative z-10 w-full max-w-[480px] animate-fade-in">
                <div className="glass-panel p-8 md:p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Inner Glow */}
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-purple-500 opacity-50"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                        Welcome & Initial Setup
                    </h2>
                    <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                        Select the modules you want to set up today.
                    </p>

                    <div className="space-y-4 mb-8">
                        {STEPS_CONFIG.map((item) => (
                             <WelcomeItem 
                                key={item.id}
                                id={item.id}
                                isSelected={selectedItems.includes(item.id)}
                                onClick={() => toggleSelection(item.id)}
                                icon={item.id === 'linkedin' ? 'work' : item.icon} 
                                title={item.title} 
                                desc={item.desc}
                                color={item.color}
                                customIcon={item.id === 'linkedin' ? <span className="font-bold text-lg">in</span> : undefined}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleStart}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedItems.length === 0}
                    >
                        {selectedItems.length === 0 ? 'Select at least one' : "Let's Get Started"}
                    </button>
                </div>
            </div>
        ) : (
            // WIZARD FLOW
            <div className="glass-panel w-full max-w-6xl min-h-[650px] rounded-3xl border border-slate-700/50 flex overflow-hidden shadow-2xl relative animate-fade-in">
                 {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-20">
                    <div 
                        className="h-full bg-cyan-400 transition-all duration-500 ease-out" 
                        style={{ width: `${((currentStepIndex + 1) / activeSteps.length) * 100}%` }}
                    ></div>
                </div>

                {/* Steps Sidebar - Only showing SELECTED items */}
                <div className="w-64 border-r border-slate-700/50 p-8 hidden lg:block bg-slate-900/30 shrink-0">
                    <h3 className="text-xl font-bold text-white mb-2">Setup Progress</h3>
                    <p className="text-slate-400 text-sm mb-8">Your personalized setup plan.</p>

                    <div className="space-y-6">
                        {activeSteps.map((step, index) => (
                            <StepItem 
                                key={step.id}
                                icon={step.icon} 
                                title={step.title} 
                                desc={step.desc}
                                active={index === currentStepIndex}
                                completed={index < currentStepIndex}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center relative overflow-y-auto">
                    
                    {/* DYNAMIC CONTENT SWITCHER */}
                    {currentStep?.id === 'avatar' && (
                        <AvatarCreator onBack={handleBack} onComplete={handleNext} />
                    )}

                    {currentStep?.id === 'linkedin' && (
                        <div className="text-center animate-fade-in max-w-md w-full flex flex-col items-center">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#0077b5]/20 to-slate-500/20 rounded-xl flex items-center justify-center mb-6 border border-[#0077b5]/30">
                                <span className="font-bold text-5xl text-[#0077b5]">in</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Import Professional Data</h2>
                            <p className="text-slate-400 mb-8">Connect your LinkedIn profile to automatically populate your experience, education, and skills timeline.</p>
                            
                            <div className="w-full flex flex-col gap-3 max-w-xs">
                                <button onClick={handleNext} className="w-full px-8 py-3 bg-[#0077b5] hover:bg-[#006097] text-white font-bold rounded-xl shadow-lg transition-all">
                                    Connect LinkedIn
                                </button>
                                <button onClick={handleNext} className="w-full py-2 text-slate-500 hover:text-white text-sm font-medium">
                                    Skip for now
                                </button>
                                <button onClick={handleBack} className="text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors border-t border-slate-700/50 mt-2">
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep?.id === 'ai' && (
                        <div className="text-center animate-fade-in max-w-md w-full flex flex-col items-center">
                             <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                                <span className="material-symbols-outlined text-5xl text-purple-400">psychology</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">AI Personality Calibration</h2>
                            <p className="text-slate-400 mb-8">We are initializing your AI agent based on the provided data. This creates a voice that sounds like you.</p>
                            
                            <div className="w-full flex flex-col gap-3 max-w-xs">
                                <button onClick={handleNext} className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
                                    {currentStepIndex === activeSteps.length - 1 ? 'Finish Setup' : 'Continue'}
                                </button>
                                <button onClick={handleBack} className="text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors">
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

// Item for the "Welcome" Dashboard screen
const WelcomeItem: React.FC<{
    id: string;
    isSelected: boolean;
    onClick: () => void;
    icon: string; 
    title: string; 
    desc: string; 
    color: string; 
    customIcon?: React.ReactNode
}> = ({ id, isSelected, onClick, icon, title, desc, color, customIcon }) => {
    // Style mappings based on color
    const styles: any = {
        cyan: {
            text: 'text-cyan-400',
            border: isSelected ? 'border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-cyan-500/50',
            checkBg: isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600',
            checkIcon: isSelected ? 'text-black' : 'text-slate-400'
        },
        indigo: {
            text: 'text-indigo-400',
            border: isSelected ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-indigo-500/50',
            checkBg: isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600',
            checkIcon: isSelected ? 'text-white' : 'text-slate-400'
        },
        purple: {
            text: 'text-purple-400',
            border: isSelected ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-purple-500/50',
            checkBg: isSelected ? 'bg-purple-500 border-purple-500' : 'border-slate-600',
            checkIcon: isSelected ? 'text-white' : 'text-slate-400'
        }
    };

    const currentStyle = styles[color] || styles.cyan;

    return (
        <div 
            onClick={onClick}
            className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 group select-none
                ${isSelected 
                    ? `bg-slate-800/80 border ${currentStyle.border}` 
                    : 'bg-slate-900/30 border border-slate-700/30 hover:bg-slate-800/50'
                }`}
        >
            <div className="mt-1">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${currentStyle.checkBg} ${!isSelected && 'group-hover:border-slate-500'}`}>
                     <span className={`material-symbols-outlined text-xs font-bold transition-all ${currentStyle.checkIcon} ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>check</span>
                </div>
            </div>
            
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 bg-[#0a101f] transition-all duration-300 ${currentStyle.border} ${currentStyle.text}`}>
                {customIcon ? customIcon : <span className="material-symbols-outlined text-2xl">{icon}</span>}
            </div>
            
            <div>
                <h4 className={`font-bold text-base transition-colors ${isSelected ? 'text-white' : 'text-slate-200'}`}>{title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

// Item for the Sidebar Wizard
const StepItem: React.FC<{icon: string, title: string, desc: string, active: boolean, completed: boolean}> = ({ icon, title, desc, active, completed }) => {
    return (
        <div className={`flex gap-4 p-4 rounded-xl transition-all ${active ? 'bg-slate-800/50 border border-cyan-500/30' : 'opacity-60'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${active || completed ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                {completed ? <span className="material-symbols-outlined">check</span> : <span className="material-symbols-outlined">{icon}</span>}
            </div>
            <div>
                <h4 className={`font-bold text-sm ${active || completed ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{desc}</p>
            </div>
        </div>
    )
}