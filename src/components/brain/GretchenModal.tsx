
import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, X, Wrench, Sparkles } from 'lucide-react';
import { createGeminiService, GeminiService } from '../../services/geminiService';
import { MarkdownView } from './MarkdownView';
import { Button } from './Button';
import GRETCHEN_AVATAR from '../../assets/ai/gretchen_avatar.dataimage?raw';

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

    const geminiServiceRef = useRef<GeminiService | null>(null);

    useEffect(() => {
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
        if (!geminiServiceRef.current) return;
        setStep('AUDITING');
        let critique = "";
        try {
            critique = await geminiServiceRef.current.auditSection(sectionName, sectionData);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-[var(--md-sys-color-background)] rounded-[28px] shadow-elevation-3 w-full max-w-3xl overflow-hidden animate-fade-scale border border-outline-variant/30 flex flex-col max-h-[90vh]">

                {/* Header Dinámico */}
                <div className={`p-6 flex justify-between items-center text-white transition-colors duration-500 shrink-0 ${step === 'FIXING' || step === 'REVIEW' ? 'bg-primary' : 'bg-error-container text-error-onContainer'}`}>
                    <div className="flex items-center space-x-4 overflow-hidden">
                        <div className={`p-3 rounded-full shrink-0 bg-white/20 backdrop-blur-sm`}>
                            {step === 'AUDITING' ? <ShieldAlert className="w-6 h-6 animate-pulse" /> :
                                step === 'FIXING' ? <Wrench className="w-6 h-6 animate-spin" /> :
                                    <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-display font-medium text-xl tracking-tight truncate">
                                {step === 'AUDITING' && "Gretchen: Auditando..."}
                                {step === 'FIXING' && "Googlito: Corrigiendo..."}
                                {step === 'REVIEW' && "Reporte Completado"}
                            </h3>
                            <p className="text-xs opacity-80 uppercase tracking-widest truncate hidden md:block mt-1">
                                {step === 'AUDITING' ? "Detectando incompetencias" : step === 'FIXING' ? "Resolviendo problemas detectados" : "Revisión Final"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-black/10 p-2 rounded-full transition-colors shrink-0"><X className="w-6 h-6" /></button>
                </div>

                {/* Body Scrollable */}
                <div className="p-0 overflow-y-auto flex-1 bg-surface-variant/10 relative">
                    {step === 'AUDITING' && (
                        <div className="flex flex-col items-center justify-center h-80 p-8 text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-surface-variant border-t-error rounded-full animate-spin"></div>
                                <div className="absolute inset-2 rounded-full overflow-hidden bg-surface-variant">
                                    <img src={GRETCHEN_AVATAR} className="w-full h-full object-cover" alt="Gretchen Auditando" />
                                </div>
                            </div>
                            <p className="text-outline font-medium text-lg animate-pulse">"Déjame ver qué desastre has hecho aquí..."</p>
                        </div>
                    )}

                    {(step === 'FIXING' || (step === 'REVIEW' && auditResult)) && (
                        <div className="p-6 md:p-8 border-b border-outline-variant/20 bg-[var(--md-sys-color-background)]">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="flex items-center gap-4 md:block text-center shrink-0">
                                    <div className="w-14 h-14 rounded-full border-2 border-error/30 overflow-hidden mx-auto shadow-elevation-1 group-hover:scale-105 transition-transform">
                                        <img src={GRETCHEN_AVATAR} className="w-full h-full object-cover" alt="Gretchen Bodinski" />
                                    </div>
                                    <h4 className="font-bold text-error text-xs uppercase tracking-wide mt-2">Gretchen</h4>
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                    <div className="prose prose-sm prose-red max-w-none text-[var(--md-sys-color-on-background)] bg-error-container/10 p-6 rounded-2xl border border-error/20 leading-relaxed">
                                        <MarkdownView content={auditResult} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'FIXING' && (
                        <div className="flex items-center justify-center gap-3 p-8 bg-primary-container/20 animate-pulse border-t border-outline-variant/20">
                            <Wrench className="w-5 h-5 text-primary" />
                            <span className="text-primary font-medium text-sm">El Googlito está reescribiendo la sección...</span>
                        </div>
                    )}

                    {step === 'REVIEW' && fixedData && (
                        <div className="p-6 md:p-8 bg-surface-variant/30">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="hidden md:flex w-14 h-14 rounded-full bg-primary-container items-center justify-center text-primary-onContainer shadow-sm shrink-0">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="md:hidden w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary-onContainer">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-primary text-sm uppercase tracking-wide">Propuesta del Googlito</h4>
                                    </div>
                                    <div className="bg-[var(--md-sys-color-background)] p-6 rounded-2xl border border-outline-variant shadow-sm text-xs md:text-sm text-outline font-mono overflow-x-auto max-h-80">
                                        <pre>{JSON.stringify(fixedData, null, 2)}</pre>
                                    </div>
                                    <p className="text-xs text-primary mt-3 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        Estos cambios reemplazarán los datos actuales.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'REVIEW' && (
                    <div className="p-6 bg-[var(--md-sys-color-background)] border-t border-outline-variant/20 flex flex-col-reverse md:flex-row justify-end gap-4 shrink-0">
                        <Button variant="ghost" onClick={onClose} className="w-full md:w-auto">Cancelar</Button>
                        <Button
                            className="w-full md:w-auto shadow-elevation-1"
                            variant="primary"
                            onClick={() => {
                                onApplyFix(fixedData);
                                onClose();
                            }}
                            icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                            Aplicar Correcciones
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
