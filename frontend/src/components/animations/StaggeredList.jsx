import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: -100,
    transition: {
      duration: 0.2
    }
  }
};

const slideItemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2 }
  }
};

export function StaggeredList({
  children,
  className = '',
  variant = 'default' // 'default' | 'slide'
}) {
  const variants = variant === 'slide' ? slideItemVariants : itemVariants;

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={child.key || index}
          variants={variants}
          layout
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className = '',
  delay = 0,
  hover = true
}) {
  const hoverVariants = hover ? {
    scale: 1.01,
    y: -2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10
    }
  } : {};

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        delay
      }}
      whileHover={hoverVariants}
      layout
    >
      {children}
    </motion.div>
  );
}

export function FadeInList({ children, className = '' }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={child.key || index}
            variants={itemVariants}
            layout
            exit="exit"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}