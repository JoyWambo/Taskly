import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

const celebrationVariants = {
  initial: { scale: 0, opacity: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    rotate: [180, 0, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.6, 1],
      ease: 'easeOut'
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const sparkleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.2,
      times: [0, 0.5, 1],
      ease: 'easeOut'
    }
  }
};

const confettiVariants = {
  initial: { y: -50, opacity: 0, scale: 0 },
  animate: {
    y: [0, 100, 200],
    opacity: [0, 1, 0],
    scale: [0, 1, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      ease: 'easeOut'
    }
  }
};

export function TaskCompletionSuccess({ show, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete && onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Success icon */}
          <motion.div
            className="relative"
            variants={celebrationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            {/* Sparkles around the icon */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 text-yellow-400"
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'center',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`
                }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            ))}
          </motion.div>

          {/* Confetti */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded"
              variants={confettiVariants}
              initial="initial"
              animate="animate"
              style={{
                left: `${20 + (i % 6) * 10}%`,
                top: '30%'
              }}
            />
          ))}

          {/* Success text */}
          <motion.div
            className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
              <p className="text-lg font-semibold text-gray-900">
                Task Completed! 🎉
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function QuickSuccessToast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}