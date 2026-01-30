import React, { useState, useEffect } from 'react';
import { RecruiterSidebar } from './RecruiterSidebar';

interface RecruiterFlowProps {
    isAuthenticated?: boolean;
    onExit: () => void;
}

const PREPARING_MESSAGES = [
  "Initializing Session...",
  "Loading Job Context...",
  "Calibrating Feedback Engine...",
  "Connecting to Candidate Profile...",
  "Ready."
];

export const RecruiterFlow: React.FC<RecruiterFlowProps> = ({ isAuthenticated = false, onExit }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [prepProgress, setPrepProgress] = useState(0);
  const [currentPrepMsg, setCurrentPrepMsg] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (step === 3 && !analysisComplete) {
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
      }, 3000); // Faster for better UX
      return () => clearTimeout(timer);
    }
  }, [step, analysisComplete]);

  useEffect(() => {
    if (isPreparing) {
      const duration = 4000;
      const interval = 50;
      const progressStep = 100 / (duration / interval);
      
      const timer = setInterval(() => {
        setPrepProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                setIsPreparing(false);
                setInterviewStarted(true);
            }, 500);
            return 100;
          }
          return prev + progressStep;
        });
      }, interval);

      const msgInterval = setInterval(() => {
        setCurrentPrepMsg(prev => (prev + 1) % PREPARING_MESSAGES.length);
      }, 800);

      return () => {
        clearInterval(timer);
        clearInterval(msgInterval);
      };
    }
  }, [isPreparing]);

  const handleStartInterview = () => {
    setIsPreparing(true);
  };

  const handleCancelPreparation = () => {
    setIsPreparing(false);
    setPrepProgress(0);
  };

  return (
    // UX: Use h-screen but respect safe areas. Hidden overflow on body to prevent double scrolls.
    <div className="flex w-full h-[100dvh] bg-surface-variant dark:bg-surface-darkVariant font-sans relative overflow-hidden">
      {isAuthenticated && !isPreparing && !interviewStarted && (
        <RecruiterSidebar 
          isAuthenticated={true} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <main className="flex-1 relative flex flex-col transition-all duration-500 overflow-hidden">
        
        {/* Mobile Top Bar */}
        {!isPreparing && isAuthenticated && !interviewStarted && (
          <div className="lg:hidden flex items-center justify-between p-4 bg-[var(--md-sys-color-background)] border-b border-outline-variant z-40 shrink-0">
            <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 text-[var(--md-sys-color-on-background)] focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                aria-label="Open Menu"
                aria-expanded={isSidebarOpen}
                aria-controls="recruiter-sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-primary uppercase tracking-wider mb-1" aria-hidden="true">
                    Step {step} of 3
                </span>
                <div className="flex gap-1" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step} of 3`}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 w-6 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                    ))}
                </div>
            </div>
            <button 
                onClick={() => setShowExitModal(true)} 
                className="p-2 text-outline hover:text-error transition-colors focus-visible:ring-2 focus-visible:ring-error rounded-full"
                aria-label="Close Session"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Exit Button (Desktop) */}
        {!isPreparing && (!isAuthenticated || interviewStarted) && (
            <button 
                onClick={() => setShowExitModal(true)}
                className="absolute top-6 right-6 z-50 p-2 rounded-full bg-surface-container hover:bg-surface-variant text-outline hover:text-[var(--md-sys-color-on-background)] shadow-elevation-1 transition-all hidden lg:block focus-visible:ring-2 focus-visible:ring-primary"
                title="Return Home"
                aria-label="Return Home"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        )}

        {/* PREPARING SCREEN */}
        {isPreparing && (
            <div className="absolute inset-0 z-[60] bg-[var(--md-sys-color-background)] flex flex-col items-center justify-center p-6 text-center" aria-live="assertive">
                <div className="relative w-20 h-20 mb-8">
                    <svg className="animate-spin h-full w-full text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>

                <div className="w-full max-w-sm">
                    <h2 className="text-2xl font-display font-normal text-[var(--md-sys-color-on-background)] mb-2">Preparing Session</h2>
                    <p className="text-primary font-medium text-sm mb-8 h-6 overflow-hidden">
                        {PREPARING_MESSAGES[currentPrepMsg]}
                    </p>
                    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden mb-4" role="progressbar" aria-valuenow={prepProgress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${prepProgress}%` }}></div>
                    </div>
                    <button onClick={handleCancelPreparation} className="mt-6 px-6 py-2 rounded-full border border-outline text-outline hover:bg-surface-variant transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary">
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {/* Top Header - Desktop only */}
        {!analysisComplete && !interviewStarted && !isPreparing && step !== 3 && (
            <header className="hidden lg:flex h-20 border-b border-outline-variant items-center justify-between px-10 bg-[var(--md-sys-color-background)] z-30 shrink-0">
                <div className="flex items-center gap-6">
                    <StepIndicator step={1} current={step} label="Language" />
                    <div className="w-8 h-px bg-outline-variant" aria-hidden="true"></div>
                    <StepIndicator step={2} current={step} label="Context" />
                    <div className="w-8 h-px bg-outline-variant" aria-hidden="true"></div>
                    <StepIndicator step={3} current={step} label="Analysis" />
                </div>
            </header>
        )}

        {/* SETUP CONTENT */}
        {!isPreparing && !interviewStarted && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex flex-col items-center custom-scrollbar">
                <div className="w-full max-w-4xl pb-10">
                    
                    {step === 1 && (
                        <div className="flex flex-col items-center animate-fade-in py-4 md:py-6">
                            <h1 className="text-2xl md:text-3xl font-display font-normal text-[var(--md-sys-color-on-background)] mb-2 text-center">Select Language</h1>
                            <p className="text-outline text-center max-w-md mb-8 md:mb-10 text-sm md:text-base">
                                Choose the primary language for the AI agent during the assessment.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10 w-full max-w-2xl">
                                <LanguageCard 
                                    flag="https://flagcdn.com/w320/us.png" 
                                    title="English" 
                                    subtitle="Universal / Professional" 
                                    selected={selectedLanguage === 'en'}
                                    onClick={() => setSelectedLanguage('en')}
                                />
                                <LanguageCard 
                                    flag="https://flagcdn.com/w320/es.png" 
                                    title="Español" 
                                    subtitle="LATAM / España" 
                                    selected={selectedLanguage === 'es'}
                                    onClick={() => setSelectedLanguage('es')}
                                />
                            </div>

                            <button onClick={() => setStep(2)} className="h-12 px-8 rounded-full bg-primary text-white hover:bg-primary-hover shadow-elevation-1 hover:shadow-elevation-2 transition-all font-medium text-base state-layer w-full md:w-auto focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center animate-fade-in py-4 md:py-6">
                            <h1 className="text-2xl md:text-3xl font-display font-normal text-[var(--md-sys-color-on-background)] mb-2 text-center">Job Context</h1>
                            <p className="text-outline text-center mb-8 md:mb-10 text-sm md:text-base">Provide details about the open position to calibrate AI focus.</p>

                            <div className="w-full max-w-2xl bg-[var(--md-sys-color-background)] p-6 md:p-8 rounded-[24px] shadow-sm border border-outline-variant/30 mb-8">
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <label htmlFor="job-url" className="block text-xs font-medium text-primary mb-1 ml-1">Job Description URL</label>
                                        <div className="flex items-center bg-surface-variant rounded-[4px] border-b border-outline hover:border-primary focus-within:border-primary transition-colors h-14 px-4 focus-within:ring-2 focus-within:ring-primary focus-within:ring-inset">
                                            <span className="material-symbols-outlined text-outline mr-3" aria-hidden="true">link</span>
                                            <input 
                                                id="job-url"
                                                type="text" 
                                                placeholder="https://company.com/careers/role" 
                                                className="bg-transparent border-none outline-none w-full text-[var(--md-sys-color-on-background)] placeholder-outline/50 text-base md:text-sm focus:ring-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative flex items-center gap-4 py-2" aria-hidden="true">
                                        <div className="flex-1 h-px bg-outline-variant"></div>
                                        <span className="text-xs font-medium text-outline uppercase">Or upload file</span>
                                        <div className="flex-1 h-px bg-outline-variant"></div>
                                    </div>

                                    <div 
                                        role="button"
                                        tabIndex={0}
                                        className="border-2 border-dashed border-outline-variant hover:border-primary rounded-[16px] py-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-variant/30 hover:bg-surface-variant/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                        aria-label="Upload Job Description File (PDF or DOCX)"
                                    >
                                        <span className="material-symbols-outlined text-3xl text-outline mb-2" aria-hidden="true">cloud_upload</span>
                                        <p className="text-sm font-medium text-[var(--md-sys-color-on-background)]">Click to upload Job Description</p>
                                        <p className="text-xs text-outline mt-1">PDF, DOCX (Max 10MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* UX Improvement: flex-wrap allows buttons to stack on very small screens (320px) */}
                            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-center">
                                <button onClick={() => setStep(1)} className="h-12 px-6 rounded-full border border-outline text-primary hover:bg-surface-variant font-medium transition-colors w-full md:w-auto focus-visible:ring-2 focus-visible:ring-primary">
                                    Back
                                </button>
                                <button onClick={() => setStep(3)} className="h-12 px-8 rounded-full bg-primary text-white hover:bg-primary-hover shadow-elevation-1 transition-all font-medium flex items-center justify-center gap-2 w-full md:w-auto focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">analytics</span>
                                    Analyze
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && !analysisComplete && (
                        <div className="flex flex-col items-center animate-fade-in py-10" aria-live="polite">
                            <h1 className="text-2xl md:text-3xl font-display font-normal text-[var(--md-sys-color-on-background)] mb-8 text-center">Analyzing Requirements...</h1>
                            <div className="w-16 h-16 border-4 border-primary-container border-t-primary rounded-full animate-spin mb-8"></div>
                            
                            <div className="flex gap-12 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-[var(--md-sys-color-on-background)]">94%</div>
                                    <div className="text-xs text-outline font-medium uppercase">Confidence</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">Processing</div>
                                    <div className="text-xs text-outline font-medium uppercase">Status</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && analysisComplete && (
                        <div className="flex flex-col items-center animate-fade-in py-6">
                            <div className="mb-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl">check</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-display font-normal text-[var(--md-sys-color-on-background)]">Ready to Start</h2>
                                <p className="text-outline mt-2 text-sm md:text-base">The AI has been calibrated with the job requirements.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
                                <AnalysisCard title="Persona" value="Lead / Senior" icon="account_box" />
                                <AnalysisCard title="Primary Focus" value="System Design" icon="hub" />
                                <AnalysisCard title="Secondary Focus" value="Leadership" icon="groups" />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <button onClick={() => setAnalysisComplete(false)} className="h-12 px-6 rounded-full border border-outline text-primary hover:bg-surface-variant font-medium transition-colors order-2 md:order-1 focus-visible:ring-2 focus-visible:ring-primary">
                                    Re-analyze
                                </button>
                                <button 
                                    onClick={handleStartInterview}
                                    className="h-12 px-8 rounded-full bg-primary text-white hover:bg-primary-hover shadow-elevation-1 transition-all font-medium flex items-center justify-center gap-2 order-1 md:order-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                                >
                                    Start Session
                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">play_arrow</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* MODAL SALIDA */}
        {showExitModal && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="exit-modal-title"
            >
                <div className="bg-[var(--md-sys-color-background)] p-6 rounded-[28px] max-w-sm w-full shadow-elevation-3">
                    <h3 id="exit-modal-title" className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)] mb-2">End Session?</h3>
                    <p className="text-outline text-sm mb-6 leading-relaxed">
                        Any unsaved progress will be lost. Are you sure you want to exit?
                    </p>
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setShowExitModal(false)} className="px-4 py-2 rounded-full text-primary font-medium hover:bg-surface-variant transition-colors focus-visible:ring-2 focus-visible:ring-primary">
                            Cancel
                        </button>
                        <button onClick={onExit} className="px-4 py-2 rounded-full bg-error text-white font-medium hover:bg-error/90 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2">
                            Exit
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

// HELPERS
const LanguageCard: React.FC<{flag: string, title: string, subtitle: string, selected: boolean; onClick: () => void}> = ({flag, title, subtitle, selected, onClick}) => (
    <button 
        onClick={onClick} 
        aria-pressed={selected}
        className={`relative w-full flex items-center gap-4 p-4 rounded-[16px] cursor-pointer transition-all border text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${selected ? 'bg-secondary-container border-primary shadow-sm' : 'bg-surface border-outline-variant hover:border-outline'}`}
    >
        <img src={flag} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm" />
        <div className="flex-1">
            <h3 className={`text-lg font-medium ${selected ? 'text-secondary-onContainer' : 'text-[var(--md-sys-color-on-background)]'}`}>{title}</h3>
            <p className={`text-xs ${selected ? 'text-secondary-onContainer/80' : 'text-outline'}`}>{subtitle}</p>
        </div>
        {selected && (
            <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">check_circle</span>
        )}
    </button>
)

const StepIndicator: React.FC<{step: number, current: number, label: string}> = ({step, current, label}) => {
    const active = current >= step;
    const isCurrent = current === step;
    return (
        <div className="flex items-center gap-3">
            <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-primary text-white' : 'bg-surface-variant text-outline border border-outline-variant'}`}
                aria-hidden="true"
            >
                {step}
            </div>
            <span className={`text-sm font-medium ${isCurrent ? 'text-[var(--md-sys-color-on-background)]' : 'text-outline'}`}>{label}</span>
        </div>
    )
}

const AnalysisCard: React.FC<{title: string, value: string, icon: string}> = ({title, value, icon}) => (
    <div className="bg-surface-variant p-4 rounded-[16px] flex flex-col gap-2 border border-outline-variant/30">
        <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        <p className="text-lg font-medium text-[var(--md-sys-color-on-background)] pl-1">{value}</p>
    </div>
);