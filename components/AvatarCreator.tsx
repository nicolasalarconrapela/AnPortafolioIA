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
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 animate-fade-in text-left">
        
        {/* LEFT: Preview Area */}
        <div className="flex-1 lg:flex-[1.2] relative min-h-[400px] flex flex-col">
            <div 
                className="relative flex-1 bg-surface-variant rounded-[24px] overflow-hidden flex items-center justify-center border border-outline-variant/30 shadow-inner group"
                role="img"
                aria-label="3D Avatar Preview Area"
            >
                
                {/* Simple Gradient Backing */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-black/5"></div>

                <div className="relative z-10 w-[240px] md:w-[280px] h-[300px] md:h-[350px] transition-transform duration-500 ease-out" style={{ transform: `rotateY(${rotation}deg)` }}>
                    <img 
                        src={avatarImage} 
                        alt="Generated Avatar Preview" 
                        className="w-full h-full object-cover rounded-2xl shadow-xl" 
                    />
                </div>

                {/* Floating Controls - High contrast focus rings */}
                <div className="absolute bottom-6 flex gap-3 z-20 bg-[var(--md-sys-color-background)]/95 backdrop-blur-md p-2 rounded-full shadow-elevation-1 border border-outline-variant/20">
                     <button 
                        onClick={() => setRotation(r => r + 45)} 
                        className="w-10 h-10 rounded-full hover:bg-surface-variant text-outline hover:text-primary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label="Rotate Avatar 45 degrees"
                     >
                        <span className="material-symbols-outlined text-xl">360</span>
                     </button>
                     <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-10 h-10 rounded-full hover:bg-surface-variant text-outline hover:text-primary transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                        title="Upload Photo"
                        aria-label="Generate avatar from uploaded photo"
                     >
                        <span className="material-symbols-outlined text-xl">add_a_photo</span>
                     </button>
                </div>

                {/* Loading Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center" aria-live="assertive">
                        <div className="w-12 h-12 border-4 border-primary-container border-t-primary rounded-full animate-spin"></div>
                        <span className="sr-only">Generating avatar...</span>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex-1 bg-[var(--md-sys-color-background)] rounded-[24px] p-6 flex flex-col shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)]">{isDashboard ? 'Avatar Studio' : 'Customize'}</h3>
                <button 
                    onClick={handleRandomize} 
                    className="text-sm font-medium text-primary hover:bg-primary-container/20 px-3 py-1 rounded-full transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Randomize Avatar Features"
                >
                    <span className="material-symbols-outlined text-lg">casino</span>
                    Random
                </button>
            </div>

            {/* Tab Navigation - Semantically robust */}
            <div role="tablist" className="flex p-1 bg-surface-variant rounded-full mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                            activeTab === tab.id 
                            ? 'bg-[var(--md-sys-color-background)] text-primary shadow-sm' 
                            : 'text-outline hover:text-[var(--md-sys-color-on-background)]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Options Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[250px]">
                {activeTab === 'base' && (
                    <div role="tabpanel" id="panel-base" aria-labelledby="tab-base" className="space-y-6 animate-fade-in">
                        {/* Photo Upload CTA */}
                        <div 
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 rounded-2xl border border-dashed border-outline-variant hover:border-primary cursor-pointer hover:bg-surface-variant transition-colors flex items-center gap-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                            aria-label="Upload a photo to generate a base avatar"
                        >
                             <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary-onContainer flex items-center justify-center">
                                <span className="material-symbols-outlined">upload</span>
                             </div>
                             <div>
                                 <h4 className="text-sm font-bold text-[var(--md-sys-color-on-background)]">Generate from Photo</h4>
                                 <p className="text-xs text-outline">Use AI to create base from selfie</p>
                             </div>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} aria-hidden="true" />
                        </div>

                        <div>
                            <label id="skin-tone-label" className="text-xs font-bold text-outline mb-3 block uppercase tracking-wider">Skin Tone</label>
                            <div role="radiogroup" aria-labelledby="skin-tone-label" className="flex gap-3 flex-wrap">
                                {SKIN_TONES.map((item, i) => (
                                    <button 
                                        key={i} 
                                        role="radio"
                                        aria-checked="false" // In real app, this would check against state
                                        aria-label={`Select ${item.label} skin tone`}
                                        className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                                        style={{ backgroundColor: item.color }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="age-slider" className="text-xs font-bold text-outline mb-3 block uppercase tracking-wider">Age</label>
                            <input 
                                id="age-slider"
                                type="range" 
                                min="18"
                                max="80"
                                className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'hair' && (
                     <div role="tabpanel" id="panel-hair" aria-labelledby="tab-hair" className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-3 gap-3">
                            {['short_text', 'face_3', 'palette', 'brush', 'content_cut', 'star'].map((icon, i) => (
                                <button 
                                    key={i} 
                                    className="aspect-square rounded-2xl bg-surface-variant border-2 border-transparent hover:border-primary flex items-center justify-center transition-all text-outline hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label={`Select hair style ${i + 1}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                     </div>
                )}

                {activeTab === 'style' && (
                     <div role="tabpanel" id="panel-style" aria-labelledby="tab-style" className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                            {['Business', 'Casual', 'Creative', 'Tech'].map((style, i) => (
                                <button 
                                    key={i} 
                                    className="p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-surface-variant text-sm font-medium transition-all text-[var(--md-sys-color-on-background)] focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                     </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-outline-variant/50 flex items-center gap-4">
                {!isDashboard && (
                    <button onClick={onBack} className="px-6 py-3 rounded-full text-outline font-medium text-sm hover:bg-surface-variant transition-colors focus-visible:ring-2 focus-visible:ring-primary">
                        Back
                    </button>
                )}
                <button 
                    onClick={handleGenerate} 
                    className="flex-1 h-12 rounded-full bg-primary text-white hover:bg-primary-hover shadow-elevation-1 transition-all font-medium text-sm flex items-center justify-center gap-2 state-layer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    {isGenerating ? 'Processing...' : 'Save Avatar'}
                    {!isGenerating && <span className="material-symbols-outlined text-lg">check</span>}
                </button>
            </div>
        </div>
    </div>
  );
};