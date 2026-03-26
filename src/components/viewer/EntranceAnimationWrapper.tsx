import { motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Invitation } from '../../types';

interface EntranceAnimationWrapperProps {
  backgroundColor: string;
  variant: NonNullable<Invitation['entranceAnimation']>;
  children: ReactNode;
  onComplete?: () => void;
}

const ENTRANCE_DURATIONS: Record<NonNullable<Invitation['entranceAnimation']>, number> = {
  envelope: 1800,
  fadein: 1000,
  slideup: 800,
  cardflip: 1000,
  none: 0,
};

export default function EntranceAnimationWrapper({
  backgroundColor,
  variant,
  children,
  onComplete,
}: EntranceAnimationWrapperProps) {
  const [isComplete, setIsComplete] = useState(variant === 'none');
  const completedRef = useRef(false);

  useEffect(() => {
    if (variant === 'none') {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsComplete(true);

      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }, ENTRANCE_DURATIONS[variant]);

    return () => window.clearTimeout(timeoutId);
  }, [onComplete, variant]);

  if (isComplete) {
    return <>{children}</>;
  }

  if (variant === 'fadein') {
    return (
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === 'slideup') {
    return (
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === 'cardflip') {
    return (
      <div className="relative h-full w-full overflow-hidden" style={{ perspective: '1600px' }}>
        <div
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d', animation: 'funvitation-card-flip 1s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
        >
          <div
            className="absolute inset-0 rounded-[inherit] border border-white/25 bg-[linear-gradient(135deg,_rgba(255,255,255,0.2),_rgba(255,255,255,0.06))] shadow-[0_24px_60px_rgba(47,44,40,0.2)]"
            style={{ backgroundColor, backfaceVisibility: 'hidden' }}
          />
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor }}>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, y: 96, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.72, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-[1.22/1] w-[74%] min-w-[220px] max-w-[380px]">
          <div className="absolute inset-x-[12%] bottom-[22%] top-[16%] rounded-[22px] bg-white/92 shadow-[0_18px_40px_rgba(47,44,40,0.18)]" />

          <div className="absolute inset-x-0 bottom-0 top-[34%] rounded-[30px] border border-white/45 bg-[linear-gradient(160deg,_rgba(255,255,255,0.35),_rgba(255,255,255,0.08))] shadow-[0_28px_60px_rgba(47,44,40,0.24)]" />

          <div
            className="absolute inset-x-0 top-0 h-[48%] rounded-t-[30px] border border-white/50 bg-[linear-gradient(145deg,_rgba(255,255,255,0.4),_rgba(255,255,255,0.1))]"
            style={{
              transformOrigin: 'top center',
              animation: 'funvitation-envelope-flap 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.18s forwards',
            }}
          />

          <div className="absolute inset-x-[7%] bottom-[12%] h-[26%] rounded-b-[24px] border border-white/35 bg-[linear-gradient(180deg,_rgba(255,255,255,0.16),_rgba(255,255,255,0.03))]" />
        </div>
      </div>
    </div>
  );
}
