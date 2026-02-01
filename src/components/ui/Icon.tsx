import React from 'react';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  filled?: boolean;
}

const sizeMap = {
  sm: 'text-sm',   // 14px
  md: 'text-base', // 16px
  lg: 'text-xl',   // 20px
  xl: 'text-2xl',  // 24px
};

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className = '', filled = false }) => {
  const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
  const style = typeof size === 'number' ? { fontSize: size } : undefined;
  
  return (
    <span 
      className={`material-symbols-outlined select-none ${sizeClass} ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};