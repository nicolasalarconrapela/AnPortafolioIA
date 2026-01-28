import React, { useState } from 'react';

interface AvatarCreatorProps {
  onBack: () => void;
  onComplete: () => void;
  isDashboard?: boolean;
}

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({ onBack, onComplete, isDashboard = false }) => {
  const [activeTab, setActiveTab] = useState<'base' | 'hair' | 'style'>('base');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
        setIsGenerating(false);
        onComplete();
    }, 1500);
  };

  const tabs = [
    { id: 'base', icon: 'face', label: 'Face & Skin' },
    { id: 'hair', icon: 'face_3', label: 'Hair' },
    { id: 'style', icon: 'checkroom', label: 'Outfit' },
  ];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 animate-fade-in text-left">
        
        {/* LEFT: Preview Area */}
        <div className="flex-1 lg:flex-[1.2] relative min-h-[400px] flex flex-col">
            <div className="relative flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden flex items-center justify-center group">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none perspective-floor"></div>
                <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none"></div>

                {/* Avatar Model (Image Mockup) */}
                <div className="relative z-10 w-[280px] h-[350px] transition-transform duration-500" style={{ transform: `rotateY(${rotation}deg)` }}>
                    <img 
                        src="https://www.shutterstock.com/image-illustration/animated-young-business-man-avatar-260nw-2574951157.jpg" 
                        alt="3D Avatar Preview" 
                        className="w-full h-full object-cover rounded-xl drop-shadow-[0_0_30px_rgba(34,211,238,0.2)] mask-linear-fade filter brightness-110 contrast-110" 
                    />
                    
                    {/* Scanning Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-scan opacity-50"></div>
                    </div>
                </div>

                {/* Holographic Base */}
                <div className="absolute bottom-10 w-48 h-12 bg-cyan-500/10 blur-xl rounded-[100%] transform rotate-x-60"></div>
                <div className="absolute bottom-12 w-64 h-64 border border-cyan-500/10 rounded-full border-dashed animate-spin-slow pointer-events-none"></div>

                {/* Floating Controls for Preview */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
                     <button className="p-2 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 transition-all text-slate-300 hover:text-cyan-400">
                        <span className="material-symbols-outlined text-sm">360</span>
                     </button>
                     <button className="p-2 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 transition-all text-slate-300 hover:text-cyan-400">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                     </button>
                </div>

                {/* Loading State Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase animate-pulse">Processing Biometrics...</span>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex-1 bg-slate-900/30 border border-slate-700/50 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{isDashboard ? 'Avatar Studio' : 'Customization'}</h3>
                <button className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
                    <span className="material-symbols-outlined text-sm">casino</span>
                    Randomize
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-slate-800 text-white shadow-lg border border-slate-700' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <span className="material-symbols-outlined text-base">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'base' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">Skin Tone</label>
                            <div className="flex gap-3">
                                {['#f8d9ce', '#eac0b6', '#d2a18e', '#8d5524', '#3d2314'].map((color, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-cyan-400 transition-all transform hover:scale-110" style={{ backgroundColor: color }}></div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">Face Shape</label>
                             <div className="grid grid-cols-3 gap-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="aspect-square rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/50 cursor-pointer flex items-center justify-center transition-all hover:bg-slate-700">
                                        <span className="material-symbols-outlined text-slate-500">face</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">Age Factor</label>
                            <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                        </div>
                    </div>
                )}

                {activeTab === 'hair' && (
                     <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">Hair Style</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['short_text', 'face_3', 'palette', 'brush', 'content_cut', 'star'].map((icon, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/50 cursor-pointer flex items-center justify-center transition-all hover:bg-slate-700 group">
                                        <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400">{icon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">Hair Color</label>
                            <div className="flex gap-3 flex-wrap">
                                {['#1a1a1a', '#4a3b32', '#9e5e33', '#e6be8a', '#8c959e', '#b83b3b'].map((color, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-cyan-400 transition-all transform hover:scale-110 border border-white/10" style={{ backgroundColor: color }}></div>
                                ))}
                            </div>
                        </div>
                     </div>
                )}

                {activeTab === 'style' && (
                     <div className="space-y-6 animate-fade-in">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/20 to-indigo-900/20 border border-cyan-500/20 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <span className="material-symbols-outlined">auto_fix_high</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Smart Casual</h4>
                                <p className="text-[10px] text-slate-400">Recommended for Tech roles</p>
                            </div>
                            <button className="ml-auto text-cyan-400 text-xs font-bold">Apply</button>
                        </div>

                         <div>
                            <label className="text-xs font-bold text-slate-400 mb-3 block uppercase tracking-wider">Outfit Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Formal', 'Casual', 'Startup', 'Creative'].map((style, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/50 cursor-pointer text-center transition-all hover:bg-slate-700">
                                        <span className="text-xs font-medium text-slate-300">{style}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center gap-4">
                {!isDashboard && (
                    <button onClick={onBack} className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 text-sm font-bold transition-all">
                        Back
                    </button>
                )}
                <button onClick={handleGenerate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-2">
                    {isGenerating ? 'Processing...' : (isDashboard ? 'Update Avatar' : 'Save Avatar')}
                    {!isGenerating && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                </button>
            </div>
        </div>
    </div>
  );
};