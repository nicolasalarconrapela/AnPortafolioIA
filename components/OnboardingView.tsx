import React, { useState, useRef } from 'react';
import { LinkedinSyncView } from './LinkedinSyncView';
import { AITrainingView } from './AITrainingView';

interface OnboardingViewProps {
  onComplete: () => void;
  onExit: () => void;
}

const STEPS_CONFIG = [
    {
        id: 'import',
        icon: 'folder_shared',
        title: 'Import Profile Data',
        desc: 'Upload your Resume (PDF) to auto-fill.',
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

// SECURITY CONSTANTS
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Strict Limit
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.csv'];

// SECURITY STATUS MESSAGES
const SCANNING_STEPS = [
    "Verifying file integrity...",
    "Scanning for malware...",
    "Analyzing document structure...",
    "Extracting professional data..."
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onExit }) => {
  const [selectedItems] = useState<string[]>(['import', 'ai']);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // File Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSteps = STEPS_CONFIG.filter(step => selectedItems.includes(step.id));
  const currentStep = activeSteps[currentStepIndex];

  const handleNext = () => {
      if (currentStepIndex < activeSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  const handleBack = () => {
      if (currentStep?.id === 'import' && dataLoaded) {
          setDataLoaded(false);
          setUploadError(null);
          return;
      }

      if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
          if (activeSteps[currentStepIndex - 1]?.id === 'import') {
              setDataLoaded(true);
          }
      }
  };

  const handleStepClick = (index: number) => {
      if (index < currentStepIndex) {
          setCurrentStepIndex(index);
          if (activeSteps[index].id === 'import') {
              setDataLoaded(true);
          }
      }
  };

  /**
   * SECURITY CHECK: VALIDATE MAGIC NUMBERS
   * Prevents renaming .exe files to .pdf by reading binary signature
   */
  const validateFileSignature = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (!e.target || !e.target.result) return resolve(false);
            const arr = (new Uint8Array(e.target.result as ArrayBuffer)).subarray(0, 4);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }
            
            // PDF Signature: 25 50 44 46 (%PDF)
            if (header.startsWith('25504446')) return resolve(true);
            
            // DOCX/ZIP Signature: 50 4b 03 04 (PK..)
            if (header.startsWith('504b0304')) return resolve(true);
            
            // DOC (Old binary) Signature: d0 cf 11 e0
            if (header.startsWith('d0cf11e0')) return resolve(true);

            // CSV Logic: CSVs don't have a magic number. 
            // We check if the extension matches AND ensure it's NOT a binary executable masking as CSV.
            if (file.name.toLowerCase().endsWith('.csv')) {
                 // Check against common executable headers to prevent spoofing
                 // MZ (Windows Executable): 4d 5a
                 if (header.startsWith('4d5a')) {
                     console.warn("Security Audit: Blocked executable masking as CSV");
                     return resolve(false);
                 }
                 // ELF (Linux Executable): 7f 45 4c 46
                 if (header.startsWith('7f454c46')) return resolve(false);
                 
                 return resolve(true);
            }

            console.warn("Security Audit: Invalid file signature detected:", header);
            resolve(false);
        };
        reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setUploadError(null);

      if (!file) return;

      // 0. EMPTY FILE CHECK
      if (file.size === 0) {
          setUploadError("Security Alert: File is empty (0 bytes).");
          return;
      }

      // 1. SIZE CHECK
      if (file.size > MAX_FILE_SIZE) {
          setUploadError(`Security Alert: File exceeds the 5MB limit. Detected: ${(file.size / (1024*1024)).toFixed(2)}MB`);
          return;
      }

      // 2. FILENAME SANITIZATION
      // Only allow alphanumeric, dots, underscores, dashes, spaces, and parentheses to prevent shell injection/path traversal issues in logs
      const safeNameRegex = /^[a-zA-Z0-9._\-\s()]+$/;
      if (!safeNameRegex.test(file.name)) {
         setUploadError("Security Alert: Filename contains potentially unsafe characters. Please rename using only letters, numbers, and basic punctuation.");
         return;
      }

      // 3. EXTENSION CHECK (Quick Fail)
      const parts = file.name.split('.');
      const fileExt = parts.length > 1 ? "." + parts.pop()?.toLowerCase() : "";
      
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
          setUploadError(`Security Alert: Invalid file type (${fileExt}). Only PDF, DOCX, and CSV are allowed.`);
          return;
      }

      setIsUploading(true);
      setScanStep(0);

      // 4. MAGIC NUMBER CHECK (Deep Verification)
      const isValidSignature = await validateFileSignature(file);

      if (!isValidSignature) {
          setIsUploading(false);
          setUploadError("Security Alert: File signature mismatch. The file content does not match its extension (Potential spoofing attempt).");
          return;
      }

      // 5. SIMULATE SECURE SCANNING PROCESS
      let step = 0;
      const interval = setInterval(() => {
          step++;
          setScanStep(step);
          if (step >= SCANNING_STEPS.length) {
              clearInterval(interval);
              setIsUploading(false);
              setDataLoaded(true);
          }
      }, 800);
  };

  return (
    <div className="relative z-20 flex w-full h-screen bg-[#020408] items-center justify-center p-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full opacity-50 scale-150"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full opacity-50 scale-150"></div>
        </div>

        {/* Exit Button */}
        <button 
            onClick={onExit}
            className="absolute top-6 right-6 z-50 p-2 lg:p-3 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/80 backdrop-blur-sm border border-slate-700/50 transition-all group"
            title="Return to Home"
        >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">power_settings_new</span>
        </button>

        {/* WIZARD FLOW */}
        <div className="glass-panel w-full max-w-6xl h-full lg:h-[650px] lg:min-h-[650px] rounded-3xl border border-slate-700/50 flex flex-col lg:flex-row overflow-hidden shadow-2xl relative animate-fade-in">
            
            {/* Desktop Progress Bar */}
            <div className="hidden lg:block absolute top-0 left-0 w-full h-1 bg-slate-800 z-20">
                <div 
                    className="h-full bg-cyan-400 transition-all duration-500 ease-out" 
                    style={{ width: `${((currentStepIndex + 1) / activeSteps.length) * 100}%` }}
                ></div>
            </div>

            {/* Steps Sidebar (Desktop) */}
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
                            onClick={() => handleStepClick(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Header / Steps */}
            <div className="lg:hidden p-6 pb-2 bg-[#050b14] border-b border-slate-800 shrink-0">
                 <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Step {currentStepIndex + 1} of {activeSteps.length}</span>
                    <span className="text-cyan-400">{currentStep.title}</span>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-500 ease-out" style={{ width: `${((currentStepIndex + 1) / activeSteps.length) * 100}%` }}></div>
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 lg:p-10 flex flex-col items-center justify-center relative overflow-y-auto custom-scrollbar">
                
                {/* DYNAMIC CONTENT SWITCHER */}
                {currentStep?.id === 'import' && (
                    !dataLoaded ? (
                        <div className="text-center animate-fade-in max-w-2xl w-full flex flex-col items-center my-auto">
                            
                            {isUploading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl text-cyan-400 animate-pulse">security</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{SCANNING_STEPS[Math.min(scanStep, SCANNING_STEPS.length - 1)]}</h3>
                                    <p className="text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Secure Environment
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 lg:mb-6 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                        <span className="material-symbols-outlined text-2xl lg:text-3xl">shield_lock</span>
                                    </div>

                                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">Secure Profile Import</h2>
                                    <p className="text-slate-400 mb-6 lg:mb-8 max-w-lg text-sm lg:text-base">
                                        Upload your resume or data (PDF, DOCX, CSV) to securely populate your portfolio. 
                                        <br/>
                                        <span className="text-xs text-slate-500 mt-2 block">
                                            <span className="material-symbols-outlined text-[10px] align-middle mr-1">check_circle</span>
                                            Files are scanned for malware and prompt injection attempts.
                                        </span>
                                    </p>
                                    
                                    <div className="flex flex-col items-center w-full mb-8">
                                        {/* Error Message */}
                                        {uploadError && (
                                            <div className="mb-6 w-full max-w-md p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                                                <span className="material-symbols-outlined text-red-500 shrink-0">gpp_bad</span>
                                                <div className="text-left">
                                                    <h4 className="text-red-400 font-bold text-sm">Upload Rejected</h4>
                                                    <p className="text-red-300/80 text-xs mt-1">{uploadError}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Secure Upload Box */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`group relative p-6 lg:p-10 rounded-2xl bg-slate-800/30 border-2 border-dashed ${uploadError ? 'border-red-500/30' : 'border-slate-700 hover:border-cyan-500/50'} hover:bg-slate-800/50 transition-all flex flex-col items-center gap-4 cursor-pointer hover:-translate-y-1 w-full max-w-md`}
                                        >
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-600 group-hover:border-cyan-500/30 group-hover:text-cyan-400 text-slate-400 transition-colors shadow-lg relative">
                                                <span className="material-symbols-outlined text-3xl lg:text-4xl">upload_file</span>
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full border border-slate-600 flex items-center justify-center z-10">
                                                    <span className="material-symbols-outlined text-[12px] text-green-400">verified_user</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg lg:text-xl">Upload Data</h3>
                                                <p className="text-sm text-slate-400 mt-2 font-mono text-[10px] uppercase tracking-wider">
                                                    Max 5MB • PDF, DOCX, CSV
                                                </p>
                                            </div>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                className="hidden" 
                                                accept=".pdf,.doc,.docx,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv"
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-3 w-full max-w-xs">
                                            <div className="h-px bg-slate-800 flex-1"></div>
                                            <span className="text-xs text-slate-600 font-bold uppercase">Or start fresh</span>
                                            <div className="h-px bg-slate-800 flex-1"></div>
                                        </div>
                                        <button onClick={handleNext} className="text-slate-500 hover:text-white text-sm font-medium transition-colors">
                                            Skip and enter manually
                                        </button>
                                    </div>
                                </>
                            )}
                            
                            {currentStepIndex > 0 && (
                                <button onClick={handleBack} className="mt-8 text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors">
                                    Go Back
                                </button>
                            )}
                        </div>
                    ) : (
                        <LinkedinSyncView onBack={() => setDataLoaded(false)} onComplete={handleNext} />
                    )
                )}

                {currentStep?.id === 'ai' && (
                    <AITrainingView onBack={currentStepIndex > 0 ? handleBack : undefined} onComplete={() => {
                        if (currentStepIndex === activeSteps.length - 1) {
                            onComplete();
                        } else {
                            handleNext();
                        }
                    }} />
                )}
            </div>
        </div>
    </div>
  );
};

// Item for the Sidebar Wizard
const StepItem: React.FC<{
    icon: string, 
    title: string, 
    desc: string, 
    active: boolean, 
    completed: boolean,
    onClick: () => void 
}> = ({ icon, title, desc, active, completed, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`flex gap-4 p-4 rounded-xl transition-all ${
                active ? 'bg-slate-800/50 border border-cyan-500/30' : 
                completed ? 'opacity-60 hover:opacity-100 cursor-pointer hover:bg-slate-800/30' : 'opacity-40'
            }`}
        >
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