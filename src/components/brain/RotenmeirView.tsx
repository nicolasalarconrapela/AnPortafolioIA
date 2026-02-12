
import React from 'react';
import { User, Upload, FileArchive, FileText, CheckCircle } from 'lucide-react';
import { AppState } from '../../types_brain';
import ROTENMEIR_AVATAR from '../../assets/ai/rotenmeir_avatar';

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
        <div className="min-h-screen bg-[var(--md-sys-color-background)] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in text-[var(--md-sys-color-on-background)]">

            <div className="max-w-2xl w-full relative z-10">

                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-variant mb-6 shadow-elevation-2 overflow-hidden border-2 border-outline-variant/30 group-hover:scale-105 transition-transform duration-500">
                        <img
                            src={ROTENMEIR_AVATAR}
                            alt="Señorita Rotenmeir"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl font-display font-normal mb-2 text-[var(--md-sys-color-on-background)]">
                        Señorita Rotenmeir
                    </h1>
                    <p className="text-sm font-medium tracking-widest text-primary uppercase">
                        Directora de Ingesta de Datos
                    </p>
                    <p className="mt-4 text-outline text-lg max-w-lg mx-auto font-light">
                        "Entrégueme sus documentos. Proceso PDF, JSON o archivos ZIP de LinkedIn con estricta precisión."
                    </p>
                </div>

                {/* Card Container */}
                <div className="bg-surface-variant/30 backdrop-blur-sm p-1 rounded-[32px] border border-outline-variant/50 shadow-elevation-1">
                    <div className="bg-[var(--md-sys-color-background)] rounded-[28px] p-8 md:p-12 text-center transition-all duration-300">

                        {appState === AppState.ANALYZING ? (
                            <div className="py-12 flex flex-col items-center">
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 border-4 border-surface-variant rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-2 rounded-full overflow-hidden bg-surface-variant">
                                        <img
                                            src={ROTENMEIR_AVATAR}
                                            alt="Analizando..."
                                            className="w-full h-full object-cover animate-pulse"
                                        />
                                    </div>
                                </div>
                                <h3 className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)]">Analizando Estructura</h3>
                                <p className="text-outline mt-2">Por favor espere, estamos auditando su información...</p>
                            </div>
                        ) : (
                            <div
                                className="group relative w-full"
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                            >
                                <div
                                    className={`
                                        flex flex-col items-center justify-center gap-4 py-16 px-6
                                        rounded-[20px] border-2 border-dashed transition-all duration-300
                                        ${isDragging
                                            ? 'bg-primary-container/30 border-primary scale-[1.01]'
                                            : 'bg-surface-variant/20 border-outline-variant hover:bg-surface-variant/40 hover:border-outline'
                                        }
                                    `}
                                >
                                    <div className={`p-4 rounded-full transition-all duration-300 ${isDragging ? 'bg-primary text-white scale-110' : 'bg-surface-variant text-primary'}`}>
                                        <Upload className="w-8 h-8" />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xl font-medium text-[var(--md-sys-color-on-background)]">
                                            {isDragging ? 'Suelte el archivo aquí' : 'Subir Documentación'}
                                        </p>
                                        <p className="text-sm text-outline">
                                            Arrastra o haz clic para seleccionar
                                        </p>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <Badge icon={<FileText className="w-3 h-3" />} label="PDF / JSON" />
                                        <Badge icon={<FileArchive className="w-3 h-3" />} label="ZIP (LinkedIn)" />
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.json,.txt,.zip,.jpg,.jpeg,.png,application/pdf,application/json,text/plain,text/json,application/zip,application/x-zip-compressed,image/*"
                                    onChange={onFileUpload}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-error-container text-error-onContainer rounded-xl flex items-center gap-3 text-left animate-shake">
                                <span className="material-symbols-outlined shrink-0">error</span>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-variant text-xs font-medium text-outline">
        {icon}
        {label}
    </span>
);
