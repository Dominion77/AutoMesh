import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'lilac' | 'blue' | 'rainbow';
}

export function GradientText({ children, className, variant = 'lilac' }: GradientTextProps) {
  const gradients = {
    lilac: 'bg-gradient-to-r from-lilac-500 to-blue-500',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    rainbow: 'bg-gradient-to-r from-lilac-500 via-blue-500 to-cyan-500',
  };

  return (
    <span className={cn(
      gradients[variant],
      'bg-clip-text text-transparent',
      className
    )}>
      {children}
    </span>
  );
}