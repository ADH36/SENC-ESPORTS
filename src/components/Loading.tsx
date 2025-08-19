import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function Loading({ size = 'md', text, className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-400 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Inline loading component for buttons
export function ButtonLoading({ className = '' }: { className?: string }) {
  return (
    <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
  );
}

// Full page loading component
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Loading size="lg" text={text} />
    </div>
  );
}