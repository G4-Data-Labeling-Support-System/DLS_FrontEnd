import React from 'react';
import { themeClasses } from '@/styles/themeClasses';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return themeClasses.buttons.primary;
      case 'secondary':
        return themeClasses.buttons.secondary;
      case 'ghost':
        return themeClasses.buttons.ghost;
      case 'danger':
        return 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all duration-300';
      default:
        return themeClasses.buttons.primary;
    }
  };

  const getSizeClasses = () => {
    // Note: themeClasses already include px-4 py-2 for md size
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'md':
      default:
        return '';
    }
  };

  const baseClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  return (
    <button
      disabled={isLoading || disabled}
      className={`
        ${baseClasses}
        ${sizeClasses}
        ${isLoading ? 'opacity-80 cursor-wait' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')} // Basic whitespace cleanup
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
