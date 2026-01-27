import React, { useState } from 'react';
import { ViewState } from '../types';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="relative z-20 flex w-full h-screen bg-[#020408] items-center justify-center p-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${(step/3)*100}%` }}></div>
        </div>

        <div className="glass-panel w-full max-w-4xl min-h-[600px] rounded-3xl border border-slate-700/50 flex overflow-hidden shadow-2xl relative">
            
            {/* Steps Sidebar */}
            <div className="w-1/3 border-r border-slate-700/50 p-8 hidden md:block bg-slate-900/30">
                <h3 className="text-xl font-bold text-white mb-2">Welcome & Initial Setup</h3>
                <p className="text-slate-400 text-sm mb-8">Complete these steps to start your AI recruitment journey.</p>

                <div className="space-y-6">
                    <StepItem 
                        icon="face" 
                        title="Create Your 3D Avatar" 
                        desc="Design your photorealistic AI avatar for interviews."
                        active={step === 1}
                        completed={step > 1}
                    />
                    <StepItem 
                        icon="work_history" 
                        title="Sync LinkedIn Profile" 
                        desc="Import your professional experience instantly."
                        active={step === 2}
                        completed={step > 2}
                    />
                    <StepItem 
                        icon="smart_toy" 
                        title="Train Your AI Assistant" 
                        desc="Personalize your AI with your preferences and goals."
                        active={step === 3}
                        completed={step > 3}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center relative">
                {step === 1 && (
                    <div className="text-center animate-fade-in max-w-md">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-6 relative group cursor-pointer border border-cyan-500/30 hover:border-cyan-400 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-cyan-400">add_a_photo</span>
                            <div className="absolute inset-0 rounded-full animate-pulse-slow bg-cyan-400/5"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Create Your Digital Twin</h2>
                        <p className="text-slate-400 mb-8">Upload a selfie to generate your AI avatar. This will be your face during automated screening interviews.</p>
                        <button onClick={() => setStep(2)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                            Upload Photo & Generate
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center animate-fade-in max-w-md">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#0077b5]/20 to-slate-500/20 rounded-xl flex items-center justify-center mb-6 border border-[#0077b5]/30">
                            <span className="font-bold text-5xl text-[#0077b5]">in</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Import Professional Data</h2>
                        <p className="text-slate-400 mb-8">Connect your LinkedIn profile to automatically populate your experience, education, and skills timeline.</p>
                        <button onClick={() => setStep(3)} className="px-8 py-3 bg-[#0077b5] hover:bg-[#006097] text-white font-bold rounded-xl shadow-lg transition-all">
                            Connect LinkedIn
                        </button>
                        <button onClick={() => setStep(3)} className="mt-4 text-slate-500 hover:text-white text-sm block mx-auto">Skip for now</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center animate-fade-in max-w-md">
                         <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                            <span className="material-symbols-outlined text-5xl text-purple-400">psychology</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">AI Personality calibration</h2>
                        <p className="text-slate-400 mb-8">We are initializing your AI agent with your resume data. This might take a moment.</p>
                        <button onClick={onComplete} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
                            Finish Setup
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const StepItem: React.FC<{icon: string, title: string, desc: string, active: boolean, completed: boolean}> = ({ icon, title, desc, active, completed }) => {
    return (
        <div className={`flex gap-4 p-4 rounded-xl transition-all ${active ? 'bg-slate-800/50 border border-cyan-500/30' : 'opacity-60'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${active || completed ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                {completed ? <span className="material-symbols-outlined">check</span> : <span className="material-symbols-outlined">{icon}</span>}
            </div>
            <div>
                <h4 className={`font-bold text-sm ${active || completed ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}