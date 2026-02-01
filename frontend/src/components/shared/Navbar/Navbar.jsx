import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { NavActions } from './nav-actions';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { NavigationSheet } from './navigation-sheet';

export function Navbar() {
  const { userInfo } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(userInfo);

  const userData = {
    name: userInfo?.name || 'Task Management User',
    email: userInfo?.email || 'user@example.com',
    avatar: userInfo?.avatar || '/avatars/user.jpg',
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60'>
      <div className='mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-10'>
          <Logo to={isAuthenticated ? '/dashboard' : '/'} />
          <NavMenu
            isAuthenticated={isAuthenticated}
            className='hidden md:flex'
          />
        </div>

        <div className='flex items-center gap-2'>
          {isAuthenticated ? (
            <>
              <div className='hidden md:flex'>
                <NavActions user={userData} />
              </div>
              <ThemeToggle />
            </>
          ) : (
            <>
              <ThemeToggle />
              <div className='hidden items-center gap-2 md:flex'>
                <Button asChild variant='outline' size='sm'>
                  <NavLink to='/login'>Sign in</NavLink>
                </Button>
                <Button asChild size='sm' className='rounded-full'>
                  <NavLink to='/signup'>Get started</NavLink>
                </Button>
              </div>
            </>
          )}

          <div className='md:hidden'>
            <NavigationSheet isAuthenticated={isAuthenticated} user={userData} />
          </div>
        </div>
      </div>
    </header>
  );
}
