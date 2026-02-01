import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import store from '@/store';
import { setCredentials } from '@/lib/slices/authSlice';
import Layout from '@/container/Layout';
import NotFound from '@/container/NotFound';

import LandingScreen from '@/pages/Auth/LandingScreen';
import SignScreen from '@/pages/Auth/SignScreen';
import SignUpScreen from '@/pages/Auth/SignUpScreen';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Category from '@/pages/Category/Category';
import Task from '@/pages/Task/Task';
import Settings from '@/pages/Settings/Settings';
import User from '@/pages/User/User';

// Auth checker component
const AuthChecker = () => {
  const dispatch = useDispatch();
  const { setTheme } = useTheme();

  useEffect(() => {
    // Don't check auth on public pages
    if (
      window.location.pathname === '/' ||
      window.location.pathname === '/login' ||
      window.location.pathname === '/signup' ||
      window.location.pathname === '/register'
    ) {
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          credentials: 'include', // Include cookies
        });
        if (response.ok) {
          const userData = await response.json();
          dispatch(setCredentials(userData));
          if (userData?.preferences?.theme) {
            setTheme(userData.preferences.theme);
          }
        }
      } catch (error) {
        // User not authenticated, do nothing
        console.log('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [dispatch, setTheme]);

  return null;
};

// Close button for notifications
const CloseButton = ({ snackbarKey }) => {
  const { closeSnackbar } = useSnackbar();
  return (
    <Button
      aria-label='Close notification'
      size='icon'
      variant='link'
      onClick={() => closeSnackbar(snackbarKey)}
    >
      <Cross2Icon className={cn('h-4 w-4 text-white')} />
    </Button>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme='light' storageKey='taskly-ui-theme'>
        <AuthChecker />
        <TooltipProvider>
          <SnackbarProvider
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            maxSnack={3}
            autoHideDuration={7000}
            preventDuplicate={true}
            action={(key) => <CloseButton snackbarKey={key} />}
          >
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<LandingScreen />} />
                <Route path='/login' element={<SignScreen />} />
                <Route path='/signup' element={<SignUpScreen />} />
                <Route path='/register' element={<Navigate to='/signup' replace />} />

                {/* Protected Routes */}
                <Route element={<Layout />}>
                  <Route path='dashboard' element={<Dashboard />} />
                  <Route path='tasks' element={<Task />} />
                  <Route path='categories' element={<Category />} />
                  <Route path='settings' element={<Settings />} />
                </Route>

                {/* Catch all */}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Router>
          </SnackbarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
