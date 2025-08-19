import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}: CardProps) {
  const baseClasses = 'bg-gray-800 border border-gray-700 rounded-lg';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover:bg-gray-750 hover:border-gray-600 transition-colors cursor-pointer' : '';
  
  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}

// Card Header component
export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-gray-700 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

// Card Title component
export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

// Card Content component
export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-gray-300 ${className}`}>
      {children}
    </div>
  );
}

// Card Footer component
export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-t border-gray-700 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}