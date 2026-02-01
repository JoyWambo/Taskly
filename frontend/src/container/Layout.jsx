import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/shared/Navbar';
import { BackgroundPattern } from '@/components/background-pattern';
import ProtectedRoute from './ProtectedRoute';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

export function RouteTransition({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        <React.Suspense
          fallback={
            <motion.div
              className='flex items-center justify-center h-64'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full'
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          }
        >
          {children}
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const Layout = () => {
  return (
    <ProtectedRoute>
      <div className='relative isolate min-h-screen bg-background'>
        <div className='pointer-events-none absolute inset-0 z-0'>
          <BackgroundPattern />
        </div>
        <div className='relative z-10'>
          <Navbar />
          <RouteTransition>
            <main className='container mx-auto px-4 py-6 md:px-6 md:py-8'>
              <Outlet />
            </main>
          </RouteTransition>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
