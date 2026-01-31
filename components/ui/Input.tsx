import React, { forwardRef } from 'react';
import { Icon } from './Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  startIcon?: string;
  endIcon?: string;
  onEndIconClick?: () => void;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  startIcon, 
  endIcon, 
  onEndIconClick,
  className = '', 
  containerClassName = '',
  id,
  ...props 
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const hasStartIcon = !!startIcon;

  return (
    <div className={`relative group ${containerClassName} ${error ? 'animate-shake' : ''}`}>
      {/* Start Icon */}
      {startIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none z-10" aria-hidden="true">
          <Icon name={startIcon} size="md" />
        </div>
      )}

      {/* Input Field 
          UX Improvement: text-base on mobile prevents iOS zoom. text-sm on desktop increases information density.
          Accessibility: Using focus-visible ring instead of just border color for better visibility.
      */}
      <input
        ref={ref}
        id={inputId}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          peer w-full h-14 bg-surface rounded-[4px] border border-outline 
          text-[var(--md-sys-color-on-background)] placeholder-transparent 
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          disabled:bg-surface-variant/50 disabled:text-outline
          transition-all pt-4 pb-1 px-4 text-base md:text-sm
          ${hasStartIcon ? 'pl-11' : ''}
          ${error ? 'border-error focus:border-error focus:ring-error text-error' : ''}
          ${className}
        `}
        {...props}
      />

      {/* Floating Label */}
      <label
        htmlFor={inputId}
        className={`
          absolute top-2 text-xs text-outline transition-all 
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base 
          peer-focus:top-2 peer-focus:text-xs pointer-events-none
          ${hasStartIcon ? 'left-11 peer-placeholder-shown:left-11' : 'left-4'}
          ${error ? 'text-error peer-focus:text-error' : 'peer-focus:text-primary'}
        `}
      >
        {label}
      </label>

      {/* End Icon / Action */}
      {endIcon && (
        <button
          type="button"
          onClick={onEndIconClick}
          aria-label={onEndIconClick ? "Toggle action" : undefined}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!onEndIconClick ? 'pointer-events-none' : 'cursor-pointer'}`}
          tabIndex={onEndIconClick ? 0 : -1}
        >
          <Icon name={endIcon} size="md" />
        </button>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error mt-1 ml-4 flex items-center gap-1 animate-fade-in">
          <Icon name="error" size={12} filled />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';