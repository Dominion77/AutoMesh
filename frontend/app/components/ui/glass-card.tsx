import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-effect rounded-3xl p-6 transition-all duration-500',
        hoverable && 'hover:bg-white/20 hover:shadow-glow hover-lift',
        'before:absolute before:inset-0 before:rounded-3xl before:bg-linear-to-br before:from-white/10 before:to-transparent before:-z-10',
        className
      )}
    >
      {children}
    </div>
  );
}