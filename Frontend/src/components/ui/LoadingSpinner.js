import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  color = 'primary',
  text,
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    medical: 'text-medical-600'
  };

  const Spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      fullScreen && "min-h-screen",
      className
    )}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className={cn(
          "text-sm font-medium",
          colorClasses[color] === 'text-white' ? 'text-white' : 'text-muted-foreground'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {Spinner}
      </div>
    );
  }

  return Spinner;
};


export default LoadingSpinner;
