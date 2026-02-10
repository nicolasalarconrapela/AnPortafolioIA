import React, { useMemo } from 'react';
import { FileText, X, File, Image as ImageIcon, FileJson } from 'lucide-react';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    fileDataUrl: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, fileDataUrl }) => {
    
    const content = useMemo(() => {
        if (!fileDataUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-outline p-6 text-center">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">No hay documento original disponible.</p>
                </div>
            );
        }

        // Detect mime type from Data URL header
        const match = fileDataUrl.match(/^data:(.*?);base64,/);
        const mimeType = match ? match[1] : '';

        // PDF Handling
        if (mimeType === 'application/pdf') {
             return (
                <iframe 
                    src={fileDataUrl} 
                    className="w-full h-full border-none"
                    title="Document Viewer"
                />
            );
        }
        
        // Image Handling
        if (mimeType.startsWith('image/')) {
             return (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 overflow-auto p-4">
                    <img src={fileDataUrl} alt="Document" className="max-w-full max-h-full object-contain shadow-md" />
                </div>
             );
        }

        // Text/JSON Handling
        if (mimeType === 'application/json' || mimeType.startsWith('text/')) {
             try {
                const base64 = fileDataUrl.split(',')[1];
                // Handle unicode in base64 decode for UTF-8 text
                const text = decodeURIComponent(escape(atob(base64)));
                
                let displayText = text;
                let isJson = false;

                if (mimeType.includes('json') || (text.trim().startsWith('{') && text.trim().endsWith('}'))) {
                    try {
                        const json = JSON.parse(text);
                        displayText = JSON.stringify(json, null, 2);
                        isJson = true;
                    } catch {}
                }

                return (
                    <div className="w-full h-full flex flex-col bg-[#1e1e1e]">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 text-[10px] md:text-xs text-slate-400 bg-white/5">
                            {isJson ? <FileJson size={14} /> : <FileText size={14} />}
                            <span>{isJson ? 'JSON View' : 'Text View'}</span>
                        </div>
                        <div className="flex-1 overflow-auto p-4 md:p-6 text-slate-300 font-mono text-[10px] md:text-xs">
                            <pre className="whitespace-pre-wrap break-words">{displayText}</pre>
                        </div>
                    </div>
                );
             } catch (e) {
                 return (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                         <p className="text-error font-medium text-sm">Error al decodificar el archivo de texto.</p>
                    </div>
                 );
             }
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-outline p-6 text-center bg-slate-50">
                 <File size={48} className="mb-4 opacity-50" />
                 <p className="mb-2 font-medium text-sm">Vista previa no disponible</p>
                 <p className="text-[10px] text-slate-400">Tipo de archivo: {mimeType || 'Desconocido'}</p>
            </div>
        );

    }, [fileDataUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 lg:relative lg:inset-auto z-[60] lg:z-20 w-full lg:w-[400px] xl:lg:w-[500px] lg:border-l border-outline-variant/30 bg-white flex flex-col shadow-2xl lg:shadow-xl transition-all duration-300 h-full lg:h-[calc(100vh-65px)] lg:sticky lg:top-[65px] animate-fade-in lg:animate-none">
            {/* Simple Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-variant/20 shrink-0">
                <div className="flex items-center gap-2 text-primary font-bold text-xs md:text-sm uppercase tracking-wide">
                    <FileText size={16} />
                    <span>Documento Original</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-outline hover:text-error transition-colors p-2 lg:p-1 rounded-full hover:bg-slate-100 flex items-center justify-center"
                    title="Cerrar panel"
                >
                    <X size={20} className="lg:w-[18px] lg:h-[18px]" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
                {content}
            </div>
            
            {/* Mobile Footer action to close */}
            <div className="lg:hidden p-4 border-t border-outline-variant/20 bg-white">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                    Volver a la Edición
                </button>
            </div>
        </div>
    );
};