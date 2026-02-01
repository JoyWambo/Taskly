import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { ThemeToggle } from './theme-toggle';
import { NavActions } from './nav-actions';

export const NavigationSheet = ({ isAuthenticated, user }) => {
  const [open, setOpen] = useState(false);

  const handleNavigate = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='rounded-full'>
          <Menu className='h-4 w-4' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col px-6 py-4'>
        <div className='flex items-center justify-between'>
          <Logo to={isAuthenticated ? '/dashboard' : '/'} />
          <ThemeToggle />
        </div>
        <NavMenu
          orientation='vertical'
          isAuthenticated={isAuthenticated}
          onNavigate={handleNavigate}
          className='mt-6 [&>div]:h-full'
        />
        <div className='mt-auto pt-6 border-t border-border/60'>
          {isAuthenticated ? (
            <NavActions user={user} isMobile />
          ) : (
            <div className='grid gap-2'>
              <Button
                asChild
                variant='outline'
                size='lg'
                className='rounded-xl'
              >
                <NavLink to='/login' onClick={handleNavigate}>
                  Sign in
                </NavLink>
              </Button>
              <Button asChild size='lg' className='rounded-xl'>
                <NavLink to='/signup' onClick={handleNavigate}>
                  Get started
                </NavLink>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
