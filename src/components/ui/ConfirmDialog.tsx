import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: 'bg-red-500/10 text-red-500',
      button: 'bg-red-600 hover:bg-red-500 text-white',
    },
    warning: {
      icon: 'bg-yellow-500/10 text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-500 text-black',
    },
    info: {
      icon: 'bg-blue-500/10 text-blue-500',
      button: 'bg-mod-primary hover:bg-mod-accent text-black',
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${variantStyles[variant].icon}`}>
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
              <p className="text-sm text-gray-400">{message}</p>
            </div>

            <div className="flex border-t border-gray-800">
              <button
                onClick={onCancel}
                className="flex-1 py-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-4 text-sm font-bold transition-colors border-l border-gray-800 ${variantStyles[variant].button}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
