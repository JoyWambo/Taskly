import React from 'react';
import { cn } from '@/lib/utils';

export function Slider({
  value = [0],
  onValueChange,
  max = 100,
  min = 0,
  step = 1,
  className,
  ...props
}) {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onValueChange && onValueChange([newValue]);
  };

  return (
    <div className={cn('relative w-full', className)} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || 0}
        onChange={handleChange}
        className={cn(
          'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
          'slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4',
          'slider-thumb:rounded-full slider-thumb:bg-primary',
          'slider-thumb:cursor-pointer slider-thumb:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(value[0] || 0) / max * 100}%, hsl(var(--muted)) ${(value[0] || 0) / max * 100}%, hsl(var(--muted)) 100%)`
        }}
      />
    </div>
  );
}