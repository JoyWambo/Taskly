import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

const glowVariants = {
  initial: { boxShadow: '0 0 0 0 rgba(91, 46, 255, 0)' },
  hover: {
    boxShadow: '0 0 20px 4px rgba(91, 46, 255, 0.15)',
    transition: { duration: 0.2 }
  }
};

const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export default function AnimatedButton({
  children,
  className = '',
  loading = false,
  success = false,
  disabled = false,
  withGlow = false,
  onClick,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      variants={withGlow ? glowVariants : buttonVariants}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
      >
        {loading && (
          <motion.div
            variants={loadingSpinnerVariants}
            animate="animate"
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}

        {success && !loading && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 15,
              delay: 0.1
            }}
            className="w-4 h-4"
          >
            ✓
          </motion.div>
        )}

        <motion.span
          animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
        >
          {children}
        </motion.span>
      </motion.div>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-inherit"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
    </motion.button>
  );
}