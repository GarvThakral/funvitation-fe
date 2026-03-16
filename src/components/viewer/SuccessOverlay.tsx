import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessOverlayProps {
  message: string;
  onBack: () => void;
}

export default function SuccessOverlay({ message, onBack }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="z-50 flex flex-col items-center justify-center text-center p-12 bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl max-w-md border border-[#f3c583]/60"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8 text-[#e99497]"
      >
        <Heart size={100} fill="currentColor" />
      </motion.div>

      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c86d75] to-[#d3872e] mb-6 tracking-tight">
        {message}
      </h2>

      <button
        onClick={onBack}
        className="px-8 py-3 bg-[#fff4dd] text-[#c86d75] rounded-2xl font-semibold hover:bg-[#ffeec9] transition-all"
      >
        Back to invite
      </button>
    </motion.div>
  );
}
