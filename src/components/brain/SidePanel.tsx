
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
                    <p>No hay documento original disponible.</p>
                </div>
            );
        }

        // Detect mime type from Data URL header
        // Format: data:mime/type;base64,.....
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
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 text-xs text-slate-400 bg-white/5">
                            {isJson ? <FileJson size={14} /> : <FileText size={14} />}
                            <span>{isJson ? 'JSON View' : 'Text View'}</span>
                        </div>
                        <div className="flex-1 overflow-auto p-6 text-slate-300 font-mono text-xs">
                            <pre className="whitespace-pre-wrap break-words">{displayText}</pre>
                        </div>
                    </div>
                );
             } catch (e) {
                 return (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                         <p className="text-error font-medium">Error al decodificar el archivo de texto.</p>
                    </div>
                 );
             }
        }

        // Fallback for others (might trigger download or show empty)
        return (
            <div className="flex flex-col items-center justify-center h-full text-outline p-6 text-center bg-slate-50">
                 <File size={48} className="mb-4 opacity-50" />
                 <p className="mb-2 font-medium">Vista previa no disponible</p>
                 <p className="text-xs text-slate-400">Tipo de archivo: {mimeType || 'Desconocido'}</p>
            </div>
        );

    }, [fileDataUrl]);

    if (!isOpen) return null;

    return (
        <div className="w-[400px] xl:w-[500px] border-l border-outline-variant/30 bg-white flex flex-col shadow-xl z-20 transition-all duration-300 h-[calc(100vh-65px)] sticky top-[65px]">
            {/* Simple Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-variant/20">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                    <FileText size={16} />
                    <span>Visor de Documentos</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-outline hover:text-error transition-colors p-1 rounded-full hover:bg-slate-100"
                    title="Cerrar panel"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
                {content}
            </div>
        </div>
    );
};
