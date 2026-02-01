import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus, Search } from 'lucide-react';

export default function EmptyState({ type = 'no-tasks', onCreateTask }) {
  const content = {
    'no-tasks': {
      icon: ClipboardList,
      title: 'No tasks yet',
      description: 'Start organizing your life by creating your first task.',
      action: 'Create Your First Task',
    },
    'no-results': {
      icon: Search,
      title: 'No tasks found',
      description: 'Try adjusting your search or filter criteria.',
      action: null,
    },
  };

  const { icon: Icon, title, description, action } = content[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center justify-center py-16 px-4'
    >
      <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6'>
        <Icon className='w-10 h-10 text-muted-foreground' />
      </div>
      <h3 className='text-xl font-semibold text-foreground mb-2'>{title}</h3>
      <p className='text-muted-foreground text-center max-w-sm mb-6'>{description}</p>
      {action && (
        <Button
          onClick={onCreateTask}
          className='bg-primary text-primary-foreground hover:bg-primary/90'
        >
          <Plus className='w-4 h-4 mr-2' />
          {action}
        </Button>
      )}
    </motion.div>
  );
}
