import React from 'react';
import { User, Upload, FileArchive } from 'lucide-react';
import { AppState } from '../types';

interface RotenmeirViewProps {
    appState: AppState;
    error: string | null;
    isDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RotenmeirView: React.FC<RotenmeirViewProps> = ({
    appState,
    error,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileUpload
}) => {
    return (
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
                            <div className="relative w-full group" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                                <div className={`flex flex-col items-center justify-center gap-2 py-8 px-6 transition-all transform border-2 border-dashed rounded-lg cursor-pointer ${isDragging ? 'bg-red-800 border-red-400 scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-slate-800 border-slate-600 hover:bg-slate-750 hover:border-red-500/50'}`}>
                                    <div className={`p-4 rounded-full transition-all ${isDragging ? 'bg-red-600 animate-bounce' : 'bg-red-900 text-red-200'}`}><Upload className="w-8 h-8" /></div>
                                    <div className="text-center space-y-1">
                                        <p className="text-lg font-bold text-slate-200">{isDragging ? '¡SUÉLTALO AHORA!' : 'Entregar Documentación'}</p>
                                        <p className="text-xs text-slate-400 font-mono">Clic o arrastra PDF, JSON, ZIP</p>
                                    </div>
                                </div>
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept=".pdf,.json,.txt,.zip,.jpg,.jpeg,.png,application/pdf,application/json,text/plain,text/json,application/zip,application/x-zip-compressed,image/*" onChange={onFileUpload} />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4"><FileArchive className="w-4 h-4"/><span>Soporta ZIP (LinkedIn Data) y JSON</span></div>
                        </div>
                    )}
                    {error && <p className="mt-4 text-red-400 text-sm bg-red-900/20 p-2 border border-red-900">{error}</p>}
                </div>
            </div>
        </div>
    );
};
