import React from 'react';
import { Icon } from './Icon';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  endIcon?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden state-layer select-none active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  filled: "bg-primary text-white hover:bg-primary-hover shadow-elevation-1 hover:shadow-elevation-2 active:shadow-none",
  tonal: "bg-secondary-container text-secondary-onContainer hover:bg-secondary-container/80 active:bg-secondary-container/70",
  outlined: "border border-outline text-primary hover:bg-surface-variant hover:border-primary active:bg-primary/10",
  text: "text-primary hover:bg-primary/10 active:bg-primary/20",
  danger: "bg-error text-white hover:bg-error/90 shadow-elevation-1"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-full gap-1.5",
  md: "h-10 px-5 text-sm rounded-full gap-2",
  lg: "h-12 px-7 text-base rounded-full gap-2.5"
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'filled', 
  size = 'md', 
  icon, 
  endIcon, 
  loading = false, 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-1" />
      )}
      
      {!loading && icon && <Icon name={icon} size={size === 'lg' ? 'md' : 'sm'} />}
      
      <span>{children}</span>
      
      {!loading && endIcon && <Icon name={endIcon} size={size === 'lg' ? 'md' : 'sm'} />}
    </button>
  );
};