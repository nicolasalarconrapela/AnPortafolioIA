import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, X, Wrench, Sparkles } from 'lucide-react';
import { createGretchenService, GretchenService } from '../services/gretchenService';
import { createGeminiService, GeminiService } from '../services/geminiService';
import { MarkdownView } from './MarkdownView';
import { Button } from './Button';

export const GretchenModal = ({
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
