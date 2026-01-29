import React, { useState, useRef } from 'react';
import { LinkedinSyncView } from './LinkedinSyncView';
import { AITrainingView } from './AITrainingView';
import { parseFileContent, extractFilesFromZip } from '../utils/fileParser';

interface OnboardingViewProps {
  onComplete: () => void;
  onExit: () => void;
}

export interface UploadedFile {
    name: string;
    data: string;
    size: number;
    type: string;
}

const STEPS_CONFIG = [
    {
        id: 'import',
        icon: 'folder_shared',
        title: 'Import Profile Data',
        desc: 'Upload Resumes, Portfolios, or Case Studies.',
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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Increased to 10MB to handle larger exports
const MAX_TOTAL_FILES = 25; // Increased limit to handle full LinkedIn export (approx 18 files)

// SECURITY STATUS MESSAGES
const SCANNING_STEPS = [
    "Verifying signatures...",
    "Initializing secure parser...",
    "Extracting layers...",
    "Structuring data..."
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onExit }) => {
  const [selectedItems] = useState<string[]>(['import', 'ai']);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Data State
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // File Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [processingFileIndex, setProcessingFileIndex] = useState(0);
  const [totalFilesToProcess, setTotalFilesToProcess] = useState(0);
  
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
          setUploadedFiles([]);
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
   */
  const validateFileSignature = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
            if (!e.target || !e.target.result) return resolve(false);
            const arr = (new Uint8Array(e.target.result as ArrayBuffer)).subarray(0, 4);
            let header = "";
            for (let i = 0; i < arr.length; i++) {
                // Pad with '0' to ensure we get '03' instead of '3' for byte values < 16
                header += arr[i].toString(16).padStart(2, '0');
            }
            
            // PDF: 25 50 44 46
            if (header.startsWith('25504446')) return resolve(true);
            // DOCX/ZIP: 50 4b 03 04
            if (header.startsWith('504b0304')) return resolve(true);
            // DOC: d0 cf 11 e0
            if (header.startsWith('d0cf11e0')) return resolve(true);

            // CSV Logic (text files usually don't have magic numbers, so we rely on extension + absence of binary headers)
            if (file.name.toLowerCase().endsWith('.csv')) {
                 if (header.startsWith('4d5a')) return resolve(false); // EXE (Windows)
                 if (header.startsWith('7f454c46')) return resolve(false); // ELF (Linux)
                 return resolve(true);
            }

            console.warn(`Security Audit: Invalid file signature for ${file.name}:`, header);
            resolve(false);
        };
        reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawFiles = e.target.files;
      setUploadError(null);

      if (!rawFiles || rawFiles.length === 0) return;

      setIsUploading(true);
      setScanStep(0);
      setProcessingFileIndex(0);

      const processedFiles: UploadedFile[] = [];
      let filesToProcess: File[] = [];

      try {
          // 1. EXPANSION PHASE: Handle ZIPs and create flat list
          setScanStep(0); // "Verifying signatures..."
          
          for (let i = 0; i < rawFiles.length; i++) {
              const file = rawFiles[i];
              const ext = file.name.split('.').pop()?.toLowerCase();
              
              if (ext === 'zip') {
                  // Validate ZIP Signature
                  const isZipSig = await validateFileSignature(file);
                  if (!isZipSig) throw new Error(`ZIP File ${file.name} signature invalid.`);
                  
                  // Extract contents
                  const extracted = await extractFilesFromZip(file);
                  filesToProcess.push(...extracted);
              } else {
                  filesToProcess.push(file);
              }
          }

          // 2. LIMIT CHECK
          if (filesToProcess.length === 0) {
              throw new Error("No valid files found (checked for PDF, DOCX, CSV).");
          }
          if (filesToProcess.length > MAX_TOTAL_FILES) {
              throw new Error(`Security Alert: Total extracted files (${filesToProcess.length}) exceeds limit of ${MAX_TOTAL_FILES}.`);
          }

          setTotalFilesToProcess(filesToProcess.length);

          // 3. PROCESSING PHASE
          for (let i = 0; i < filesToProcess.length; i++) {
              const file = filesToProcess[i];
              setProcessingFileIndex(i + 1);

              // Basic Security Checks per file
              if (file.size === 0) throw new Error(`File ${file.name} is empty.`);
              if (file.size > MAX_FILE_SIZE) throw new Error(`File ${file.name} exceeds 10MB limit.`);
              
              const safeNameRegex = /^[a-zA-Z0-9._\-\s()]+$/;
              // We relax this regex slightly for extracted files which might have weird names, 
              // but purely for parsing, we just ensure no path traversal chars like '/' or '\'
              if (file.name.includes('/') || file.name.includes('\\')) throw new Error(`File ${file.name} has unsafe characters.`);

              // Validate Signature
              const isValidSignature = await validateFileSignature(file);
              if (!isValidSignature) throw new Error(`File ${file.name} failed security signature check.`);

              // Simulate Visual Scan
              for (let step = 1; step < SCANNING_STEPS.length; step++) {
                  setScanStep(step);
                  await new Promise(r => setTimeout(r, 150)); 
              }

              // Real Parsing
              const text = await parseFileContent(file);
              
              processedFiles.push({
                  name: file.name,
                  data: text,
                  size: file.size,
                  type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
              });
          }

          setUploadedFiles(processedFiles);
          setDataLoaded(true);

      } catch (err: any) {
          console.error(err);
          setUploadError(err.message || "Failed to parse files.");
          setUploadedFiles([]);
      } finally {
          setIsUploading(false);
          setProcessingFileIndex(0);
      }
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
                                            <span className="material-symbols-outlined text-3xl text-cyan-400 animate-pulse">folder_zip</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{SCANNING_STEPS[scanStep]}</h3>
                                    <p className="text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        {processingFileIndex > 0 ? `Processing File ${processingFileIndex} of ${totalFilesToProcess}` : 'Expanding Archives...'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 lg:mb-6 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                        <span className="material-symbols-outlined text-2xl lg:text-3xl">shield_lock</span>
                                    </div>

                                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">Secure Batch Import</h2>
                                    <p className="text-slate-400 mb-6 lg:mb-8 max-w-lg text-sm lg:text-base">
                                        Upload resumes, portfolios, or data sheets. Supports <strong>ZIP archives</strong> for bulk upload.
                                        <br/>
                                        <span className="text-xs text-slate-500 mt-2 block">
                                            <span className="material-symbols-outlined text-[10px] align-middle mr-1">check_circle</span>
                                            Secure client-side extraction. Up to {MAX_TOTAL_FILES} total files.
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
                                                {/* Multiple Badge */}
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full border border-slate-600 flex items-center justify-center z-10">
                                                    <span className="material-symbols-outlined text-[12px] text-green-400">library_add</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg lg:text-xl">Upload Files or ZIPs</h3>
                                                <p className="text-sm text-slate-400 mt-2 font-mono text-[10px] uppercase tracking-wider">
                                                    PDF, DOCX, CSV, ZIP • Max 10MB
                                                </p>
                                            </div>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                className="hidden" 
                                                multiple
                                                accept=".pdf,.doc,.docx,.csv,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,application/zip,application/x-zip-compressed"
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
                        <LinkedinSyncView 
                            onBack={() => {
                                setDataLoaded(false);
                                setUploadedFiles([]);
                            }} 
                            onComplete={handleNext}
                            uploadedFiles={uploadedFiles}
                        />
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