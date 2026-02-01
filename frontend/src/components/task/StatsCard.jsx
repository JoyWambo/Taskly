import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variants = {
  default: {
    card: 'bg-card border-border',
    title: 'text-muted-foreground',
    value: 'text-card-foreground',
    icon: 'bg-primary/10 text-primary',
  },
  emerald: {
    card: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    title: 'text-emerald-600',
    value: 'text-emerald-700',
    icon: 'bg-emerald-200 text-emerald-600',
  },
  red: {
    card: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    title: 'text-red-600',
    value: 'text-red-700',
    icon: 'bg-red-200 text-red-600',
  },
  blue: {
    card: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    title: 'text-blue-600',
    value: 'text-blue-700',
    icon: 'bg-blue-200 text-blue-600',
  },
  purple: {
    card: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    title: 'text-purple-600',
    value: 'text-purple-700',
    icon: 'bg-purple-200 text-purple-600',
  },
  gray: {
    card: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    title: 'text-gray-600',
    value: 'text-gray-700',
    icon: 'bg-gray-200 text-gray-600',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
  variant = 'default',
  className,
}) {
  if (!Icon) return null;

  const variantStyles = variants[variant] || variants.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-300',
        variantStyles.card,
        className
      )}
    >
      <div className='flex items-start justify-between'>
        <div className='min-w-0 flex-1'>
          <p className={cn('text-sm font-medium mb-1', variantStyles.title)}>
            {title}
          </p>
          <p className={cn('text-2xl font-bold', variantStyles.value)}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-xs mt-1', variantStyles.title)}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', variantStyles.icon)}>
          <Icon className='h-6 w-6' />
        </div>
      </div>
    </motion.div>
  );
}
