
import React, { useState, useRef } from 'react';

interface AvatarCreatorProps {
  onBack: () => void;
  onComplete: () => void;
  isDashboard?: boolean;
}

// Map colors to descriptive labels for screen readers
const SKIN_TONES = [
    { color: '#f8d9ce', label: 'Pale / Light' },
    { color: '#eac0b6', label: 'Fair / Beige' },
    { color: '#d2a18e', label: 'Tan / Medium' },
    { color: '#8d5524', label: 'Brown / Dark' },
    { color: '#3d2314', label: 'Black / Very Dark' }
];

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({ onBack, onComplete, isDashboard = false }) => {
  const [activeTab, setActiveTab] = useState<'base' | 'hair' | 'style'>('base');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [avatarImage, setAvatarImage] = useState("https://www.shutterstock.com/image-illustration/animated-young-business-man-avatar-260nw-2574951157.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
        setIsGenerating(false);
        onComplete();
    }, 1500);
  };

  const handleRandomize = () => {
    setIsGenerating(true);
    setTimeout(() => {
        setIsGenerating(false);
    }, 1000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setIsGenerating(true);
      setTimeout(() => {
          setAvatarImage(imageUrl);
          setIsGenerating(false);
      }, 1500);
    }
  };

  const tabs = [
    { id: 'base', icon: 'face', label: 'Face' },
    { id: 'hair', icon: 'face_3', label: 'Hair' },
    { id: 'style', icon: 'checkroom', label: 'Style' },
  ];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-6 animate-fade-in text-left bg-[var(--md-sys-color-background)] lg:bg-transparent overflow-hidden">
        
        {/* TOP/LEFT: Preview Area */}
        <div className="flex-1 lg:flex-[1.2] relative min-h-[40vh] lg:min-h-[400px] flex flex-col bg-surface-variant/50 lg:bg-transparent lg:rounded-[24px] overflow-hidden">
            <div 
                className="relative flex-1 flex items-center justify-center lg:border border-outline-variant/30 lg:shadow-inner group lg:rounded-[24px] overflow-hidden"
                role="img"
                aria-label="3D Avatar Preview Area"
            >
                
                {/* Simple Gradient Backing */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-black/5"></div>

                <div className="relative z-10 w-[200px] md:w-[280px] h-[250px] md:h-[350px] transition-transform duration-500 ease-out" style={{ transform: `rotateY(${rotation}deg)` }}>
                    <img 
                        src={avatarImage} 
                        alt="Generated Avatar Preview" 
                        className="w-full h-full object-cover rounded-2xl shadow-xl" 
                    />
                </div>

                {/* Floating Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-[var(--md-sys-color-background)]/80 backdrop-blur-md p-1.5 rounded-full shadow-elevation-2 border border-outline-variant/20">
                     <button 
                        onClick={() => setRotation(r => r + 45)} 
                        className="w-10 h-10 rounded-full hover:bg-surface-variant text-outline hover:text-primary transition-colors flex items-center justify-center active:scale-90"
                        aria-label="Rotate Avatar"
                     >
                        <span className="material-symbols-outlined text-xl">360</span>
                     </button>
                     <div className="w-px h-6 bg-outline-variant self-center"></div>
                     <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-10 h-10 rounded-full hover:bg-surface-variant text-outline hover:text-primary transition-colors flex items-center justify-center active:scale-90" 
                        aria-label="Upload Photo"
                     >
                        <span className="material-symbols-outlined text-xl">add_a_photo</span>
                     </button>
                </div>

                {/* Loading Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center" aria-live="assertive">
                        <div className="w-12 h-12 border-4 border-primary-container border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>

        {/* BOTTOM/RIGHT: Controls - Bottom Sheet style on Mobile */}
        <div className="flex-1 bg-[var(--md-sys-color-background)] lg:rounded-[24px] p-5 lg:p-6 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:shadow-sm lg:border border-outline-variant/30 rounded-t-[28px] -mt-6 relative z-30 lg:mt-0">
            
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto mb-4 lg:hidden"></div>

            <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg md:text-xl font-display font-medium text-[var(--md-sys-color-on-background)]">{isDashboard ? 'Avatar Studio' : 'Customize'}</h3>
                <button 
                    onClick={handleRandomize} 
                    className="text-xs font-bold text-primary hover:bg-primary-container/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 bg-primary-container/10"
                >
                    <span className="material-symbols-outlined text-base">casino</span>
                    Random
                </button>
            </div>

            {/* Tab Navigation */}
            <div role="tablist" className="flex p-1 bg-surface-variant rounded-full mb-6 shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-[var(--md-sys-color-background)] text-primary shadow-sm' 
                            : 'text-outline hover:text-[var(--md-sys-color-on-background)]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Options Area */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                {activeTab === 'base' && (
                    <div role="tabpanel" id="panel-base" className="space-y-6 animate-fade-in pb-4">
                        <div 
                            role="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 rounded-2xl border border-dashed border-outline-variant active:bg-surface-variant transition-colors flex items-center gap-4 cursor-pointer"
                        >
                             <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary-onContainer flex items-center justify-center">
                                <span className="material-symbols-outlined">upload</span>
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-[var(--md-sys-color-on-background)]">Generate from Selfie</h4>
                                 <p className="text-xs text-outline">AI creates base</p>
                             </div>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-outline mb-3 block uppercase tracking-wider">Skin Tone</label>
                            <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                                {SKIN_TONES.map((item, i) => (
                                    <button 
                                        key={i} 
                                        aria-label={item.label}
                                        className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary transition-all shadow-sm active:scale-90" 
                                        style={{ backgroundColor: item.color }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'hair' && (
                     <div role="tabpanel" id="panel-hair" className="grid grid-cols-3 gap-3 animate-fade-in pb-4">
                        {['short_text', 'face_3', 'palette', 'brush', 'content_cut', 'star'].map((icon, i) => (
                            <button 
                                key={i} 
                                className="aspect-square rounded-2xl bg-surface-variant border-2 border-transparent active:border-primary flex items-center justify-center transition-all text-outline active:text-primary active:scale-95"
                            >
                                <span className="material-symbols-outlined text-2xl">{icon}</span>
                            </button>
                        ))}
                     </div>
                )}

                {activeTab === 'style' && (
                     <div role="tabpanel" id="panel-style" className="grid grid-cols-2 gap-3 animate-fade-in pb-4">
                        {['Business', 'Casual', 'Creative', 'Tech'].map((style, i) => (
                            <button 
                                key={i} 
                                className="p-4 rounded-2xl border border-outline-variant active:border-primary active:bg-surface-variant text-sm font-medium transition-all text-[var(--md-sys-color-on-background)]"
                            >
                                {style}
                            </button>
                        ))}
                     </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center gap-3 shrink-0 pb-safe">
                {!isDashboard && (
                    <button onClick={onBack} className="px-5 py-3 rounded-full text-outline font-medium text-sm hover:bg-surface-variant transition-colors">
                        Back
                    </button>
                )}
                <button 
                    onClick={handleGenerate} 
                    className="flex-1 h-12 rounded-full bg-primary text-white hover:bg-primary-hover shadow-elevation-1 transition-all font-medium text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                    {isGenerating ? 'Processing...' : 'Save Avatar'}
                    {!isGenerating && <span className="material-symbols-outlined text-lg">check</span>}
                </button>
            </div>
        </div>
    </div>
  );
};