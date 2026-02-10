import React from 'react';
import { Search, FileQuestion } from 'lucide-react';

export const EmptyState = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-white/40 rounded-[32px] border-2 border-dashed border-slate-200 text-center animate-fade-in transition-all">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
            <FileQuestion size={32} strokeWidth={1.5} />
        </div>
        <p className="text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
            {text}
        </p>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">
            Ingreso manual requerido
        </p>
    </div>
);
