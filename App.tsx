import React, { useState, useRef, useEffect } from 'react';
import { Upload, Briefcase, Award, Code, Heart, Globe, BookOpen, Star, User, ChevronRight, ChevronLeft, Save, Sparkles, Terminal, MessageSquare, X, CheckCircle2, FileJson, Download, FileArchive, Eye, ShieldAlert, Wrench, ArrowRight, GraduationCap, Layout, Search, FileText, Eraser, Send, Bot, Plus } from 'lucide-react';
import { Button } from './components/Button';
import { createGeminiService, GeminiService } from './services/geminiService';
import { createGretchenService, GretchenService } from './services/gretchenService';
import { AppState, CVProfile, ChatMessage } from './types';
import { MarkdownView } from './components/MarkdownView';
import { CompanyLogo } from './components/CompanyLogo';
import JSZip from 'jszip';

// --- Helper: Simple CSV Parser ---
const parseCSV = (text: string): Record<string, string>[] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuote = false;
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (let i = 0; i < normalizedText.length; i++) {
        const char = normalizedText[i];
        const nextChar = normalizedText[i + 1];
        if (char === '"') {
            if (insideQuote && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuote = !insideQuote;
            }
        } else if (char === ',' && !insideQuote) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if (char === '\n' && !insideQuote) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.replace(/^"|"$/g, '').trim());
    const result: Record<string, string>[] = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || (row.length === 1 && !row[0])) continue;
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || '';
        });
        result.push(obj);
    }
    return result;
};

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
        setStep('AUDITING');
        let critique = "";
        try {
            critique = await gretchenServiceRef.current.auditSection(sectionName, sectionData);
            setAuditResult(critique);
        } catch (e) {
            setAuditResult("Error en auditoría. Gretchen se ha ido a comer.");
            return;
        }
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
  const [isDragging, setIsDragging] = useState(false);
  const [donnaChat, setDonnaChat] = useState<ChatMessage[]>([]);
  const [donnaInput, setDonnaInput] = useState("");
  const [donnaLoading, setDonnaLoading] = useState(false);
  const [donnaActiveTab, setDonnaActiveTab] = useState<'experience' | 'education' | 'projects' | 'skills'>('experience');
  const [janiceOpen, setJaniceOpen] = useState(false);
  const [janiceData, setJaniceData] = useState<{text: string, context: string, callback: (t: string) => void} | null>(null);
  const [gretchenOpen, setGretchenOpen] = useState(false);
  
  // State for inline tech stack editing
  const [techInputs, setTechInputs] = useState<Record<string, string>>({ languages: '', frameworks: '', ides: '', tools: '' });

  const geminiServiceRef = useRef<GeminiService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  useEffect(() => {
      if (appState === AppState.DONNA) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [donnaChat, appState]);

  const openJanice = (text: string, context: string, callback: (t: string) => void) => {
      setJaniceData({ text, context, callback });
      setJaniceOpen(true);
  };

  const processFile = async (file: File) => {
    setError(null);
    if (file.type === 'application/json' || file.name.endsWith('.json') || file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            try {
                const json = JSON.parse(content);
                const isInternalProfile = Array.isArray(json.experience) && Array.isArray(json.skills) && Array.isArray(json.projects);
                if (isInternalProfile) {
                    setProfile(json);
                    setAppState(AppState.WIZARD);
                    setCurrentStep(0); 
                } else {
                    setAppState(AppState.ANALYZING);
                    if (geminiServiceRef.current) {
                        const result = await geminiServiceRef.current.analyzeCVText(content);
                        setProfile(result);
                        setAppState(AppState.WIZARD);
                        setCurrentStep(0);
                    }
                }
            } catch (err) {
                console.error(err);
                if (file.name.endsWith('.json')) {
                    setError("El archivo JSON no es válido o no pudo ser analizado.");
                    setAppState(AppState.ERROR);
                } else {
                     setError("El archivo no es un JSON válido.");
                     setAppState(AppState.ERROR);
                }
            }
        };
        reader.readAsText(file);
        return;
    }
    setAppState(AppState.ANALYZING);
    if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
        try {
            const zip = await JSZip.loadAsync(file);
            const files = zip.files;
            const jsonFile = Object.values(files).find((f: any) => !f.dir && f.name.endsWith('.json'));
            if (jsonFile) {
                const jsonText = await (jsonFile as any).async('text');
                try {
                    const json = JSON.parse(jsonText);
                     if (Array.isArray(json.experience) && Array.isArray(json.skills)) {
                        setProfile(json);
                        setAppState(AppState.WIZARD);
                        setCurrentStep(0);
                        return;
                     }
                } catch(e) {
                    console.log("Found JSON in zip but failed to parse as valid profile", e);
                }
            }
            if (files['Positions.csv'] || files['Profile.csv']) {
                const newProfile: CVProfile = {
                    summary: '', experience: [], education: [], skills: [], techStack: { languages: [], ides: [], frameworks: [], tools: [] },
                    projects: [], volunteering: [], awards: [], languages: [], hobbies: []
                };
                const profileSummaryFile = files['Profile Summary.csv'] || files['Profile.csv'];
                if (profileSummaryFile) {
                    const text = await profileSummaryFile.async('text');
                    const data = parseCSV(text);
                    if (data.length > 0) newProfile.summary = data[0]['Summary'] || data[0]['Headline'] || '';
                }
                if (files['Positions.csv']) {
                    const text = await files['Positions.csv'].async('text');
                    const data = parseCSV(text);
                    newProfile.experience = data.map(row => ({
                        company: row['Company Name'] || row['Company'] || '',
                        role: row['Title'] || '',
                        description: row['Description'] || '',
                        period: `${row['Started On'] || ''} - ${row['Finished On'] || 'Present'}`
                    }));
                }
                if (files['Education.csv']) {
                    const text = await files['Education.csv'].async('text');
                    const data = parseCSV(text);
                    newProfile.education = data.map(row => ({
                        institution: row['School Name'] || '',
                        title: `${row['Degree Name'] || ''} ${row['Notes'] || ''}`.trim(),
                        period: `${row['Start Date'] || ''} - ${row['End Date'] || ''}`
                    }));
                }
                if (files['Skills.csv']) {
                    const text = await files['Skills.csv'].async('text');
                    const data = parseCSV(text);
                    newProfile.skills = data.map(row => row['Name']).filter(Boolean);
                }
                if (files['Projects.csv']) {
                    const text = await files['Projects.csv'].async('text');
                    const data = parseCSV(text);
                    newProfile.projects = data.map(row => ({
                        name: row['Title'] || '', description: row['Description'] || '', technologies: '', link: row['Url'] || ''
                    }));
                }
                if (files['Languages.csv']) {
                    const text = await files['Languages.csv'].async('text');
                    const data = parseCSV(text);
                    newProfile.languages = data.map(row => ({ language: row['Name'] || '', level: row['Proficiency'] || '' }));
                }
                setProfile(newProfile);
                setAppState(AppState.WIZARD);
                setCurrentStep(0);
                return;
            }
            const validFile: any = Object.values(zip.files).find((f: any) => !f.dir && (f.name.endsWith('.pdf') || f.name.match(/\.(jpg|jpeg|png)$/i)));
            if (!validFile) throw new Error("No se encontraron documentos válidos dentro del ZIP.");
            const base64Data = await validFile.async('base64');
            const mimeType = validFile.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
            if (geminiServiceRef.current) {
                const result = await geminiServiceRef.current.analyzeCVJSON(base64Data, mimeType);
                setProfile(result);
                setAppState(AppState.WIZARD);
                setCurrentStep(0);
            }
        } catch (err: any) {
            setError(err.message || "Error al procesar el archivo ZIP.");
            setAppState(AppState.IDLE); 
        }
        return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; 
      if (geminiServiceRef.current) {
        try {
          const result = await geminiServiceRef.current.analyzeCVJSON(base64Data, file.type);
          setProfile(result);
          setAppState(AppState.WIZARD);
          setCurrentStep(0); 
        } catch (err: any) {
          setError("La Señorita Rotenmeir rechazó este documento.");
          setAppState(AppState.ERROR);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
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

  const cleanProfile = (p: CVProfile): CVProfile => {
      const isDirty = (s: string) => {
          if (!s || typeof s !== 'string') return true;
          const trimmed = s.trim();
          if (trimmed === "" || trimmed.includes("[ACCIÓN REQUERIDA") || trimmed.includes("[FALTA:") || trimmed.includes("[COMPLETAR:") || trimmed.includes("[INSERTAR")) return true;
          return false;
      };
      return {
          ...p,
          summary: isDirty(p.summary) ? "" : p.summary,
          experience: p.experience.filter(e => !isDirty(e.role) && !isDirty(e.company)).map(e => ({ ...e, description: isDirty(e.description) ? "" : e.description })),
          education: p.education.filter(e => !isDirty(e.institution)),
          skills: p.skills.filter(s => !isDirty(s)),
          techStack: {
              languages: p.techStack.languages.filter(s => !isDirty(s)), ides: p.techStack.ides.filter(s => !isDirty(s)), frameworks: p.techStack.frameworks.filter(s => !isDirty(s)), tools: p.techStack.tools.filter(s => !isDirty(s)),
          },
          projects: p.projects.filter(pr => !isDirty(pr.name)).map(pr => ({ ...pr, description: isDirty(pr.description) ? "" : pr.description, technologies: isDirty(pr.technologies) ? "" : pr.technologies, link: isDirty(pr.link || "") ? undefined : pr.link })),
          volunteering: p.volunteering.filter(v => !isDirty(v.company)).map(v => ({ ...v, description: isDirty(v.description) ? "" : v.description })),
          awards: p.awards.filter(a => !isDirty(a)),
          languages: p.languages.filter(l => !isDirty(l.language)),
          hobbies: p.hobbies.filter(h => !isDirty(h))
      };
  };

  const handleNext = async () => {
      if (currentStep < 10) setCurrentStep(c => c + 1);
      else {
          if (geminiServiceRef.current && profile) {
              const cleanedProfile = cleanProfile(profile);
              setProfile(cleanedProfile);
              await geminiServiceRef.current.initDonnaChat(cleanedProfile);
              setDonnaChat([{ id: 'intro', role: 'model', text: `¡Hola! Soy Donna, tu asistente de reclutamiento. He analizado el perfil de **${cleanedProfile.experience[0]?.role || "Candidato"}** a fondo. ¿Qué te gustaría saber?`, timestamp: new Date() }]);
              setAppState(AppState.DONNA);
          }
      }
  };

  const handleBack = () => { if (currentStep > 0) setCurrentStep(c => c - 1); };

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
      } catch (e) { console.error(e); } finally { setDonnaLoading(false); }
  };

  const getSectionDataForGretchen = (step: number) => {
      if (!profile) return null;
      switch(step) {
          case 1: return profile.experience; case 2: return profile.skills; case 3: return profile.techStack; case 4: return profile.projects; case 5: return profile.volunteering;
          case 6: return profile.awards; case 7: return profile.languages; case 8: return profile.hobbies; case 9: return profile.summary; default: return null;
      }
  }

  const handleGretchenFix = (newData: any) => {
      if (!profile) return;
      const newProfile = { ...profile };
      switch(currentStep) {
          case 1: newProfile.experience = newData; break; case 2: newProfile.skills = newData; break; case 3: newProfile.techStack = newData; break;
          case 4: newProfile.projects = newData; break; case 5: newProfile.volunteering = newData; break; case 6: newProfile.awards = newData; break;
          case 7: newProfile.languages = newData; break; case 8: newProfile.hobbies = newData; break; case 9: newProfile.summary = newData.summary || newData; break;
      }
      setProfile(newProfile);
  }

  const handleAddTech = (cat: string, value: string) => {
      if (!profile || !value.trim()) return;
      const cleanValue = value.trim();
      if ((profile.techStack as any)[cat].includes(cleanValue)) return;
      const newStack = { ...profile.techStack };
      (newStack as any)[cat] = [...(newStack as any)[cat], cleanValue];
      setProfile({ ...profile, techStack: newStack });
      setTechInputs(prev => ({ ...prev, [cat]: '' }));
  };

  const handleRemoveTech = (cat: string, idx: number) => {
      if (!profile) return;
      const newStack = { ...profile.techStack };
      (newStack as any)[cat] = (newStack as any)[cat].filter((_: any, i: number) => i !== idx);
      setProfile({ ...profile, techStack: newStack });
  };

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
                <p className="text-slate-400 italic mb-8 font-serif leading-relaxed text-sm md:text-base">"Entrégueme sus documentos. Acepto PDF, Imágenes, ZIP o archivos JSON aprobados."</p>
                {appState === AppState.ANALYZING ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-red-800 border-t-slate-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-mono animate-pulse">ANALIZANDO ESTRUCTURA...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative w-full group" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                            <div className={`flex flex-col items-center justify-center gap-2 py-8 px-6 transition-all transform border-2 border-dashed rounded-lg cursor-pointer ${isDragging ? 'bg-red-800 border-red-400 scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-slate-800 border-slate-600 hover:bg-slate-750 hover:border-red-500/50'}`}>
                                <div className={`p-4 rounded-full transition-all ${isDragging ? 'bg-red-600 animate-bounce' : 'bg-red-900 text-red-200'}`}><Upload className="w-8 h-8" /></div>
                                <div className="text-center space-y-1">
                                    <p className="text-lg font-bold text-slate-200">{isDragging ? '¡SUÉLTALO AHORA!' : 'Entregar Documentación'}</p>
                                    <p className="text-xs text-slate-400 font-mono">Clic o arrastra PDF, JSON, ZIP</p>
                                </div>
                            </div>
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept=".pdf,.json,.txt,.zip,.jpg,.jpeg,.png,application/pdf,application/json,text/plain,text/json,application/zip,application/x-zip-compressed,image/*" onChange={handleFileUpload} />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4"><FileArchive className="w-4 h-4"/><span>Soporta ZIP (LinkedIn Data) y JSON</span></div>
                    </div>
                )}
                {error && <p className="mt-4 text-red-400 text-sm bg-red-900/20 p-2 border border-red-900">{error}</p>}
            </div>
        </div>
    </div>
  );

  const renderGooglitoStep = () => {
      if (!profile) return null;
      if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-white font-serif">
                <div className="max-w-lg w-full bg-slate-800 p-6 md:p-8 border border-slate-700 shadow-2xl relative text-center animate-fade-in-up rounded-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Análisis Completado</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">"La extracción ha sido satisfactoria. Puede descargar el registro JSON antes de proceder con el equipo de Googlitos."</p>
                    <div className="flex flex-col gap-4">
                        <button onClick={handleExportJSON} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 border border-slate-600 font-sans rounded"><FileJson className="w-5 h-5" />Descargar JSON de Datos</button>
                        <button onClick={() => setCurrentStep(1)} className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-3 px-4 transition-colors font-bold font-sans shadow-lg rounded">Proceder a Googlitos<ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        );
      }
      const steps = [
          null,
          { id: 'exp', title: 'Experiencia', icon: <Briefcase />, desc: 'Define tu trayectoria profesional.', ai: 'Googlito Experto' },
          { id: 'skills', title: 'Skills Generales', icon: <Star />, desc: 'Tus superpoderes y habilidades blandas.', ai: 'Googlito Talento' },
          { id: 'tech', title: 'Stack Tecnológico', icon: <Terminal />, desc: 'Lenguajes, Frameworks y Herramientas.', ai: 'Googlito Tech' },
          { id: 'projects', title: 'Proyectos', icon: <Code />, desc: 'Lo que has construido.', ai: 'Googlito Maker' },
          { id: 'vol', title: 'Voluntariado', icon: <Heart />, desc: 'Tu impacto social.', ai: 'Googlito Social' },
          { id: 'awards', title: 'Reconocimientos', icon: <Award />, desc: 'Premios y certificaciones.', ai: 'Googlito Fame' },
          { id: 'lang', title: 'Idiomas', icon: <Globe />, desc: '¿Qué lenguas dominas?', ai: 'Googlito Lingua' },
          { id: 'hobbies', title: 'Hobbies', icon: <BookOpen />, desc: '¿Qué te apasiona?', ai: 'Googlito Life' },
          { id: 'summary', title: 'Perfil Profesional', icon: <User />, desc: 'Descripción del Candidato.', ai: 'Googlito Bio' },
          { id: 'review', title: 'Revisión Final', icon: <FileText />, desc: 'Verifica todos los datos.', ai: 'Googlito Auditor' },
      ];
      const step = steps[currentStep];
      if (!step) return null;

      const techSuggestions: Record<string, string[]> = {
          languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Swift', 'Go', 'Ruby', 'Rust', 'C++', 'HTML', 'CSS', 'SQL'],
          frameworks: ['React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Spring Boot', '.NET', 'Laravel', 'Django', 'Flask', 'Express'],
          ides: ['VS Code', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'Visual Studio', 'Xcode', 'Android Studio', 'Sublime Text', 'Vim'],
          tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jira', 'Slack', 'Figma', 'Postman', 'Jenkins']
      };

      const techLabels: Record<string, string> = {
          languages: 'Lenguajes',
          frameworks: 'Frameworks / Librerías',
          ides: 'Entornos (IDEs)',
          tools: 'Herramientas / Cloud'
      };

      return (
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
              <JaniceModal isOpen={janiceOpen} onClose={() => setJaniceOpen(false)} initialText={janiceData?.text || ''} context={janiceData?.context || ''} onApply={janiceData?.callback || (() => {})} />
              <GretchenModal isOpen={gretchenOpen} onClose={() => setGretchenOpen(false)} sectionName={step.title} sectionData={getSectionDataForGretchen(currentStep)} onApplyFix={handleGretchenFix} />
              <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                  <div className="flex items-center space-x-2"><div className="flex space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></div><span className="font-bold text-slate-700 ml-2">Googlito System</span></div>
                  <div className="flex items-center gap-2"><span className="hidden md:flex text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100 items-center gap-1"><Sparkles className="w-3 h-3" /> Janice is Online</span><div className="text-xs md:text-sm font-medium text-slate-400">Paso {currentStep} / {steps.length - 1}</div></div>
              </header>
              <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-10 animate-fade-in pb-20">
                  <SectionHeader title={step.title} description={step.desc} icon={step.icon} aiName={step.ai} onGretchenClick={() => setGretchenOpen(true)} />
                  <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 space-y-6 md:space-y-8">
                      {currentStep === 1 && (
                          <div className="space-y-6 md:space-y-8">
                              {profile.experience.map((exp, idx) => (
                                  <div key={idx} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 relative group hover:border-blue-300 transition-colors">
                                      <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
                                          <div className="flex items-start gap-4 w-full md:mr-4">
                                              <div className="hidden md:block"><CompanyLogo name={exp.company} /></div>
                                              <div className="w-full">
                                                  <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-slate-900 p-0" value={exp.role} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].role = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Cargo / Rol" />
                                                  <input className="flex-1 text-sm bg-transparent border-none text-blue-600 font-medium p-0 focus:ring-0" value={exp.company} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].company = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Empresa" />
                                              </div>
                                          </div>
                                          <input className="w-full md:w-32 text-left md:text-right text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500" value={exp.period} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].period = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Periodo" />
                                      </div>
                                      <div className="relative">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3 h-28 outline-none resize-none" value={exp.description} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].description = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Logros y responsabilidades..." />
                                        <button onClick={() => openJanice(exp.description, `Experiencia como ${exp.role}`, (txt) => { const newExp = [...profile.experience]; newExp[idx].description = txt; setProfile({...profile, experience: newExp}); })} className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Janice</button>
                                      </div>
                                      <button onClick={() => setProfile({...profile, experience: profile.experience.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                                  </div>
                              ))}
                              {profile.experience.length === 0 && <EmptyState text="No se detectó experiencia." />}
                              <Button variant="outline" onClick={() => setProfile({...profile, experience: [...profile.experience, { company: '', role: 'Nuevo Rol', period: '', description: '' }]})}>+ Añadir Experiencia</Button>
                          </div>
                      )}
                      {currentStep === 2 && (
                          <div className="space-y-6">
                              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                  <p className="text-sm text-blue-800 mb-2">💡 Tip: Mezcla habilidades técnicas y blandas.</p>
                                  <div className="flex flex-wrap gap-3">
                                      {profile.skills.map((skill, idx) => (
                                          <div key={idx} className="flex items-center bg-white text-slate-700 pl-3 pr-2 py-1.5 rounded-full text-sm border border-slate-200">
                                              <input className="bg-transparent border-none focus:ring-0 text-slate-700 min-w-[60px] p-0 text-sm" value={skill} onChange={(e) => { const newS = [...profile.skills]; newS[idx] = e.target.value; setProfile({...profile, skills: newS}); }} />
                                              <button onClick={() => setProfile({...profile, skills: profile.skills.filter((_, i) => i !== idx)})} className="ml-2 text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                          </div>
                                      ))}
                                      <button onClick={() => setProfile({...profile, skills: [...profile.skills, "Nueva habilidad"]})} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200">+ Añadir</button>
                                  </div>
                              </div>
                          </div>
                      )}
                      {currentStep === 3 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['languages', 'frameworks', 'ides', 'tools'].map((cat) => (
                                  <div key={cat} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                                      <div className="flex justify-between items-center mb-4">
                                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{techLabels[cat]}</h3>
                                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{(profile.techStack as any)[cat].length}</span>
                                      </div>

                                      {/* Current Selection */}
                                      <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                                          {(profile.techStack as any)[cat]?.map((item: string, idx: number) => (
                                              <span key={idx} className="group bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-colors shadow-sm">
                                                  {item}
                                                  <button onClick={() => handleRemoveTech(cat, idx)} className="text-blue-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                              </span>
                                          ))}
                                          {((profile.techStack as any)[cat] || []).length === 0 && (
                                              <span className="text-xs text-slate-400 italic">Sin elementos aún</span>
                                          )}
                                      </div>

                                      {/* Suggested Buttons */}
                                      <div className="border-t border-slate-100 pt-4 mb-4">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sugerencias rápidas:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                              {techSuggestions[cat].filter(s => !((profile.techStack as any)[cat] || []).includes(s)).map(sugg => (
                                                  <button
                                                      key={sugg}
                                                      onClick={() => handleAddTech(cat, sugg)}
                                                      className="text-[10px] px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-1"
                                                  >
                                                      <Plus className="w-2.5 h-2.5" />
                                                      {sugg}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>

                                      {/* Inline Add */}
                                      <div className="mt-auto relative">
                                          <input 
                                              type="text"
                                              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                              placeholder="Escribe y presiona Enter..."
                                              value={techInputs[cat]}
                                              onChange={(e) => setTechInputs({...techInputs, [cat]: e.target.value})}
                                              onKeyDown={(e) => e.key === 'Enter' && handleAddTech(cat, techInputs[cat])}
                                          />
                                          <button 
                                              onClick={() => handleAddTech(cat, techInputs[cat])}
                                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                          >
                                              <ArrowRight className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                      {currentStep === 4 && (
                           <div className="space-y-6">
                           {profile.projects.map((proj, idx) => (
                               <div key={idx} className="p-4 md:p-6 bg-indigo-50/30 rounded-xl border border-indigo-100 relative">
                                   <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-indigo-900 pr-8" value={proj.name} onChange={(e) => { const newP = [...profile.projects]; newP[idx].name = e.target.value; setProfile({...profile, projects: newP}); }} placeholder="Nombre" />
                                   <div className="relative mt-3">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-indigo-100 rounded-lg p-3 h-24 outline-none resize-none" value={proj.description} onChange={(e) => { const newP = [...profile.projects]; newP[idx].description = e.target.value; setProfile({...profile, projects: newP}); }} placeholder="Descripción" />
                                        <button onClick={() => openJanice(proj.description, `Proyecto: ${proj.name}`, (txt) => { const newP = [...profile.projects]; newP[idx].description = txt; setProfile({...profile, projects: newP}); })} className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Janice</button>
                                   </div>
                                   <input className="w-full mt-2 text-xs text-indigo-500 bg-white/50 border border-indigo-100 rounded px-2 py-1" value={proj.technologies} onChange={(e) => { const newP = [...profile.projects]; newP[idx].technologies = e.target.value; setProfile({...profile, projects: newP}); }} placeholder="Tecnologías (comas)" />
                                    <button onClick={() => setProfile({...profile, projects: profile.projects.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-indigo-200 hover:text-red-500"><X className="w-5 h-5" /></button>
                               </div>
                           ))}
                           <Button variant="outline" onClick={() => setProfile({...profile, projects: [...profile.projects, { name: 'Nuevo Proyecto', description: '', technologies: '' }]})}>+ Añadir Proyecto</Button>
                       </div>
                      )}
                      {currentStep === 9 && (
                          <div className="space-y-6">
                              <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Resumen Ejecutivo</h3>
                                  <textarea className="w-full text-base text-slate-700 bg-white border border-slate-200 rounded-lg p-4 h-64 outline-none resize-none" value={profile.summary} onChange={(e) => setProfile({...profile, summary: e.target.value})} placeholder="Resumen..." />
                                  <button onClick={() => openJanice(profile.summary, `Resumen Profesional`, (txt) => setProfile({...profile, summary: txt}))} className="absolute bottom-4 right-4 text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-md flex items-center gap-2"><Sparkles className="w-4 h-4" /> Janice: Mejorar Redacción</button>
                              </div>
                          </div>
                      )}
                      {currentStep === 10 && (
                          <div className="space-y-6">
                              <div className="bg-slate-800 text-white p-4 rounded-lg flex items-center gap-3">
                                  <ShieldAlert className="w-6 h-6 text-yellow-400" /><div className="text-sm"><p className="font-bold">Revisión Final</p><p className="opacity-80">Datos vacíos serán eliminados al finalizar.</p></div>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                      <div><h3 className="font-bold text-slate-800 text-lg">{profile.experience[0]?.role || "Profesional"}</h3><p className="text-xs text-slate-500">Vista Previa</p></div>
                                  </div>
                                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto text-sm">
                                      <section><h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Resumen</h4><p className="text-slate-600 leading-relaxed">{profile.summary || "Vacío"}</p></section>
                                      <section><h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Experiencia ({profile.experience.length})</h4>{profile.experience.map((e, i) => (<div key={i} className="mb-3 pl-2 border-l-2 border-slate-100"><div className="font-bold text-slate-700">{e.role} @ {e.company}</div><div className="text-xs text-slate-400 mb-1">{e.period}</div><p className="text-slate-500 truncate">{e.description}</p></div>))}</section>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </main>
              <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 shadow-sm">
                  <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
                      <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
                      <Button onClick={handleNext} className="bg-slate-800 hover:bg-slate-900 text-white px-6 md:px-8">{currentStep === 10 ? <>Finalizar <ArrowRight className="w-4 h-4 ml-2" /></> : <>Siguiente <ChevronRight className="w-4 h-4 ml-2" /></>}</Button>
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
                  return (<div className="space-y-8 p-6">{profile.experience.map((role, roleIdx) => (<div key={roleIdx} className="flex gap-4"><div className="flex flex-col items-center shrink-0"><CompanyLogo name={role.company} className="w-12 h-12 bg-white" /></div><div className="flex-1 pb-8 border-b border-slate-100 last:border-0"><h3 className="text-lg font-bold text-slate-900">{role.role}</h3><p className="text-blue-600 font-medium">{role.company}</p><div className="text-sm text-slate-400 mb-3">{role.period}</div><div className="text-sm text-slate-600"><MarkdownView content={role.description} /></div></div></div>))}</div>);
              case 'education':
                  return (<div className="space-y-4 p-6">{profile.education.map((edu, i) => (<div key={i} className="bg-white border border-slate-200 p-6 rounded-lg flex items-center gap-4"><CompanyLogo name={edu.institution} className="w-16 h-16" /><div><h4 className="font-bold text-slate-800 text-lg">{edu.title}</h4><p className="text-base text-slate-600">{edu.institution}</p><p className="text-sm text-slate-400 mt-1">{edu.period}</p></div></div>))}</div>);
              case 'projects':
                  return (<div className="grid grid-cols-1 gap-4 p-6">{profile.projects.map((proj, i) => (<div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm"><h4 className="font-bold text-slate-800 text-lg mb-2">{proj.name}</h4><p className="text-sm text-slate-600 mb-4">{proj.description}</p><div className="flex flex-wrap gap-2">{proj.technologies.split(',').map((tech, t) => (<span key={t} className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{tech.trim()}</span>))}</div></div>))}</div>);
              case 'skills':
                  return (<div className="p-6"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Competencias</h4><div className="flex flex-wrap gap-2 mb-8">{profile.skills.map((s, i) => (<span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">{s}</span>))}</div></div>);
          }
      };
      return (
          <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50 font-sans">
                  <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={() => setAppState(AppState.WIZARD)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"><Bot className="w-6 h-6" /></div><div><h3 className="font-bold text-slate-800 text-sm">Donna</h3><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-[10px] text-slate-400">Online</span></div></div></div></div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">{donnaChat.map((msg) => (<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}><MarkdownView content={msg.text} /><div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div>))}{donnaLoading && (<div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl p-4 flex space-x-1"><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div></div></div>)}<div ref={chatEndRef} /></div>
                      <div className="p-4 border-t border-slate-200 bg-white"><form onSubmit={handleDonnaSend} className="relative"><input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-12 text-sm outline-none" placeholder="Escribe..." value={donnaInput} onChange={(e) => setDonnaInput(e.target.value)} /><button type="submit" disabled={!donnaInput.trim() || donnaLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-600 rounded text-white disabled:bg-slate-300"><Send className="w-4 h-4" /></button></form></div>
                  </div>
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                      <div className="bg-white border-b border-slate-200 p-6 md:p-10 shrink-0 shadow-sm z-10"><h1 className="text-3xl font-extrabold text-slate-900">{profile.experience[0]?.role || "Candidato"}.</h1><p className="text-slate-500 mt-2">{profile.summary}</p><div className="flex gap-2 overflow-x-auto mt-6 no-scrollbar">{['experience', 'education', 'projects', 'skills'].map((tab) => (<button key={tab} onClick={() => setDonnaActiveTab(tab as any)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${donnaActiveTab === tab ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>))}</div></div>
                      <div className="flex-1 overflow-y-auto scrollbar-thin"><div className="max-w-4xl mx-auto"><ActiveTabContent /></div></div>
                  </div>
          </div>
      );
  };

  return (<>{(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && renderRotenmeir()}{appState === AppState.WIZARD && renderGooglitoStep()}{appState === AppState.DONNA && renderDonna()}</>);
}

export default App;