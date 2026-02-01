import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Navbar } from '@/components/shared/Navbar';
import Hero from '@/components/hero';

const LandingScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  if (userInfo) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <Hero />
    </div>
  );
};

export default LandingScreen;
