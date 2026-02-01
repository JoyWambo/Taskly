import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { setCredentials, setLoading } from '@/lib/slices/authSlice';
import { CheckSquare } from 'lucide-react';
import { useLoginMutation } from '@/lib/slices/userSlice';

const SignScreen = () => {
  const [email, setEmail] = useState('john@email.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      dispatch(setLoading(true));
      const userData = await login({ email, password }).unwrap();
      dispatch(setCredentials(userData));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err?.data?.message || err?.message || 'Failed to sign in'
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex justify-center mb-4'>
            <div className='p-3 bg-primary/10 rounded-full'>
              <CheckSquare className='h-8 w-8 text-primary' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold'>Welcome back</CardTitle>
          <CardDescription>
            Sign in to your task management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='name@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  to='/forgot-password'
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
                {error}
              </div>
            )}
            <Button
              type='submit'
              className='w-full'
              disabled={loading || isLoggingIn}
            >
              {loading || isLoggingIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <div className='text-sm text-center text-muted-foreground'>
            Don't have an account?{' '}
            <Link
              to='/signup'
              className='font-medium text-primary hover:underline'
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignScreen;
