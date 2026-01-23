import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  ...props
}: AnimatedButtonProps) {
  const baseStyles = 'relative overflow-hidden rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lilac-500 focus:ring-offset-2';

  const variants = {
    primary: 'bg-gradient-to-r from-lilac-500 to-blue-500 text-white hover:from-lilac-600 hover:to-blue-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-white/20 text-gray-800 border border-white/30 hover:bg-white/30 backdrop-blur-sm',
    ghost: 'text-lilac-600 hover:text-lilac-700 hover:bg-lilac-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['0%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}