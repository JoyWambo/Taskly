import { NavLink } from 'react-router-dom';
import { ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Logo = ({ to = '/', className }) => {
  return (
    <NavLink to={to} className={cn('flex items-center gap-3 group', className)}>
      <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-lg shadow-primary/20 ring-1 ring-primary/10 transition group-hover:shadow-primary/30'>
        <ListTodo className='h-4 w-4 text-primary-foreground' />
      </span>
      <span className='text-lg font-semibold tracking-tight text-foreground'>
        Taskly
      </span>
    </NavLink>
  );
};
