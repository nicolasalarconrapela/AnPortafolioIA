import React, { useState, useRef, useEffect } from 'react';
import { Upload, Briefcase, Award, Code, Heart, Globe, BookOpen, Star, User, ChevronRight, ChevronLeft, Save, Sparkles, Terminal, MessageSquare, X, CheckCircle2, FileJson, Download, FileArchive, Eye, ShieldAlert, Wrench, ArrowRight, GraduationCap, Layout, Search, FileText, Eraser } from 'lucide-react';
import { Button } from './components/Button';
import { createGeminiService, GeminiService } from './services/geminiService';
import { createGretchenService, GretchenService } from './services/gretchenService';
import { AppState, CVProfile, ChatMessage } from './types';
import { MarkdownView } from './components/MarkdownView';
import { CompanyLogo } from './components/CompanyLogo';
import JSZip from 'jszip';

// --- Components for the Wizard Sections ---

const SectionHeader = ({ 
    title, 
    description, 
    icon, 
    aiName,
    onGretchenClick
}: { 
    title: string, 
    description: string, 
    icon: React.ReactNode, 
    aiName: string,
    onGretchenClick: () => void
}) => (
  <div className="mb-6 border-b border-slate-200 pb-4">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center space-x-3 mb-2 md:mb-0">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                {icon}
            </div>
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h2>
                <div className="flex items-center space-x-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">AI AGENT: {aiName}</span>
                </div>
            </div>
        </div>
        <button 
            onClick={onGretchenClick}
            className="w-full md:w-auto group flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all shadow-md border border-slate-600"
        >
            <ShieldAlert className="w-4 h-4 text-red-400 group-hover:text-red-300 animate-pulse" />
            <span className="text-sm font-medium">Auditoría Automática</span>
        </button>
    </div>
    <p className="text-slate-500 mt-2 text-sm md:text-base">{description}</p>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 italic text-sm">
        {text}
    </div>
);

// --- Gretchen Audit & Fix Modal ---

