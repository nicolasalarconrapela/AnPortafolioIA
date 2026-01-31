import React, { useState, useRef, useEffect } from 'react';
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
        title: 'Import Data',
        desc: 'Upload CV, Portfolio, etc.',
        color: 'primary'
    },
    {
        id: 'ai',
        icon: 'smart_toy',
        title: 'Configure AI',
        desc: 'Personalize your assistant.',
        color: 'secondary'
    }
];

const KNOWN_LINKEDIN_NOISE_FILES = [
    'Ad_Targeting.csv', 'Company Follows.csv', 'Connections.csv', 'Email Addresses.csv',
    'guide_messages.csv', 'Learning.csv', 'learning_coach_messages.csv',
    'learning_role_play_messages.csv', 'messages.csv', 'PhoneNumbers.csv',
    'Registration.csv', 'Rich_Media.csv', 'SavedJobAlerts.csv'
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Simple filename sanitizer for UI display safety
const sanitizeFileNameUI = (name: string) => name.replace(/[^\w\s.\-\(\)]/gi, '_');

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onExit }) => {
  const [selectedItems] = useState<string[]>(['import', 'ai']);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState("Ready");
  const [progressPercent, setProgressPercent] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSteps = STEPS_CONFIG.filter(step => selectedItems.includes(step.id));
  const currentStep = activeSteps[currentStepIndex];

  // Ref for the steps container to manage scrolling
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active step on mobile
  useEffect(() => {
      if (stepsContainerRef.current) {
          const activeElement = stepsContainerRef.current.children[currentStepIndex] as HTMLElement;
          if (activeElement) {
              activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
      }
  }, [currentStepIndex]);

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
          setUploadedFiles([]);
          return;
      }
      if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const processFiles = async (files: FileList | File[]) => {
      if (!files || files.length === 0) return;
      
      setIsUploading(true);
      setUploadError(null);
      setProgressPercent(0);
      setProcessingStatus("Initializing secure scan...");

      try {
          let filesToProcess: File[] = [];
          const rawFiles = Array.from(files);
          const errors: string[] = [];

          // Phase 1: Expansion & Validation
          for (let i = 0; i < rawFiles.length; i++) {
              const file = rawFiles[i];
              setProcessingStatus(`Analyzing ${file.name}...`);
              
              const ext = file.name.split('.').pop()?.toLowerCase();
              
              if (ext === 'zip') {
                  try {
                      setProcessingStatus(`Unpacking ${file.name}...`);
                      const extracted = await extractFilesFromZip(file);
                      filesToProcess.push(...extracted);
                  } catch (e: any) {
                      console.warn(`Skipping invalid zip: ${file.name}`);
                      errors.push(`${file.name}: ${e.message}`);
                  }
              } else {
                  filesToProcess.push(file);
              }
          }

          // Phase 2: Filtering
          const filteredFiles = filesToProcess.filter(f => !KNOWN_LINKEDIN_NOISE_FILES.includes(f.name));
          
          if (filteredFiles.length === 0 && errors.length === 0) throw new Error("No valid files found (PDF, DOCX, CSV, IMG supported).");
          if (filteredFiles.length === 0 && errors.length > 0) throw new Error(errors[0]);

          // Phase 3: Content Parsing
          const processed: UploadedFile[] = [];
          for (let i = 0; i < filteredFiles.length; i++) {
              const file = filteredFiles[i];
              const progress = Math.round(((i + 1) / filteredFiles.length) * 100);
              setProgressPercent(progress);
              
              const isImage = ['jpg','jpeg','png'].includes(file.name.split('.').pop()?.toLowerCase() || '');
              
              if (isImage) {
                   setProcessingStatus(`Layout Analysis (PP-Structure Sim): ${file.name}...`);
              } else {
                   setProcessingStatus(`Secure Parsing ${file.name}...`);
              }
              
              if (file.size > MAX_FILE_SIZE) {
                  console.warn(`Skipping ${file.name}: File too large`);
                  errors.push(`${file.name}: File too large (>15MB)`);
                  continue;
              }

              try {
                  const text = await parseFileContent(file);
                  if (text && text.trim().length > 0) { 
                       processed.push({ 
                          name: sanitizeFileNameUI(file.name),
                          data: text, 
                          size: file.size, 
                          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN' 
                      });
                  } else {
                      errors.push(`${file.name}: No readable text found`);
                  }
              } catch (parseErr: any) {
                  console.error(`Failed to parse ${file.name}`, parseErr);
                  errors.push(`${file.name}: ${parseErr.message}`);
              }
          }
          
          if (processed.length === 0) {
              const errorDetails = errors.length > 0 ? errors.slice(0, 3).join('. ') + (errors.length > 3 ? '...' : '') : "Unknown error";
              throw new Error(`Security/Parsing Error: ${errorDetails}`);
          }

          setUploadedFiles(processed);
          setDataLoaded(true);
      } catch (err: any) {
          console.error("Upload Error:", err);
          setUploadError(err.message || "An error occurred during secure upload.");
      } finally {
          setIsUploading(false);
          setIsDragging(false);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          processFiles(e.target.files);
      }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface-variant dark:bg-surface-darkVariant flex flex-col md:flex-row">
        
        {/* Sidebar Desktop / Topbar Mobile */}
        <div className="w-full md:w-80 bg-[var(--md-sys-color-background)] border-b md:border-b-0 md:border-r border-outline-variant p-4 md:p-6 flex flex-col shrink-0 md:h-screen z-10 shadow-sm md:shadow-none">
            <div className="flex items-center justify-between md:justify-start gap-2 mb-2 md:mb-8">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl md:text-2xl">diversity_3</span>
                    <span className="font-display font-medium text-base md:text-lg">Setup Guide</span>
                </div>
                {/* Mobile exit button shows here for easy access */}
                <button onClick={onExit} className="md:hidden p-2 text-outline hover:text-primary active:bg-surface-variant rounded-full transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            {/* Steps Container - Improved Mobile Scrolling */}
            <div className="relative md:flex-1">
                {/* Scroll Mask for Mobile */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--md-sys-color-background)] to-transparent pointer-events-none md:hidden z-10" />
                
                <div 
                    ref={stepsContainerRef}
                    className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide snap-x snap-mandatory pr-8 md:pr-0"
                >
                    {activeSteps.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex;
                        
                        return (
                            <div key={step.id} className={`snap-center flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-full md:rounded-2xl transition-colors whitespace-nowrap md:whitespace-normal shrink-0 border border-transparent ${isActive ? 'bg-secondary-container text-secondary-onContainer border-secondary-container/50' : 'text-outline hover:bg-surface-variant'}`}>
                                <div className={`w-8 h-8 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-secondary-onContainer text-secondary-container' : (isCompleted ? 'bg-green-100 text-green-700' : 'bg-surface-variant text-outline')}`}>
                                    {isCompleted ? <span className="material-symbols-outlined text-sm font-bold">check</span> : <span className="material-symbols-outlined text-sm">{step.icon}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-secondary-onContainer' : 'text-[var(--md-sys-color-on-background)]'}`}>{step.title}</span>
                                    <span className="hidden md:inline text-xs opacity-80">{step.desc}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto pt-6 hidden md:block">
                <button onClick={onExit} className="flex items-center gap-2 text-sm text-outline hover:text-primary transition-colors hover:translate-x-1 duration-200">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Cancel Setup
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto h-[calc(100dvh-80px)] md:h-screen">
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                
                {currentStep?.id === 'import' && (
                    !dataLoaded ? (
                        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in bg-[var(--md-sys-color-background)] rounded-[24px] md:rounded-[28px] p-6 md:p-8 shadow-sm border border-outline-variant/30">
                            {isUploading ? (
                                <div className="text-center w-full max-w-sm">
                                    <div className="w-16 h-16 rounded-full bg-secondary-container border-4 border-[var(--md-sys-color-background)] mx-auto mb-6 flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                        <span className="text-xs font-bold text-primary">{progressPercent}%</span>
                                    </div>
                                    <h3 className="text-xl font-display font-medium mb-2">Analyzing Content</h3>
                                    <p className="text-outline text-sm animate-pulse">{processingStatus}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-container text-primary-onContainer flex items-center justify-center mb-4 md:mb-6">
                                        <span className="material-symbols-outlined text-2xl md:text-3xl">cloud_upload</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-display font-normal text-[var(--md-sys-color-on-background)] mb-2 md:mb-3 text-center">Import Profile Data</h2>
                                    <p className="text-outline text-center text-sm md:text-base max-w-md mb-6 md:mb-8">
                                        Upload your Resume (PDF), Portfolio (PDF/Images), or LinkedIn Archive (ZIP).
                                    </p>
                                    
                                    {/* Upload Box */}
                                    <div 
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full max-w-xl p-6 md:p-10 rounded-[20px] md:rounded-[24px] border border-dashed transition-all cursor-pointer flex flex-col items-center gap-4 group relative ${
                                            isDragging 
                                            ? 'border-primary bg-primary-container/30' 
                                            : 'border-outline-variant hover:border-primary hover:bg-surface-variant'
                                        }`}
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.docx,.csv,.zip,.txt,.png,.jpg,.jpeg" onChange={handleFileInputChange} />
                                        
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-variant flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            <span className="material-symbols-outlined text-xl md:text-2xl text-primary">upload_file</span>
                                        </div>
                                        
                                        <div className="text-center">
                                            <h3 className="text-sm md:text-base font-medium text-[var(--md-sys-color-on-background)] mb-1">
                                                {isDragging ? 'Drop files here' : 'Click or Drag files here'}
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-outline">Max 15MB per file • PDF, DOCX, IMG, ZIP</p>
                                        </div>
                                    </div>

                                    {uploadError && (
                                        <div className="mt-6 p-4 bg-error-container text-error-onContainer rounded-xl text-sm flex items-start gap-3 w-full max-w-xl">
                                            <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                                            <div>
                                                <p className="font-bold">Upload Failed</p>
                                                <p>{uploadError}</p>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleNext} className="mt-6 md:mt-8 text-primary font-medium text-sm hover:underline p-2">
                                        Skip this step
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[var(--md-sys-color-background)] rounded-[28px] shadow-sm border border-outline-variant/30 h-full overflow-hidden flex flex-col">
                            <LinkedinSyncView onBack={() => { setDataLoaded(false); setUploadedFiles([]); }} onComplete={handleNext} uploadedFiles={uploadedFiles} />
                        </div>
                    )
                )}

                {currentStep?.id === 'ai' && (
                    <div className="bg-[var(--md-sys-color-background)] rounded-[28px] p-4 md:p-8 shadow-sm border border-outline-variant/30 h-full overflow-auto">
                        <AITrainingView onBack={handleBack} onComplete={onComplete} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};