import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, ServerCrash } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo.png';

/**
 * Enhanced Error Page Component for TanStack Router
 * Automatically handles route errors with improved UI and error tracking
 */
export default function ErrorPage() {
  const routeError = useRouteError();
  const navigate = useNavigate();

  const [info, setInfo] = useState({ status: null, message: '' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let status = null;
    let message = 'We encountered an unexpected issue. Please try again.';

    if (routeError instanceof Error) {
      status = routeError.status || null;
      message = routeError.message;
    } else if (typeof routeError === 'string') {
      message = routeError;
    } else if (routeError && typeof routeError === 'object') {
      status = routeError.status || null;
      message = routeError.message ?? JSON.stringify(routeError);
    }

    setInfo({ status, message });
    console.error('Route error:', routeError);

    // Log error to monitoring service if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: message,
        fatal: false,
      });
    }
  }, [routeError]);

  const title =
    info.status === 404
      ? 'Page Not Found'
      : info.status === 403
      ? 'Access Restricted'
      : info.status === 401
      ? 'Sign In Required'
      : info.status >= 500
      ? 'Technical Difficulties'
      : 'Oops! Something Went Wrong';

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    window.location.reload();
  }, []);

  const handleHome = useCallback(
    () => navigate({ to: '/dashboard', replace: true }),
    [navigate]
  );

  const showContactSupport = retryCount >= 3;

  return (
    <main
      role='alert'
      className='min-h-screen flex items-center justify-center p-4 sm:p-6 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden'
    >
      {/* Brand watermark */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-5'>
        <img
          src={logoImage}
          alt=''
          className='w-96 h-96 select-none'
          aria-hidden='true'
        />
      </div>

      <Card className='w-full max-w-2xl shadow-xl relative z-10'>
        <CardHeader className='text-center space-y-4 pb-4'>
          <div className='mx-auto bg-destructive/10 rounded-full p-4 w-20 h-20 flex items-center justify-center'>
            {info.status >= 500 ? (
              <ServerCrash
                className='text-destructive'
                size={40}
                aria-hidden='true'
                strokeWidth={1.5}
              />
            ) : (
              <AlertTriangle
                className='text-destructive'
                size={40}
                aria-hidden='true'
                strokeWidth={1.5}
              />
            )}
          </div>

          <div className='space-y-2'>
            <CardTitle className='text-3xl font-bold'>{title}</CardTitle>
            {info.status && (
              <CardDescription className='text-base'>
                Error Code:{' '}
                <span className='font-mono font-semibold'>{info.status}</span>
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='text-center space-y-3'>
            <p className='text-base font-medium text-foreground'>
              {info.status === 404
                ? "The page you're looking for doesn't exist or may have been moved."
                : info.status === 403
                ? "You don't have permission to access this page. Contact your administrator if you need access."
                : info.status === 401
                ? 'Please sign in to access this page.'
                : info.message ||
                  'We encountered an unexpected issue. Please try again.'}
            </p>
            {info.status >= 500 && (
              <p className='text-sm text-muted-foreground'>
                Our team has been automatically notified and is working on a
                fix. Please try again in a few minutes.
              </p>
            )}
          </div>

          {showContactSupport && (
            <div className='border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4 rounded'>
              <p className='text-sm text-foreground'>
                <strong className='font-semibold'>Need additional help?</strong>
                <br />
                <span className='text-muted-foreground'>
                  Our support team is here to help:{' '}
                  <a
                    href='mailto:support@nrr-collections.com'
                    className='text-primary hover:underline'
                  >
                    support@nrr-collections.com
                  </a>
                </span>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className='flex flex-col sm:flex-row justify-center gap-3 pt-2'>
          <Button
            variant='outline'
            size='default'
            onClick={handleRetry}
            className='w-full sm:w-auto'
          >
            <RefreshCw className='mr-2 h-4 w-4' /> Retry
          </Button>
          <Button
            variant='default'
            size='default'
            onClick={handleHome}
            className='w-full sm:w-auto'
          >
            <Home className='mr-2 h-4 w-4' /> Home
          </Button>
        </CardFooter>

        {import.meta.env.DEV && routeError && (
          <div className='px-6 pb-6'>
            <details className='bg-muted rounded-lg p-4 text-xs overflow-auto max-h-64'>
              <summary className='cursor-pointer font-medium text-sm mb-2'>
                Debug Information
              </summary>
              <pre className='whitespace-pre-wrap text-muted-foreground'>
                {routeError instanceof Error
                  ? routeError.stack
                  : typeof routeError === 'object'
                  ? JSON.stringify(routeError, null, 2)
                  : String(routeError)}
              </pre>
            </details>
          </div>
        )}
      </Card>
    </main>
  );
}