const GretchenModal = ({
    isOpen,
    onClose,
    sectionName,
    sectionData,
    onApplyFix
}: {
    isOpen: boolean;
    onClose: () => void;
    sectionName: string;
    sectionData: any;
    onApplyFix: (newData: any) => void;
}) => {
    const [auditResult, setAuditResult] = useState("");
    const [fixedData, setFixedData] = useState<any>(null);
    const [step, setStep] = useState<'IDLE' | 'AUDITING' | 'FIXING' | 'REVIEW'>('IDLE');
    
    const gretchenServiceRef = useRef<GretchenService | null>(null);
    const geminiServiceRef = useRef<GeminiService | null>(null);

    useEffect(() => {
        gretchenServiceRef.current = createGretchenService();
        geminiServiceRef.current = createGeminiService();
    }, []);

    useEffect(() => {
        if (isOpen && sectionData) {
            runAutoFlow();
        } else {
            reset();
        }
    }, [isOpen]);

    const reset = () => {
        setAuditResult("");
        setFixedData(null);
        setStep('IDLE');
    }

    const runAutoFlow = async () => {
        if (!gretchenServiceRef.current || !geminiServiceRef.current) return;
        
        // 1. Audit
        setStep('AUDITING');
        let critique = "";
        try {
            critique = await gretchenServiceRef.current.auditSection(sectionName, sectionData);
            setAuditResult(critique);
        } catch (e) {
            setAuditResult("Error en auditoría. Gretchen se ha ido a comer.");
            return;
        }

        // 2. Googlito Fixing
        setStep('FIXING');
        try {
            const improvements = await geminiServiceRef.current.improveSectionBasedOnCritique(sectionName, sectionData, critique);
            setFixedData(improvements);
            setStep('REVIEW');
        } catch (e) {
            setAuditResult(prev => prev + "\n\n[ERROR: El Googlito no pudo aplicar los cambios]");
            setStep('REVIEW');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 transition-all">
            <div className="bg-[#fcfcfc] rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up border border-slate-300 flex flex-col max-h-[90vh]">
                
                {/* Header Dinámico */}
                <div className={`p-4 md:p-5 flex justify-between items-center text-white border-b-4 transition-colors duration-500 ${step === 'FIXING' || step === 'REVIEW' ? 'bg-indigo-600 border-indigo-800' : 'bg-slate-800 border-red-700'}`}>
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`p-2 rounded-full shrink-0 ${step === 'FIXING' || step === 'REVIEW' ? 'bg-indigo-800' : 'bg-red-800'}`}>
                            {step === 'AUDITING' ? <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 animate-pulse" /> : 
                             step === 'FIXING' ? <Wrench className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> :
                             <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-lg md:text-xl tracking-wide truncate">
                                {step === 'AUDITING' && "Gretchen: Auditando..."}
                                {step === 'FIXING' && "Googlito: Corrigiendo..."}
                                {step === 'REVIEW' && "Reporte Completado"}
                            </h3>
                            <p className="text-xs text-white/70 uppercase tracking-widest truncate hidden md:block">
                                {step === 'AUDITING' ? "Detectando incompetencias" : step === 'FIXING' ? "Resolviendo problemas detectados" : "Revisión Final"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition text-white shrink-0"><X className="w-5 h-5"/></button>
                </div>
                
                {/* Content Area */}
                <div className="p-0 overflow-y-auto flex-1 bg-slate-50 relative">
                    
                    {step === 'AUDITING' && (
                        <div className="flex flex-col items-center justify-center h-64 p-8 text-center space-y-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-slate-200 border-t-red-700 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl">🧐</span>
                                </div>
                            </div>
                            <p className="text-slate-600 font-serif text-lg italic animate-pulse">"Déjame ver qué desastre has hecho aquí..."</p>
                        </div>
                    )}

                    {(step === 'FIXING' || (step === 'REVIEW' && auditResult)) && (
                        <div className="p-4 md:p-8 border-b border-slate-200 bg-white">
                             <div className="flex flex-col md:flex-row items-start gap-4">
                                <div className="flex items-center gap-3 md:block">
                                    <img src="https://ui-avatars.com/api/?name=Gretchen+Bodinski&background=334155&color=fff" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-red-100 shadow-sm" alt="Gretchen"/>
                                    <h4 className="font-bold text-red-700 text-sm uppercase tracking-wide md:hidden">Crítica de Gretchen</h4>
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                    <h4 className="font-bold text-red-700 text-sm uppercase tracking-wide mb-2 hidden md:block">Crítica de Gretchen</h4>
                                    <div className="prose prose-sm prose-red max-w-none text-slate-700 bg-red-50 p-4 rounded-lg border border-red-100">
                                        <MarkdownView content={auditResult} />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {step === 'FIXING' && (
                         <div className="flex items-center gap-3 p-6 bg-indigo-50 animate-pulse border-t border-indigo-100">
                            <Wrench className="w-5 h-5 text-indigo-600" />
                            <span className="text-indigo-800 font-medium text-sm">El Googlito está reescribiendo la sección...</span>
                         </div>
                    )}

                    {step === 'REVIEW' && fixedData && (
                        <div className="p-4 md:p-8 bg-indigo-50/50">
                             <div className="flex flex-col md:flex-row items-start gap-4">
                                <div className="hidden md:flex w-12 h-12 rounded-full bg-indigo-100 items-center justify-center border-2 border-indigo-200 shrink-0">
                                    <Sparkles className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="md:hidden w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                                            <Sparkles className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <h4 className="font-bold text-indigo-700 text-sm uppercase tracking-wide">Propuesta del Googlito</h4>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm text-xs md:text-sm text-slate-600 font-mono overflow-x-auto max-h-60">
                                        <pre>{JSON.stringify(fixedData, null, 2)}</pre>
                                    </div>
                                    <p className="text-xs text-indigo-400 mt-2">* Estos cambios reemplazarán los datos actuales.</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step === 'REVIEW' && (
                    <div className="p-4 bg-white border-t border-slate-200 flex flex-col-reverse md:flex-row justify-end gap-3">
                        <Button variant="ghost" onClick={onClose} className="w-full md:w-auto">Cancelar</Button>
                        <Button 
                            className="!bg-indigo-600 hover:!bg-indigo-700 w-full md:w-auto" 
                            onClick={() => {
                                onApplyFix(fixedData);
                                onClose();
                            }}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aplicar Correcciones
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Janice Improvement Modal ---

const JaniceModal = ({ 
    isOpen, 
    onClose, 
    initialText, 
    context, 
    onApply 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    initialText: string; 
    context: string;
    onApply: (text: string) => void;
}) => {
    const [instruction, setInstruction] = useState("Mejóralo para que suene más profesional");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const serviceRef = useRef(createGeminiService());

    useEffect(() => {
        setResult("");
        setIsLoading(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAskJanice = async () => {
        setIsLoading(true);
        try {
            const improved = await serviceRef.current.askJanice(initialText, instruction, context);
            setResult(improved);
        } catch (e) {
            setResult("Lo siento, estoy tomando un café. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border-2 border-purple-100 max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <h3 className="font-bold text-lg">Hola, soy Janice</h3>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Texto Original</label>
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg max-h-32 overflow-y-auto italic border border-slate-100">
                            "{initialText || 'Vacío'}"
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">¿Qué necesitas?</label>
                        <div className="flex flex-col md:flex-row gap-2 mt-1">
                            <input 
                                className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="Ej: Hazlo más ejecutivo..."
                            />
                            <Button onClick={handleAskJanice} disabled={isLoading || !initialText} className="!bg-purple-600 hover:!bg-purple-700 w-full md:w-auto">
                                {isLoading ? 'Pensando...' : 'Mejorar'}
                            </Button>
                        </div>
                    </div>

                    {result && (
                        <div className="animate-fade-in">
                            <label className="text-xs font-bold text-green-600 uppercase flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3"/> Sugerencia de Janice
                            </label>
                            <textarea 
                                className="w-full mt-1 p-3 text-sm text-slate-800 bg-green-50 border border-green-200 rounded-lg focus:outline-none h-32"
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <Button onClick={() => { onApply(result); onClose(); }} className="!bg-green-600 hover:!bg-green-700 w-full md:w-auto">
                                    Aplicar Cambio
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<CVProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state for Donna
  const [donnaChat, setDonnaChat] = useState<ChatMessage[]>([]);
  const [donnaInput, setDonnaInput] = useState("");
  const [donnaLoading, setDonnaLoading] = useState(false);
  const [donnaActiveTab, setDonnaActiveTab] = useState<'experience' | 'education' | 'projects' | 'skills'>('experience');

  // Janice State
  const [janiceOpen, setJaniceOpen] = useState(false);
  const [janiceData, setJaniceData] = useState<{text: string, context: string, callback: (t: string) => void} | null>(null);

  // Gretchen State
  const [gretchenOpen, setGretchenOpen] = useState(false);

  const geminiServiceRef = useRef<GeminiService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [donnaChat]);

  const openJanice = (text: string, context: string, callback: (t: string) => void) => {
      setJaniceData({ text, context, callback });
      setJaniceOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // --- JSON IMPORT (ENHANCED) ---
    // Added check for text/plain or empty types which happen on mobile, validating via file content logic
    if (file.type === 'application/json' || file.name.endsWith('.json') || file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            try {
                // Try parsing as JSON first
                const json = JSON.parse(content);
                
                // Detection logic: Does it look like OUR profile format (backup)?
                // A valid profile has experience array and skills array at minimum
                const isInternalProfile = 
                    Array.isArray(json.experience) && 
                    Array.isArray(json.skills) && 
                    Array.isArray(json.projects);

                if (isInternalProfile) {
                    // Restore backup directly
                    setProfile(json);
                    setAppState(AppState.WIZARD);
                    setCurrentStep(0); 
                } else {
                    // It is a JSON but generic (e.g. from other tools). Use AI to extract/convert.
                    setAppState(AppState.ANALYZING);
                    if (geminiServiceRef.current) {
                        const result = await geminiServiceRef.current.analyzeCVText(content);
                        setProfile(result);
                        setAppState(AppState.WIZARD);
                        setCurrentStep(0);
                    }
                }
            } catch (err) {
                // If JSON parse fails, and it was a text file, maybe it's a raw text CV?
                // For now, if it fails to parse as JSON, we treat it as an error or could fallback to text analysis if we wanted.
                // Assuming "Permitir subir jsons" implies valid JSON files.
                console.error(err);
                if (file.name.endsWith('.json')) {
                    setError("El archivo JSON no es válido o no pudo ser analizado.");
                    setAppState(AppState.ERROR);
                } else {
                     // If it was a text/plain file that failed JSON parse, it might be an image/pdf flow that got misrouted or just invalid.
                     // But strictly for JSON upload feature, we stop here.
                     setError("El archivo no es un JSON válido.");
                     setAppState(AppState.ERROR);
                }
            }
        };
        reader.readAsText(file);
        return;
    }

    setAppState(AppState.ANALYZING);

    // --- ZIP HANDLING ---
    if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
        try {
            const zip = await JSZip.loadAsync(file);
            // Find first valid file
            const validFile: any = Object.values(zip.files).find((f: any) => 
                !f.dir && (f.name.endsWith('.pdf') || f.name.match(/\.(jpg|jpeg|png)$/i))
            );

            if (!validFile) {
                throw new Error("No se encontró un PDF o imagen válido dentro del ZIP.");
            }

            const base64Data = await validFile.async('base64');
            const mimeType = validFile.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'; // Simplification for images

             if (geminiServiceRef.current) {
                const result = await geminiServiceRef.current.analyzeCVJSON(base64Data, mimeType);
                setProfile(result);
                setAppState(AppState.WIZARD);
                setCurrentStep(0); // Show Rotenmeir success screen
            }

        } catch (err: any) {
            setError(err.message || "Error al procesar el archivo ZIP.");
            setAppState(AppState.IDLE); // Go back to idle on error
        }
        return;
    }

    // --- NORMAL PDF/IMAGE HANDLING ---
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; 
      
      if (geminiServiceRef.current) {
        try {
          // "Señorita Rotenmeir" ingests the data
          const result = await geminiServiceRef.current.analyzeCVJSON(base64Data, file.type);
          setProfile(result);
          setAppState(AppState.WIZARD);
          setCurrentStep(0); // Show Rotenmeir success screen
        } catch (err: any) {
          setError("La Señorita Rotenmeir rechazó este documento. (Error de análisis)");
          setAppState(AppState.ERROR);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportJSON = () => {
      if (!profile) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "perfil_rotenmeir.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  /**
   * Cleans the profile by removing any field that contains placeholders or empty values.
   * This ensures that Googlito's "suggestions" that were not filled by the user are not shown.
   */
  const cleanProfile = (p: CVProfile): CVProfile => {
      const isDirty = (s: string) => {
          if (!s || typeof s !== 'string') return true;
          const trimmed = s.trim();
          if (trimmed === "") return true;
          // Check for Googlito placeholders
          if (trimmed.includes("[ACCIÓN REQUERIDA") || 
              trimmed.includes("[FALTA:") || 
              trimmed.includes("[COMPLETAR:") ||
              trimmed.includes("[INSERTAR")) {
              return true;
          }
          return false;
      };

      return {
          ...p,
          summary: isDirty(p.summary) ? "" : p.summary,
          experience: p.experience.filter(e => !isDirty(e.role) && !isDirty(e.company)).map(e => ({
              ...e,
              description: isDirty(e.description) ? "" : e.description
          })),
          education: p.education.filter(e => !isDirty(e.institution)),
          skills: p.skills.filter(s => !isDirty(s)),
          techStack: {
              languages: p.techStack.languages.filter(s => !isDirty(s)),
              ides: p.techStack.ides.filter(s => !isDirty(s)),
              frameworks: p.techStack.frameworks.filter(s => !isDirty(s)),
              tools: p.techStack.tools.filter(s => !isDirty(s)),
          },
          projects: p.projects.filter(pr => !isDirty(pr.name)).map(pr => ({
              ...pr,
              description: isDirty(pr.description) ? "" : pr.description,
              technologies: isDirty(pr.technologies) ? "" : pr.technologies,
              link: isDirty(pr.link || "") ? undefined : pr.link
          })),
          volunteering: p.volunteering.filter(v => !isDirty(v.company)).map(v => ({
              ...v,
              description: isDirty(v.description) ? "" : v.description
          })),
          awards: p.awards.filter(a => !isDirty(a)),
          languages: p.languages.filter(l => !isDirty(l.language)),
          hobbies: p.hobbies.filter(h => !isDirty(h))
      };
  };

  const handleNext = async () => {
      // Step 10 is the Final Review (Step 10 in array index)
      if (currentStep < 10) {
          setCurrentStep(c => c + 1);
      } else {
          // Initialize Donna with CLEANED data
          if (geminiServiceRef.current && profile) {
              const cleanedProfile = cleanProfile(profile);
              setProfile(cleanedProfile); // Update state with clean data
              await geminiServiceRef.current.initDonnaChat(cleanedProfile);
              setDonnaChat([]);
              setAppState(AppState.DONNA);
          }
      }
  };

  const handleBack = () => {
      if (currentStep > 0) {
          setCurrentStep(c => c - 1);
      }
  };

  const handleDonnaSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!donnaInput.trim() || donnaLoading || !geminiServiceRef.current) return;

      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: donnaInput, timestamp: new Date() };
      setDonnaChat(prev => [...prev, userMsg]);
      setDonnaInput("");
      setDonnaLoading(true);

      try {
          const response = await geminiServiceRef.current.talkToDonna(userMsg.text);
          setDonnaChat(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: response, timestamp: new Date() }]);
      } catch (e) {
          console.error(e);
      } finally {
          setDonnaLoading(false);
      }
  };

  const getSectionDataForGretchen = (step: number) => {
      if (!profile) return null;
      switch(step) {
          case 1: return profile.experience;
          case 2: return profile.skills;
          case 3: return profile.techStack;
          case 4: return profile.projects;
          case 5: return profile.volunteering;
          case 6: return profile.awards;
          case 7: return profile.languages;
          case 8: return profile.hobbies;
          case 9: return profile.summary;
          default: return null;
      }
  }

  const handleGretchenFix = (newData: any) => {
      if (!profile) return;
      const newProfile = { ...profile };
      
      switch(currentStep) {
          case 1: newProfile.experience = newData; break;
          case 2: newProfile.skills = newData; break;
          case 3: newProfile.techStack = newData; break;
          case 4: newProfile.projects = newData; break;
          case 5: newProfile.volunteering = newData; break;
          case 6: newProfile.awards = newData; break;
          case 7: newProfile.languages = newData; break;
          case 8: newProfile.hobbies = newData; break;
          case 9: newProfile.summary = newData.summary || newData; break; // Handle string or obj
      }
      setProfile(newProfile);
  }

  // --- Render Functions for Personas ---

  const renderRotenmeir = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-white relative font-serif">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20"></div>
        
        <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-fade-in">
            <div className="bg-slate-800 p-6 md:p-8 border border-slate-700 shadow-2xl relative rounded-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-800"></div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-700 mx-auto rounded-full flex items-center justify-center mb-6 border-4 border-slate-600 shadow-inner">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-slate-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-slate-200">Señorita Rotenmeir</h1>
                <p className="text-red-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-6">Directora de Ingesta de Datos</p>
                <p className="text-slate-400 italic mb-8 font-serif leading-relaxed text-sm md:text-base">"Entrégueme sus documentos. Acepto PDF, Imágenes, ZIP o archivos JSON previamente aprobados."</p>
                
                {appState === AppState.ANALYZING ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-red-800 border-t-slate-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-mono animate-pulse">ANALIZANDO ESTRUCTURA...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative w-full group">
                            <div className="flex items-center justify-center gap-3 bg-red-900 group-hover:bg-red-800 text-red-100 font-bold py-3 px-4 md:py-4 md:px-6 transition-all transform group-hover:scale-[1.02] shadow-lg border border-red-950 rounded cursor-pointer">
                                <Upload className="w-5 h-5"/> 
                                <span>Entregar Documentación</span>
                            </div>
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                                accept=".pdf,.json,.txt,.zip,.jpg,.jpeg,.png,application/pdf,application/json,text/plain,text/json,application/zip,application/x-zip-compressed,image/*" 
                                onChange={handleFileUpload} 
                            />
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                             <FileArchive className="w-4 h-4"/>
                             <span>Soporta ZIP y JSON</span>
                        </div>
                    </div>
                )}
                {error && <p className="mt-4 text-red-400 text-sm bg-red-900/20 p-2 border border-red-900">{error}</p>}
            </div>
            <p className="text-[10px] text-slate-600 font-mono tracking-widest">SISTEMA STRICT-CHECK v4.0 // SOLO PERSONAL AUTORIZADO</p>
        </div>
    </div>
  );

  const renderGooglitoStep = () => {
      if (!profile) return null;

      // STEP 0: Rotenmeir Approval Screen
      if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-white font-serif">
                <div className="max-w-lg w-full bg-slate-800 p-6 md:p-8 border border-slate-700 shadow-2xl relative text-center animate-fade-in-up rounded-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Análisis Completado</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">"La extracción de datos ha sido satisfactoria. Puede descargar el registro JSON para sus archivos antes de proceder con el equipo de Googlitos."</p>
                    
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={handleExportJSON}
                            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 transition-colors border border-slate-600 font-sans rounded"
                        >
                            <FileJson className="w-5 h-5" />
                            Descargar JSON de Datos
                        </button>
                        
                        <button 
                            onClick={() => setCurrentStep(1)}
                            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-3 px-4 transition-colors font-bold font-sans shadow-lg rounded"
                        >
                            Proceder a Googlitos
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-slate-500 font-mono">DATA_INTEGRITY: VERIFIED</p>
                </div>
            </div>
        );
      }

      const steps = [
          null, // 0 is Rotenmeir Success
          { id: 'exp', title: 'Experiencia', icon: <Briefcase />, desc: 'Define tu trayectoria profesional.', ai: 'Googlito Experto' },
          { id: 'skills', title: 'Skills Generales', icon: <Star />, desc: 'Tus superpoderes y habilidades blandas.', ai: 'Googlito Talento' },
          { id: 'tech', title: 'Stack Tecnológico', icon: <Terminal />, desc: 'Lenguajes, Frameworks y Herramientas.', ai: 'Googlito Tech' },
          { id: 'projects', title: 'Proyectos', icon: <Code />, desc: 'Lo que has construido.', ai: 'Googlito Maker' },
          { id: 'vol', title: 'Voluntariado', icon: <Heart />, desc: 'Tu impacto social.', ai: 'Googlito Social' },
          { id: 'awards', title: 'Reconocimientos', icon: <Award />, desc: 'Premios y certificaciones.', ai: 'Googlito Fame' },
          { id: 'lang', title: 'Idiomas', icon: <Globe />, desc: '¿Qué lenguas dominas?', ai: 'Googlito Lingua' },
          { id: 'hobbies', title: 'Hobbies', icon: <BookOpen />, desc: '¿Qué te apasiona fuera del trabajo?', ai: 'Googlito Life' },
          { id: 'summary', title: 'Perfil Profesional', icon: <User />, desc: 'Descripción del Candidato y Rol.', ai: 'Googlito Bio' },
          { id: 'review', title: 'Revisión Final', icon: <FileText />, desc: 'Verifica todos los datos antes de finalizar.', ai: 'Googlito Auditor' },
      ];

      const step = steps[currentStep];
      if (!step) return null;

      return (
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
              <JaniceModal 
                isOpen={janiceOpen} 
                onClose={() => setJaniceOpen(false)}
                initialText={janiceData?.text || ''}
                context={janiceData?.context || ''}
                onApply={janiceData?.callback || (() => {})}
              />

              <GretchenModal
                isOpen={gretchenOpen}
                onClose={() => setGretchenOpen(false)}
                sectionName={step.title}
                sectionData={getSectionDataForGretchen(currentStep)}
                onApplyFix={handleGretchenFix}
              />

              {/* Googlito Header */}
              <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                  <div className="flex items-center space-x-2">
                      <div className="flex space-x-1 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                      <span className="font-bold text-slate-700 ml-2 text-sm md:text-base">Googlito System</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="hidden md:flex text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100 items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Janice is Online
                      </span>
                      <div className="text-xs md:text-sm font-medium text-slate-400">Paso {currentStep} / {steps.length - 1}</div>
                  </div>
              </header>

              <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-10 animate-fade-in pb-20">
                  <SectionHeader 
                    title={step.title} 
                    description={step.desc} 
                    icon={step.icon} 
                    aiName={step.ai} 
                    onGretchenClick={() => setGretchenOpen(true)}
                  />
                  
                  {/* DYNAMIC FORM CONTENT BASED ON STEP */}
                  <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 md:space-y-8">
                      {/* ... (Existing form content logic assumed here for brevity, only showing structure) ... */}
                      {/* Note: I'm not removing the form content, just ensuring the wrapper allows scrolling by removing potentially conflicting classes if they existed, but the main structure was fine. */}
                      
                      {/* STEP 1: EXPERIENCE */}
                      {currentStep === 1 && (
                          <div className="space-y-6 md:space-y-8">
                              {profile.experience.map((exp, idx) => (
                                  <div key={idx} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 relative group hover:border-blue-300 transition-colors">
                                      <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3 md:gap-0">
                                          <div className="flex items-start gap-4 w-full md:mr-4">
                                              <div className="hidden md:block">
                                                  <CompanyLogo name={exp.company} />
                                              </div>
                                              <div className="w-full">
                                              <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 p-0" value={exp.role} onChange={(e) => {
                                                  const newExp = [...profile.experience];
                                                  newExp[idx].role = e.target.value;
                                                  setProfile({...profile, experience: newExp});
                                              }} placeholder="Cargo / Rol" />
                                              <div className="flex gap-2 mt-1">
                                                  <input className="flex-1 text-sm bg-transparent border-none text-blue-600 font-medium p-0 focus:ring-0 placeholder-blue-300" value={exp.company} onChange={(e) => {
                                                      const newExp = [...profile.experience];
                                                      newExp[idx].company = e.target.value;
                                                      setProfile({...profile, experience: newExp});
                                                  }} placeholder="Empresa" />
                                              </div>
                                          </div>
                                          </div>
                                          <input className="w-full md:w-32 text-left md:text-right text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500 shrink-0" value={exp.period} onChange={(e) => {
                                              const newExp = [...profile.experience];
                                              newExp[idx].period = e.target.value;
                                              setProfile({...profile, experience: newExp});
                                          }} placeholder="Periodo" />
                                      </div>
                                      
                                      <div className="relative">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3 h-28 focus:ring-2 focus:ring-blue-100 outline-none resize-none" value={exp.description} onChange={(e) => {
                                            const newExp = [...profile.experience];
                                            newExp[idx].description = e.target.value;
                                            setProfile({...profile, experience: newExp});
                                        }} placeholder="Describe tus logros y responsabilidades..." />
                                        <button 
                                            onClick={() => openJanice(exp.description, `Experiencia laboral como ${exp.role}`, (txt) => {
                                                const newExp = [...profile.experience];
                                                newExp[idx].description = txt;
                                                setProfile({...profile, experience: newExp});
                                            })}
                                            className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-200 flex items-center gap-1 transition-colors"
                                        >
                                            <Sparkles className="w-3 h-3" /> Janice
                                        </button>
                                      </div>
                                      <button onClick={() => {
                                           const newExp = profile.experience.filter((_, i) => i !== idx);
                                           setProfile({...profile, experience: newExp});
                                      }} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"><XIcon /></button>
                                  </div>
                              ))}
                              {profile.experience.length === 0 && <EmptyState text="No se detectó experiencia. ¡Añade una!" />}
                              <Button variant="outline" className="w-full md:w-auto" onClick={() => setProfile({...profile, experience: [...profile.experience, { company: '', role: 'Nuevo Rol', period: '', description: '' }]})}>+ Añadir Experiencia</Button>
                          </div>
                      )}

                      {/* STEP 2: SKILLS */}
                      {currentStep === 2 && (
                          <div className="space-y-6">
                              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                  <p className="text-sm text-blue-800 mb-2">💡 Tip de Janice: Mantén una mezcla equilibrada de habilidades técnicas y blandas.</p>
                                  <div className="flex flex-wrap gap-3">
                                      {profile.skills.map((skill, idx) => (
                                          <div key={idx} className="flex items-center bg-white text-slate-700 pl-3 pr-2 py-1.5 rounded-full text-sm border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
                                              <input 
                                                className="bg-transparent border-none focus:ring-0 text-slate-700 w-full min-w-[60px] p-0 text-sm" 
                                                value={skill} 
                                                onChange={(e) => {
                                                    const newSkills = [...profile.skills];
                                                    newSkills[idx] = e.target.value;
                                                    setProfile({...profile, skills: newSkills});
                                                }}
                                              />
                                              <button onClick={() => {
                                                   const newSkills = profile.skills.filter((_, i) => i !== idx);
                                                   setProfile({...profile, skills: newSkills});
                                              }} className="ml-2 text-slate-400 hover:text-red-500"><XIcon /></button>
                                          </div>
                                      ))}
                                      <button onClick={() => setProfile({...profile, skills: [...profile.skills, "Nueva habilidad"]})} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200 transition">+ Añadir</button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* STEP 3: TECH STACK */}
                      {currentStep === 3 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['languages', 'frameworks', 'ides', 'tools'].map((cat) => (
                                  <div key={cat} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{cat}</h3>
                                      <div className="flex flex-wrap gap-2">
                                          {(profile.techStack as any)[cat]?.map((item: string, idx: number) => (
                                              <span key={idx} className="bg-white text-slate-700 px-2 py-1 rounded text-sm border border-slate-200 flex items-center gap-1 shadow-sm">
                                                  {item}
                                                  <button onClick={() => {
                                                      const newStack = {...profile.techStack};
                                                      (newStack as any)[cat] = (newStack as any)[cat].filter((_:any, i:number) => i !== idx);
                                                      setProfile({...profile, techStack: newStack});
                                                  }} className="text-slate-300 hover:text-red-500">×</button>
                                              </span>
                                          ))}
                                          <button 
                                            onClick={() => {
                                                const newItem = prompt(`Añadir a ${cat}:`);
                                                if (newItem) {
                                                    const newStack = {...profile.techStack};
                                                    (newStack as any)[cat] = [...(newStack as any)[cat], newItem];
                                                    setProfile({...profile, techStack: newStack});
                                                }
                                            }}
                                            className="px-2 py-1 rounded text-sm border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500"
                                          >+</button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* STEP 4: PROJECTS */}
                      {currentStep === 4 && (
                           <div className="space-y-6">
                           {profile.projects.map((proj, idx) => (
                               <div key={idx} className="p-4 md:p-6 bg-indigo-50/30 rounded-xl border border-indigo-100 relative">
                                   <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-indigo-900 placeholder-indigo-300 pr-8" value={proj.name} onChange={(e) => {
                                       const newP = [...profile.projects];
                                       newP[idx].name = e.target.value;
                                       setProfile({...profile, projects: newP});
                                   }} placeholder="Nombre del Proyecto" />
                                   
                                   <div className="relative mt-3">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-indigo-100 rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-100 outline-none resize-none" value={proj.description} onChange={(e) => {
                                            const newP = [...profile.projects];
                                            newP[idx].description = e.target.value;
                                            setProfile({...profile, projects: newP});
                                        }} placeholder="Descripción" />
                                        <button 
                                            onClick={() => openJanice(proj.description, `Proyecto: ${proj.name}`, (txt) => {
                                                const newP = [...profile.projects];
                                                newP[idx].description = txt;
                                                setProfile({...profile, projects: newP});
                                            })}
                                            className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-200 flex items-center gap-1 transition-colors"
                                        >
                                            <Sparkles className="w-3 h-3" /> Janice
                                        </button>
                                   </div>

                                   <input className="w-full mt-2 text-xs text-indigo-500 bg-white/50 border border-indigo-100 rounded px-2 py-1" value={proj.technologies} onChange={(e) => {
                                       const newP = [...profile.projects];
                                       newP[idx].technologies = e.target.value;
                                       setProfile({...profile, projects: newP});
                                   }} placeholder="Tecnologías usadas (sep. por comas)" />
                                    <button onClick={() => {
                                           const newP = profile.projects.filter((_, i) => i !== idx);
                                           setProfile({...profile, projects: newP});
                                      }} className="absolute top-2 right-2 md:top-4 md:right-4 text-indigo-200 hover:text-red-500"><XIcon /></button>
                               </div>
                           ))}
                           {profile.projects.length === 0 && <EmptyState text="Sin proyectos destacados." />}
                           <Button variant="outline" className="w-full md:w-auto" onClick={() => setProfile({...profile, projects: [...profile.projects, { name: 'Nuevo Proyecto', description: '', technologies: '' }]})}>+ Añadir Proyecto</Button>
                       </div>
                      )}
                      
                      {/* STEP 5: VOLUNTEERING */}
                      {currentStep === 5 && (
                          <div className="space-y-4">
                              {profile.volunteering.map((vol, idx) => (
                                  <div key={idx} className="p-4 bg-green-50/50 rounded-xl border border-green-100 flex flex-col md:flex-row justify-between items-start md:items-center relative">
                                      <div className="flex-1 w-full mr-0 md:mr-4">
                                          <input className="font-bold bg-transparent w-full border-none p-0 focus:ring-0 text-slate-800" value={vol.role} onChange={(e) => {
                                              const newV = [...profile.volunteering];
                                              newV[idx].role = e.target.value;
                                              setProfile({...profile, volunteering: newV});
                                          }} placeholder="Rol Voluntario"/>
                                          <input className="text-sm w-full mt-1 bg-transparent border-none p-0 text-slate-500" value={vol.company} onChange={(e) => {
                                              const newV = [...profile.volunteering];
                                              newV[idx].company = e.target.value;
                                              setProfile({...profile, volunteering: newV});
                                          }} placeholder="Organización"/>
                                      </div>
                                      <button onClick={() => {
                                           const newV = profile.volunteering.filter((_, i) => i !== idx);
                                           setProfile({...profile, volunteering: newV});
                                      }} className="absolute top-2 right-2 md:static text-slate-300 hover:text-red-500"><XIcon /></button>
                                  </div>
                              ))}
                              {profile.volunteering.length === 0 && <EmptyState text="No hay voluntariado registrado." />}
                              <Button variant="outline" className="w-full md:w-auto" onClick={() => setProfile({...profile, volunteering: [...profile.volunteering, { role: 'Voluntario', company: 'Org', period: '', description: '' }]})}>+ Añadir</Button>
                          </div>
                      )}

                      {/* STEP 6: AWARDS */}
                      {currentStep === 6 && (
                          <div className="space-y-3">
                              {profile.awards.map((award, idx) => (
                                  <div key={idx} className="flex gap-3 items-center">
                                      <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg shrink-0"><Award className="w-5 h-5"/></div>
                                      <input className="flex-1 border-b border-slate-200 focus:border-yellow-500 outline-none py-2 bg-transparent text-slate-700 min-w-0" value={award} onChange={(e) => {
                                          const newA = [...profile.awards];
                                          newA[idx] = e.target.value;
                                          setProfile({...profile, awards: newA});
                                      }} />
                                       <button onClick={() => {
                                            const newA = profile.awards.filter((_, i) => i !== idx);
                                            setProfile({...profile, awards: newA});
                                       }} className="text-slate-300 hover:text-red-500 shrink-0"><XIcon /></button>
                                  </div>
                              ))}
                              <Button variant="outline" className="mt-4 w-full md:w-auto" onClick={() => setProfile({...profile, awards: [...profile.awards, "Nuevo Reconocimiento"]})}>+ Añadir Premio</Button>
                          </div>
                      )}

                      {/* STEP 7: LANGUAGES */}
                      {currentStep === 7 && (
                          <div className="space-y-4">
                              {profile.languages.map((lang, idx) => (
                                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm gap-3 md:gap-0">
                                      <div className="flex items-center gap-3 flex-1 w-full">
                                          <Globe className="w-5 h-5 text-slate-400 shrink-0"/>
                                          <input className="font-medium bg-transparent border-none w-full focus:ring-0 text-slate-800" value={lang.language} onChange={(e) => {
                                              const newL = [...profile.languages];
                                              newL[idx].language = e.target.value;
                                              setProfile({...profile, languages: newL});
                                          }} placeholder="Idioma" />
                                      </div>
                                      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start pl-8 md:pl-0">
                                          <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-600 outline-none w-full md:w-auto" value={lang.level} onChange={(e) => {
                                              const newL = [...profile.languages];
                                              newL[idx].level = e.target.value;
                                              setProfile({...profile, languages: newL});
                                          }}>
                                              <option>Básico</option>
                                              <option>Intermedio</option>
                                              <option>Avanzado</option>
                                              <option>Nativo</option>
                                              <option>Bilingüe</option>
                                          </select>
                                          <button onClick={() => {
                                               const newL = profile.languages.filter((_, i) => i !== idx);
                                               setProfile({...profile, languages: newL});
                                          }} className="text-slate-300 hover:text-red-500 ml-2"><XIcon /></button>
                                      </div>
                                  </div>
                              ))}
                              <Button variant="outline" className="w-full md:w-auto" onClick={() => setProfile({...profile, languages: [...profile.languages, { language: 'Idioma', level: 'Intermedio' }]})}>+ Añadir Idioma</Button>
                          </div>
                      )}

                      {/* STEP 8: HOBBIES */}
                      {currentStep === 8 && (
                          <div className="space-y-6">
                               <div className="flex flex-wrap gap-3">
                                  {profile.hobbies.map((hobby, idx) => (
                                      <span key={idx} className="bg-pink-50 text-pink-700 px-4 py-2 rounded-full text-sm border border-pink-100 flex items-center gap-2 shadow-sm">
                                          {hobby}
                                          <button onClick={() => {
                                               const newH = profile.hobbies.filter((_, i) => i !== idx);
                                               setProfile({...profile, hobbies: newH});
                                          }} className="hover:text-pink-900"><XIcon /></button>
                                      </span>
                                  ))}
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className="p-2 bg-slate-100 rounded-full shrink-0"><BookOpen className="w-5 h-5 text-slate-500"/></div>
                                <input id="newHobby" className="border-b-2 border-slate-200 px-3 py-2 text-sm flex-1 outline-none focus:border-pink-500 bg-transparent min-w-0" placeholder="Escribe un hobby y presiona Enter..." onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value;
                                        if(val) {
                                            setProfile({...profile, hobbies: [...profile.hobbies, val]});
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}/>
                              </div>
                          </div>
                      )}

                       {/* STEP 9: PROFESSIONAL SUMMARY (New Step) */}
                       {currentStep === 9 && (
                          <div className="space-y-6">
                              <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Descripción del Candidato / Resumen Ejecutivo</h3>
                                  <textarea 
                                      className="w-full text-base text-slate-700 bg-white border border-slate-200 rounded-lg p-4 h-64 focus:ring-2 focus:ring-blue-100 outline-none resize-none shadow-inner leading-relaxed" 
                                      value={profile.summary} 
                                      onChange={(e) => {
                                          setProfile({...profile, summary: e.target.value});
                                      }} 
                                      placeholder="Escribe un resumen impactante sobre tu perfil profesional..." 
                                  />
                                  <button 
                                      onClick={() => openJanice(profile.summary, `Resumen Profesional`, (txt) => {
                                          setProfile({...profile, summary: txt});
                                      })}
                                      className="absolute bottom-4 right-4 text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 flex items-center gap-2 transition-colors shadow-sm font-bold"
                                  >
                                      <Sparkles className="w-4 h-4" /> Janice: Mejorar Redacción
                                  </button>
                              </div>
                              
                              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                  <strong>Nota Importante:</strong> Este es el texto principal que leerá Donna. Asegúrate de que defina bien quién eres y qué buscas.
                              </div>
                          </div>
                      )}

                       {/* STEP 10: FINAL REVIEW (New Step) */}
                       {currentStep === 10 && (
                          <div className="space-y-6">
                              <div className="bg-slate-800 text-white p-4 rounded-lg flex items-center gap-3">
                                  <ShieldAlert className="w-6 h-6 text-yellow-400" />
                                  <div className="text-sm">
                                      <p className="font-bold">Modo de Revisión Final</p>
                                      <p className="opacity-80">Los datos vacíos o con marcadores de Googlitos no resueltos (ej: [FALTA...]) serán eliminados automáticamente al finalizar.</p>
                                  </div>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  {/* Preview Header */}
                                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                      <div>
                                          <h3 className="font-bold text-slate-800 text-lg">{profile.experience[0]?.role || "Profesional"}</h3>
                                          <p className="text-xs text-slate-500">Vista Previa de Datos</p>
                                      </div>
                                      <div className="flex gap-2">
                                          {['Experiencia', 'Proyectos', 'Skills'].map(t => (
                                              <span key={t} className="text-[10px] uppercase bg-slate-200 px-2 py-1 rounded text-slate-600">{t}</span>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Preview Body */}
                                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto text-sm">
                                      <section>
                                          <h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Resumen</h4>
                                          <p className="text-slate-600 leading-relaxed">{profile.summary || <span className="text-slate-300 italic">Vacío</span>}</p>
                                      </section>
                                      
                                      <section>
                                          <h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Experiencia ({profile.experience.length})</h4>
                                          {profile.experience.map((e, i) => (
                                              <div key={i} className="mb-3 pl-2 border-l-2 border-slate-100">
                                                  <div className="font-bold text-slate-700">{e.role} @ {e.company}</div>
                                                  <div className="text-xs text-slate-400 mb-1">{e.period}</div>
                                                  <p className="text-slate-500 truncate">{e.description}</p>
                                              </div>
                                          ))}
                                      </section>

                                      <section>
                                          <h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Proyectos ({profile.projects.length})</h4>
                                          {profile.projects.map((p, i) => (
                                              <div key={i} className="mb-2">
                                                  <span className="font-bold text-slate-700">{p.name}</span>: <span className="text-slate-500">{p.description.substring(0, 100)}...</span>
                                              </div>
                                          ))}
                                      </section>

                                       <section>
                                          <h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Skills & Stack</h4>
                                          <div className="flex flex-wrap gap-1">
                                              {profile.skills.concat(profile.techStack.languages).map((s,i) => (
                                                  <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{s}</span>
                                              ))}
                                          </div>
                                      </section>
                                  </div>
                              </div>
                          </div>
                      )}

                  </div>
              </main>

              {/* Navigation Footer */}
              <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
                      <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                      </Button>
                      <Button onClick={handleNext} className="bg-slate-800 hover:bg-slate-900 text-white px-6 md:px-8 text-sm md:text-base">
                          {currentStep === 10 ? (
                              <>Finalizar y Conocer a Donna <ArrowRightIcon /></>
                          ) : (
                              <>Siguiente <ChevronRight className="w-4 h-4 ml-2" /></>
                          )}
                      </Button>
                  </div>
              </footer>
          </div>
      );
  };

  const renderDonna = () => {
      if (!profile) return null;
      
      const ActiveTabContent = () => {
          switch(donnaActiveTab) {
              case 'experience':
                  return (
                      <div className="space-y-6 animate-fade-in">
                          {profile.experience.map((exp, i) => (
                              <div key={i} className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                      <CompanyLogo name={exp.company} className="w-10 h-10 md:w-12 md:h-12" />
                                      <div className="w-0.5 bg-slate-200 flex-1 my-2"></div>
                                  </div>
                                  <div className="pb-6 flex-1">
                                  <h4 className="font-bold text-lg text-slate-800">{exp.role}</h4>
                                  <div className="text-sm text-blue-600 font-medium mb-1">{exp.company} <span className="text-slate-400 mx-1">•</span> {exp.period}</div>
                                  <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                              </div>
                              </div>
                          ))}
                          {profile.experience.length === 0 && <p className="text-slate-400 italic">No hay experiencia registrada.</p>}
                      </div>
                  );
              case 'education':
                  return (
                      <div className="space-y-4 animate-fade-in">
                          {profile.education && profile.education.length > 0 ? profile.education.map((edu, i) => (
                              <div key={i} className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                                  <div className="shrink-0">
                                      <CompanyLogo name={edu.institution} className="w-12 h-12" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">{edu.title}</h4>
                                      <p className="text-sm text-slate-500">{edu.institution}</p>
                                      <p className="text-xs text-slate-400 mt-1">{edu.period}</p>
                                  </div>
                              </div>
                          )) : (
                             <p className="text-slate-400 italic">No hay formación registrada.</p>
                          )}
                      </div>
                  );
              case 'projects':
                  return (
                      <div className="space-y-4 animate-fade-in">
                           {profile.projects.map((proj, i) => (
                               <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                   <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-0">
                                       <h4 className="font-bold text-slate-800">{proj.name}</h4>
                                       <div className="flex gap-1">
                                            {proj.link && <a href={proj.link} target="_blank" className="text-blue-500 hover:text-blue-700 text-xs bg-blue-50 px-2 py-1 rounded">Ver Demo</a>}
                                       </div>
                                   </div>
                                   <p className="text-sm text-slate-600 mt-2 mb-3">{proj.description}</p>
                                   <div className="flex flex-wrap gap-2">
                                       {proj.technologies.split(',').map((tech, t) => (
                                           <span key={t} className="text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{tech.trim()}</span>
                                       ))}
                                   </div>
                               </div>
                           ))}
                           {profile.projects.length === 0 && <p className="text-slate-400 italic">No hay proyectos registrados.</p>}
                      </div>
                  );
              case 'skills':
                  return (
                       <div className="flex flex-wrap gap-2 animate-fade-in">
                           {profile.skills.map((s, i) => (
                               <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                                   {s}
                               </span>
                           ))}
                           {[...profile.techStack.languages, ...profile.techStack.frameworks].map((t, i) => (
                                <span key={`t-${i}`} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-full border border-slate-200">
                                   {t}
                               </span>
                           ))}
                       </div>
                  );
          }
      };

      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4 font-sans">
              <div className="bg-white rounded-none md:rounded-[32px] shadow-2xl md:overflow-hidden max-w-6xl w-full flex flex-col md:flex-row min-h-screen md:min-h-[650px] animate-fade-in-up">
                  
                  {/* Left Column: Visual */}
                  <div className="w-full md:w-[45%] bg-[#F0F4FF] flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden h-64 md:h-auto shrink-0">
                      {/* Decorative elements */}
                      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-2xl opacity-50"></div>
                      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
                      
                      {/* Illustration Placeholder using Lucide Icons composed */}
                      <div className="relative z-10 transform scale-75 md:scale-100">
                          <div className="w-64 h-64 relative">
                              <div className="absolute inset-0 bg-white rounded-3xl shadow-lg transform -rotate-6 flex items-center justify-center">
                                  <Layout className="w-32 h-32 text-slate-200" />
                              </div>
                              <div className="absolute inset-0 bg-white rounded-3xl shadow-xl transform rotate-3 flex flex-col items-center justify-center border border-slate-50">
                                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-blue-200 shadow-lg">
                                      <Code className="w-10 h-10 text-white" />
                                  </div>
                                  <div className="w-32 h-4 bg-slate-100 rounded-full mb-2"></div>
                                  <div className="w-24 h-4 bg-slate-100 rounded-full"></div>
                              </div>
                              
                              {/* Floating Badges */}
                              <div className="absolute -right-4 top-10 bg-white p-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce delay-700">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs font-bold text-slate-700">Open to work</span>
                              </div>
                              
                              <div className="absolute -left-8 bottom-12 bg-slate-900 p-3 rounded-xl shadow-lg flex items-center gap-2 text-white transform -rotate-3">
                                  <Terminal className="w-4 h-4" />
                                  <span className="text-xs font-mono">Full Stack</span>
                              </div>
                          </div>
                      </div>
                      
                      {/* Chat Messages Display Overlay on Image (if chat is active) */}
                      {donnaChat.length > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 max-h-[150px] md:max-h-[200px] overflow-y-auto border-t border-slate-200 transition-all z-20">
                              {donnaChat.map((msg) => (
                                  <div key={msg.id} className={`mb-2 text-xs md:text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                      <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                          <MarkdownView content={msg.text} />
                                      </span>
                                  </div>
                              ))}
                              {donnaLoading && <div className="text-xs text-slate-400 animate-pulse ml-2">Donna está escribiendo...</div>}
                              <div ref={chatEndRef}></div>
                          </div>
                      )}
                  </div>

                  {/* Right Column: Content */}
                  <div className="w-full md:w-[55%] p-6 md:p-12 flex flex-col bg-white">
                      <div className="flex-1">
                          <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Bienvenido al perfil de</p>
                          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">
                              <span className="text-slate-900">Expert </span>
                              <span className="text-blue-600">Developer</span>
                          </h1>
                          <h2 className="text-lg md:text-xl font-medium text-slate-600 mb-6 truncate">
                              {profile.experience[0]?.role || "Profesional TI"}
                          </h2>

                          <p className="text-slate-600 leading-relaxed mb-8 max-w-lg text-sm md:text-base">
                              {profile.summary || "Ingeniero de software especializado en arquitecturas escalables, IA y experiencias de usuario intuitivas."}
                          </p>

                          <a href="#" className="text-sm text-blue-600 font-semibold hover:underline mb-8 inline-block">
                              ¿Qué aspecto de mi portafolio te gustaría explorar hoy?
                          </a>

                          {/* Navigation Tabs */}
                          <div className="flex gap-2 mb-6 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
                              {['experience', 'education', 'projects', 'skills'].map((tab) => (
                                  <button
                                      key={tab}
                                      onClick={() => setDonnaActiveTab(tab as any)}
                                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                          donnaActiveTab === tab 
                                          ? 'bg-slate-900 text-white shadow-md' 
                                          : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                      }`}
                                  >
                                      {tab === 'experience' && 'Experiencia'}
                                      {tab === 'education' && 'Formación'}
                                      {tab === 'projects' && 'Proyectos'}
                                      {tab === 'skills' && 'Habilidades'}
                                  </button>
                              ))}
                          </div>

                          {/* Dynamic Content Area */}
                          <div className="h-auto md:h-[300px] md:overflow-y-auto pr-0 md:pr-2 scrollbar-thin">
                              <ActiveTabContent />
                          </div>
                      </div>

                      {/* Search / Chat Input */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                          <form onSubmit={handleDonnaSend} className="relative group">
                              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                              <input 
                                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-none rounded-full py-4 pl-12 pr-12 text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm md:text-base"
                                  placeholder="Pregunta sobre mis proyectos..."
                                  value={donnaInput}
                                  onChange={(e) => setDonnaInput(e.target.value)}
                              />
                              <button 
                                type="submit"
                                disabled={!donnaInput.trim() || donnaLoading}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                              >
                                  <ArrowRight className="w-5 h-5" />
                              </button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );

  const ArrowRightIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );

  return (
    <>
        {appState === AppState.IDLE && renderRotenmeir()}
        {appState === AppState.ANALYZING && renderRotenmeir()}
        {appState === AppState.ERROR && renderRotenmeir()} 
        {appState === AppState.WIZARD && renderGooglitoStep()}
        {appState === AppState.DONNA && renderDonna()}
    </>
  );
}

export default App;