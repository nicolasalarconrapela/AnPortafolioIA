import React, { useState } from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
import GRETCHEN_AVATAR from '../../assets/ai/gretchen_avatar';

export const SectionHeader = ({
  title,
  description,
  icon,
  aiName,
  aiAvatar,
  onGretchenClick
}: {
  title: string,
  description: string,
  icon: React.ReactElement,
  aiName: string,
  aiAvatar?: string,
  onGretchenClick: () => void
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="mb-8 group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 shrink-0">
            {React.cloneElement(icon, { size: 24 })}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {aiAvatar && (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 ml-1">
                  <img src={aiAvatar} alt={aiName} className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{aiName} Active</span>
            </div>
          </div>
        </div>

        <button
          onClick={onGretchenClick}
          className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all shadow-sm group/badge self-end sm:self-auto"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
            {!imgError ? (
              <img
                src={GRETCHEN_AVATAR}
                alt="Gretchen"
                className="w-full h-full object-cover grayscale group-hover/badge:grayscale-0 transition-all"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ShieldAlert size={18} />
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Auditoría</p>
            <p className="text-xs font-bold text-slate-900 group-hover/badge:text-red-600 transition-colors">Gretchen Bodinski</p>
          </div>
        </button>
      </div>
      <p className="text-slate-500 text-sm md:text-base leading-relaxed border-l-2 border-slate-200 pl-4 py-1 italic md:not-italic">
        {description}
      </p>
    </div>
  );
};
