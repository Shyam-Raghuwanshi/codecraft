import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

/**
 * Reusable loading spinner component with animations
 * Supports multiple sizes and optional loading message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]}
          border-solid border-gray-200 border-t-blue-600
          rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className={`
          mt-3 text-gray-600 font-medium
          ${textSizeClasses[size]}
        `}>
          {message}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Alternative dots animation for variety
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

// Inline spinner for buttons or small spaces
export const InlineSpinner: React.FC<{ size?: number }> = ({ size = 16 }) => {
  return (
    <svg 
      className="animate-spin text-current" 
      width={size} 
      height={size} 
      fill="none" 
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export default LoadingSpinner;