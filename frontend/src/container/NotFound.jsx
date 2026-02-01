import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';

const NotFound = () => {
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector((state) => state.auth);

  const goBack = () => navigate(-1);

  const goHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className='grid h-screen place-content-center bg-background px-4 relative'>
      <div className='text-center relative z-10'>
        <h1 className='text-9xl font-black text-muted-foreground/30'>404</h1>

        <p className='text-2xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Uh-oh!
        </p>

        <p className='font-normal text-xl mt-4 text-muted-foreground'>
          Sorry, we couldn't find this page.
        </p>

        <div className='flex gap-4 justify-center mt-6'>
          <Button
            type='button'
            onClick={goBack}
            variant='outline'
            className='duration-200 transition ease-in hover:scale-105'
          >
            Go Back
          </Button>
          <Button
            type='button'
            onClick={goHome}
            className='duration-200 transition ease-in hover:scale-105'
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
