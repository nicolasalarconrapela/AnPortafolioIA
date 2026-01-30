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

const KNOWN_LINKEDIN_NOISE_FILES = [
    'Ad_Targeting.csv', 'Company Follows.csv', 'Connections.csv', 'Email Addresses.csv',
    'guide_messages.csv', 'Learning.csv', 'learning_coach_messages.csv',
    'learning_role_play_messages.csv', 'messages.csv', 'PhoneNumbers.csv',
    'Registration.csv', 'Rich_Media.csv', 'SavedJobAlerts.csv'
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // Increased to 15MB

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
      setProcessingStatus("Initializing scan...");

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
                  } catch (e) {
                      console.warn(`Skipping invalid zip: ${file.name}`);
                      errors.push(`${file.name}: Invalid ZIP archive`);
                  }
              } else {
                  filesToProcess.push(file);
              }
          }

          // Phase 2: Filtering
          const filteredFiles = filesToProcess.filter(f => !KNOWN_LINKEDIN_NOISE_FILES.includes(f.name));
          
          if (filteredFiles.length === 0 && errors.length === 0) throw new Error("No valid files found (PDF, DOCX, CSV, IMG supported).");

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
                   setProcessingStatus(`Parsing ${file.name}...`);
              }
              
              if (file.size > MAX_FILE_SIZE) {
                  console.warn(`Skipping ${file.name}: File too large`);
                  errors.push(`${file.name}: File too large (>15MB)`);
                  continue;
              }

              try {
                  const text = await parseFileContent(file);
                  // Relaxed check: Accept any non-empty text
                  if (text && text.trim().length > 0) { 
                       processed.push({ 
                          name: file.name, 
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
              throw new Error(`Could not extract text. ${errorDetails}`);
          }

          setUploadedFiles(processed);
          setDataLoaded(true);
      } catch (err: any) {
          console.error("Upload Error:", err);
          setUploadError(err.message || "An error occurred during upload.");
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
    <div className="relative z-20 flex w-full h-screen bg-[#020408] overflow-hidden">
        {/* BG Glows */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-[100px]"></div>
        </div>

        <div className="glass-panel w-full max-w-6xl h-full lg:h-[750px] lg:my-auto lg:mx-auto lg:rounded-3xl border-0 lg:border border-slate-700/50 flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
            
            {/* Sidebar Desktop */}
            <div className="w-64 border-r border-slate-700/50 p-8 hidden lg:block bg-slate-900/30 shrink-0">
                <div className="space-y-6 mt-10">
                    {activeSteps.map((step, index) => (
                        <div key={step.id} className={`flex gap-4 p-3 rounded-xl ${index === currentStepIndex ? 'bg-slate-800 border border-cyan-500/30' : 'opacity-40'}`}>
                            <span className="material-symbols-outlined text-cyan-400">{step.icon}</span>
                            <span className="text-sm font-bold text-white">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden p-4 bg-[#050b14] border-b border-slate-800 shrink-0 z-30">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Step {currentStepIndex + 1} / {activeSteps.length}</span>
                    <span className="text-cyan-400">{currentStep.title}</span>
                </div>
            </div>

            {/* Main Area with Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start lg:justify-center p-6 lg:p-12">
                <div className="w-full max-w-2xl py-8 lg:py-0">
                    {currentStep?.id === 'import' && (
                        !dataLoaded ? (
                            <div className="text-center animate-fade-in flex flex-col items-center">
                                {isUploading ? (
                                    <div className="py-12 flex flex-col items-center w-full max-w-md">
                                        <div className="w-20 h-20 relative mb-6">
                                            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-cyan-400">{progressPercent}%</div>
                                        </div>
                                        <p className="text-white font-bold text-lg mb-2">Analyzing Structure</p>
                                        <p className="text-slate-400 text-sm animate-pulse">{processingStatus}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 mx-auto">
                                            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Upload Profile Data</h2>
                                        <p className="text-slate-400 mb-8 text-sm lg:text-base max-w-md mx-auto">
                                            We support Resumes, CVs, LinkedIn Archives, and Image Portfolios (Layout Analysis enabled).
                                        </p>
                                        
                                        {/* UX Enhanced Upload Box */}
                                        <div 
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full p-8 lg:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center gap-4 group relative overflow-hidden ${
                                                isDragging 
                                                ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]' 
                                                : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.docx,.csv,.zip,.txt,.png,.jpg,.jpeg" onChange={handleFileInputChange} />
                                            
                                            <div className={`w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110 bg-cyan-500/20' : 'group-hover:scale-110'}`}>
                                                <span className={`material-symbols-outlined text-3xl ${isDragging ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`}>upload_file</span>
                                            </div>
                                            
                                            <div className="text-center relative z-10">
                                                <h3 className={`text-lg font-bold mb-1 ${isDragging ? 'text-cyan-400' : 'text-white'}`}>
                                                    {isDragging ? 'Drop files here' : 'Click or Drag files here'}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium">Max 15MB per file</p>
                                            </div>

                                            {/* Supported Formats Grid */}
                                            <div className="grid grid-cols-5 gap-3 mt-4 w-full max-w-xs opacity-60 group-hover:opacity-100 transition-opacity">
                                                <FormatBadge ext="PDF" color="red" />
                                                <FormatBadge ext="DOCX" color="blue" />
                                                <FormatBadge ext="CSV" color="green" />
                                                <FormatBadge ext="ZIP" color="yellow" />
                                                <FormatBadge ext="IMG" color="purple" />
                                            </div>
                                        </div>

                                        {uploadError && (
                                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 w-full max-w-lg animate-fade-in">
                                                <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                                                <div className="flex-1">
                                                    <p className="font-bold mb-1">Upload Failed</p>
                                                    <p className="text-xs opacity-80 break-words">{uploadError}</p>
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={handleNext} className="mt-8 text-slate-500 hover:text-white text-xs font-bold transition-colors uppercase tracking-widest">
                                            Skip Import Step
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <LinkedinSyncView onBack={() => { setDataLoaded(false); setUploadedFiles([]); }} onComplete={handleNext} uploadedFiles={uploadedFiles} />
                        )
                    )}

                    {currentStep?.id === 'ai' && (
                        <AITrainingView onBack={handleBack} onComplete={onComplete} />
                    )}
                </div>
                {/* Spacer for mobile to prevent button hiding */}
                <div className="h-20 lg:hidden"></div>
            </div>
        </div>
    </div>
  );
};

const FormatBadge: React.FC<{ext: string, color: string}> = ({ext, color}) => {
    const colorClasses: {[key: string]: string} = {
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return (
        <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
            <span className="text-[10px] font-bold">{ext}</span>
        </div>
    );
}
