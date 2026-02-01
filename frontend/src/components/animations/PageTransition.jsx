import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial='initial'
      animate='in'
      exit='out'
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Alternative stagger transition for pages with multiple elements
export function StaggerPageTransition({ children, className = '' }) {
  const containerVariants = {
    initial: {},
    in: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    out: {},
  };

  return (
    <motion.div
      initial='initial'
      animate='in'
      exit='out'
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
