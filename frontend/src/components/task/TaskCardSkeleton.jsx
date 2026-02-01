import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const shimmerVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export default function TaskCardSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 24
          }}
        >
          <Card className='p-4 pl-5 relative overflow-hidden'>
            {/* Priority stripe */}
            <motion.div
              className='absolute top-0 left-0 w-1 h-full bg-muted'
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />

          <div className='flex items-start gap-3 mb-3'>
            {/* Status indicator skeleton */}
            <Skeleton className='w-10 h-10 rounded-lg shrink-0' />

            <div className='min-w-0 flex-1'>
              {/* Title skeleton */}
              <Skeleton className='h-5 w-3/4 mb-2' />

              {/* Badges skeleton */}
              <div className='flex items-center gap-2 mb-2'>
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-5 w-20' />
              </div>
            </div>

            {/* Action button skeleton */}
            <Skeleton className='w-8 h-8 shrink-0' />
          </div>

          {/* Description skeleton */}
          <div className='ml-13 mb-3'>
            <Skeleton className='h-4 w-full mb-1' />
            <Skeleton className='h-4 w-2/3' />
          </div>

          {/* Progress skeleton */}
          <div className='ml-13 mb-3'>
            <div className='flex items-center justify-between mb-1'>
              <Skeleton className='h-3 w-12' />
              <Skeleton className='h-3 w-8' />
            </div>
            <Skeleton className='h-1.5 w-full' />
          </div>

          {/* Footer skeleton */}
          <div className='ml-13 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-3 w-20' />
            </div>
            <Skeleton className='h-3 w-12' />
          </div>
        </Card>
        </motion.div>
      ))}
    </>
  );
}