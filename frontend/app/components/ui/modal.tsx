'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  preventClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  preventClose = false,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={preventClose ? undefined : onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative w-full rounded-3xl bg-linear-to-b from-white/90 to-white/70 backdrop-blur-2xl shadow-2xl border border-white/30',
                sizeClasses[size]
              )}
            >
              {!preventClose && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 rounded-full p-2 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {title && (
                <div className="border-b border-white/20 px-6 py-4">
                  <h2 className="text-2xl font-bold text-gradient">{title}</h2>
                </div>
              )}

              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {children}
              </div>

              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-lilac-500 to-blue-500 rounded-t-3xl" />
              <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-lilac-500/50" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-blue-500/50" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="text-center">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
            variant === 'danger' 
              ? 'bg-linear-to-br from-red-500 to-orange-500' 
              : 'bg-linear-to-br from-purple-500 to-blue-500'
          )}>
            {variant === 'danger' ? (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl text-white transition-colors',
                variant === 'danger'
                  ? 'bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                  : 'bg-linear-to-r from-lilac-500 to-blue-500 hover:from-lilac-600 hover:to-blue-600'
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}