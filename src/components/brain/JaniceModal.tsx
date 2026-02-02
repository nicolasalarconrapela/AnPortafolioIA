
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { createGeminiService } from '../../services/geminiService';

export const JaniceModal = ({ 
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[var(--md-sys-color-background)] rounded-[28px] shadow-elevation-3 w-full max-w-lg overflow-hidden border border-outline-variant/30 max-h-[90vh] flex flex-col animate-fade-scale">
                <div className="bg-tertiary-container text-tertiary-onContainer p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-display font-medium text-lg">Hola, soy Janice</h3>
                            <p className="text-xs opacity-80">Asistente de Redacción IA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-black/10 p-2 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block">Texto Original</label>
                        <div className="text-sm text-[var(--md-sys-color-on-background)] bg-surface-variant/30 p-4 rounded-xl max-h-32 overflow-y-auto italic border border-outline-variant/50">
                            "{initialText || 'Vacío'}"
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block">¿Qué necesitas?</label>
                        <div className="flex flex-col gap-3">
                            <input 
                                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-sm focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="Ej: Hazlo más ejecutivo, corrige ortografía..."
                            />
                            <Button 
                                onClick={handleAskJanice} 
                                disabled={isLoading || !initialText} 
                                className="w-full bg-tertiary text-white hover:bg-tertiary/90"
                                icon={isLoading ? undefined : <Sparkles size={16} />}
                            >
                                {isLoading ? 'Pensando...' : 'Mejorar Texto'}
                            </Button>
                        </div>
                    </div>

                    {result && (
                        <div className="animate-fade-in pt-4 border-t border-outline-variant/30">
                            <label className="text-xs font-bold text-green-600 uppercase flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4"/> Sugerencia de Janice
                            </label>
                            <textarea 
                                className="w-full p-4 text-sm text-[var(--md-sys-color-on-background)] bg-green-50/50 border border-green-200 rounded-xl focus:outline-none focus:border-green-400 h-32 resize-none"
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end gap-3">
                                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                                <Button onClick={() => { onApply(result); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white">
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
