import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SectionHeader = ({ 
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
