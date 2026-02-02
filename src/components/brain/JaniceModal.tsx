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
