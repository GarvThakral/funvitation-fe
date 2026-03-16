import { motion } from 'motion/react';

const BLOB_COLORS = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4'];
const PARTICLE_COLORS = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

export default function HoliBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(30)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-2xl opacity-40"
          style={{
            width: Math.random() * 150 + 50,
            height: Math.random() * 150 + 50,
            backgroundColor: BLOB_COLORS[Math.floor(Math.random() * BLOB_COLORS.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            x: [0, Math.random() * 400 - 200, 0],
            y: [0, Math.random() * 400 - 200, 0],
            rotate: [0, 360],
          }}
          transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {[...Array(50)].map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            backgroundColor: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 1000 - 500],
            y: [0, Math.random() * 1000 - 500],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}
