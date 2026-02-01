import React from 'react';
import { FloatingNodeProps } from '../types';

export const FloatingNode: React.FC<FloatingNodeProps> = ({ 
  title, 
  subtitle, 
  detail, 
  icon, 
  position, 
  delay, 
  align = 'left',
  type,
  tags 
}) => {
  const isRight = align === 'right';
  const borderColor = type === 'cyan' ? 'border-cyan-400' : 'border-indigo-400';
  const textColor = type === 'cyan' ? 'text-cyan-400' : 'text-indigo-400';
  const glowColor = type === 'cyan' ? 'cyan' : 'indigo';
  
  // Tailwind doesn't allow dynamic class interpolation for some values efficiently without safelisting
  // Using style for positioning to allow arbitrary values
  // We'll trust the parent to pass valid tailwind classes for position or style overrides
  
  return (
    <div className={`hidden md:block absolute z-30 animate-float ${position}`} style={{ animationDelay: delay }}>
      <div className={`glass-node p-4 rounded-xl w-64 ${isRight ? 'border-r-2 text-right' : 'border-l-2 text-left'} ${borderColor} relative group transition-all duration-300 hover:scale-105 cursor-default hover:shadow-[0_0_30px_rgba(${type==='cyan'?'34,211,238':'99,102,241'},0.15)]`}>
        <div className={`flex items-center gap-2 mb-2 ${isRight ? 'justify-end' : ''}`}>
          {!isRight && <span className={`material-symbols-outlined ${textColor} text-lg`}>{icon}</span>}
          <h3 className={`${textColor} font-bold text-xs tracking-wider uppercase`}>{title}</h3>
          {isRight && <span className={`material-symbols-outlined ${textColor} text-lg`}>{icon}</span>}
        </div>
        
        {tags ? (
          <div className={`flex flex-wrap gap-2 ${isRight ? 'justify-end' : ''}`}>
            {tags.map((tag, i) => (
              <span key={i} className={`px-2 py-0.5 bg-${glowColor}-500/20 rounded text-[10px] text-${glowColor}-200 border border-${glowColor}-500/20`}>
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <>
            <p className="text-slate-200 text-sm font-medium">{subtitle}</p>
            <p className="text-slate-400 text-xs mt-1">{detail}</p>
          </>
        )}

        {/* Decorative Lines */}
        <div className={`absolute top-1/2 ${isRight ? 'left-[-80px] bg-gradient-to-l' : 'right-[-80px] bg-gradient-to-r'} w-[80px] h-[1px] from-${glowColor}-400/30 to-transparent`}></div>
        <div className={`absolute top-1/2 ${isRight ? 'left-[-84px]' : 'right-[-84px]'} w-1.5 h-1.5 bg-${glowColor}-400 rounded-full shadow-[0_0_8px_${glowColor}]`}></div>
      </div>
    </div>
  );
};