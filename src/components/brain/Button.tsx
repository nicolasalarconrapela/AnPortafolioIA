
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = '', 
  disabled,
  ...props 
}) => {
  // MD3 Base styles: Rounded-full for actions, proper height, font weight
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-elevation-1 hover:shadow-elevation-2 focus-visible:ring-primary",
    secondary: "bg-secondary-container text-secondary-onContainer hover:bg-opacity-80 focus-visible:ring-secondary",
    outline: "border border-outline text-primary bg-transparent hover:bg-primary/5 focus-visible:ring-primary",
    ghost: "text-[var(--md-sys-color-on-background)] hover:bg-surface-variant/50 focus-visible:ring-outline",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
