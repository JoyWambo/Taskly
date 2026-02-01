import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const FilterControls = () => (
    <div className={cn('flex gap-3', isMobile ? 'flex-col' : 'flex-wrap')}>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger
          className={cn(
            'h-10 bg-muted/50 border-border',
            isMobile ? 'w-full' : 'w-35'
          )}
        >
          <div className='flex items-center gap-2'>
            <Filter className='w-4 h-4 text-muted-foreground' />
            <SelectValue placeholder='Status' />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='pending'>Pending</SelectItem>
          <SelectItem value='in-progress'>In Progress</SelectItem>
          <SelectItem value='completed'>Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger
          className={cn(
            'h-10 bg-muted/50 border-border',
            isMobile ? 'w-full' : 'w-35'
          )}
        >
          <SelectValue placeholder='Priority' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Priority</SelectItem>
          <SelectItem value='high'>High</SelectItem>
          <SelectItem value='medium'>Medium</SelectItem>
          <SelectItem value='low'>Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger
          className={cn(
            'h-10 bg-muted/50 border-border',
            isMobile ? 'w-full' : 'w-40'
          )}
        >
          <div className='flex items-center gap-2'>
            <ArrowUpDown className='w-4 h-4 text-muted-foreground' />
            <SelectValue placeholder='Sort by' />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='newest'>Newest First</SelectItem>
          <SelectItem value='oldest'>Oldest First</SelectItem>
          <SelectItem value='deadline'>By Deadline</SelectItem>
          <SelectItem value='priority'>By Priority</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant='ghost'
          size={isMobile ? 'default' : 'icon'}
          onClick={() => {
            onClearFilters();
            if (isMobile) setFilterSheetOpen(false);
          }}
          className={cn(
            'text-muted-foreground hover:text-foreground',
            isMobile ? 'w-full h-10' : 'h-10 w-10'
          )}
        >
          <X className='w-4 h-4' />
          {isMobile && <span className='ml-2'>Clear Filters</span>}
        </Button>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-card rounded-xl border border-border p-6 shadow-sm'
    >
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search tasks...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-10 pr-4 h-10 bg-muted/50 border border-border focus:bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-transparent'
          />
        </div>

        {/* Desktop Filters */}
        {!isMobile && <FilterControls />}

        {/* Mobile Filter Button */}
        {isMobile && (
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                className='h-10 gap-2 bg-muted/50 border-border hover:bg-muted'
              >
                <SlidersHorizontal className='w-4 h-4' />
                Filters
                {hasActiveFilters && (
                  <span className='ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-medium text-white'>
                    {
                      [
                        statusFilter !== 'all',
                        priorityFilter !== 'all',
                        sortBy !== 'newest',
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side='bottom' className='h-auto max-h-[80vh]'>
              <SheetHeader>
                <SheetTitle>Filter & Sort</SheetTitle>
                <SheetDescription>
                  Customize how you view your tasks
                </SheetDescription>
              </SheetHeader>
              <div className='mt-6'>
                <FilterControls />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </motion.div>
  );
}
