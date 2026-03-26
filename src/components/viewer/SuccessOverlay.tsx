import { Heart, MessageCircleWarning } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface SuccessOverlayProps {
  isOpen: boolean;
  variant: 'success' | 'rejection';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export default function SuccessOverlay({
  isOpen,
  variant,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
}: SuccessOverlayProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close response overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
            className="absolute inset-0 bg-[#2f2c28]/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center justify-center rounded-[32px] border border-[#f3c583]/60 bg-white/95 p-6 text-center shadow-2xl sm:p-8"
          >
            <motion.div
              animate={{
                scale: variant === 'success' ? [1, 1.12, 1] : [1, 1.04, 1],
                rotate: variant === 'success' ? [0, 8, -8, 0] : [0, -4, 4, 0],
              }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className={`mb-5 ${variant === 'success' ? 'text-[#e99497]' : 'text-[#d3872e]'}`}
            >
              {variant === 'success' ? (
                <Heart size={78} fill="currentColor" />
              ) : (
                <MessageCircleWarning size={72} />
              )}
            </motion.div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c86d75]">
              {title}
            </p>
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-[#2f2c28] sm:text-3xl">
              {message}
            </h2>

            {actionLabel && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="rounded-2xl bg-[#fff4dd] px-6 py-3 font-semibold text-[#c86d75] transition-all hover:bg-[#ffeec9]"
              >
                {actionLabel}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
