import React from 'react';

type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: "bg-[var(--md-sys-color-background)] shadow-elevation-1 border border-transparent",
  filled: "bg-surface-variant border-transparent",
  outlined: "bg-transparent border border-outline-variant"
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8"
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'elevated', 
  padding = 'md',
  className = '', 
  onClick,
  hoverable = false
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  const isInteractive = !!onClick;

  return (
    <div 
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={`
        rounded-[24px] 
        ${variantStyles[variant]} 
        ${paddingStyles[padding]}
        ${(hoverable || isInteractive) ? 'hover:shadow-elevation-2 cursor-pointer transition-shadow duration-200' : ''}
        ${isInteractive ? 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};