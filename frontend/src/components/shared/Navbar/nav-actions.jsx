import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BadgeCheck,
  CreditCard,
  LogOut,
  ChevronsUpDown,
  User,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout as logoutAction } from '@/lib/slices/authSlice';
import { useLogoutMutation } from '@/lib/slices/userSlice';
import { cn } from '@/lib/utils';

const menuItems = [
  [
    // {
    //   label: 'Change Password',
    //   icon: BadgeCheck,
    //   badge: '',
    //   onClick: 'change-password',
    // },
    {
      label: 'Profile',
      icon: User,
      badge: '',
      onClick: 'settings',
    },
    // {
    //   label: 'Settings',
    //   icon: Settings,
    //   badge: '',
    //   onClick: 'settings',
    // },
  ],
  [
    {
      label: 'Log out',
      icon: LogOut,
      badge: '',
    },
  ],
];

export function NavActions({ user, isMobile = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      dispatch(logoutAction());
      navigate('/');
    }
  };

  const handleMenuItemClick = (item) => {
    if (item.label === 'Log out') {
      handleLogout();
    } else if (item.onClick) {
      if (typeof item.onClick === 'string') {
        navigate(`/${item.onClick}`);
      } else {
        item.onClick();
      }
    }
  };

  return (
    <div className='flex items-center gap-2 text-base w-full'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'relative flex items-center rounded-lg p-0 hover:bg-muted transition-colors border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isMobile
                ? 'w-full justify-start gap-3 h-12 px-4'
                : 'size-10 justify-center'
            )}
          >
            <Avatar
              className={cn('rounded-lg', isMobile ? 'size-9' : 'size-8')}
            >
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                className='h-full w-full rounded-lg object-cover'
              />
              <AvatarFallback className='rounded-lg bg-primary text-primary-foreground text-xs font-medium'>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isMobile && (
              <div className='flex-1 text-left'>
                <p className='text-sm font-medium leading-none'>{user.name}</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {user.email}
                </p>
              </div>
            )}
            {isMobile && (
              <ChevronsUpDown className='ml-auto h-4 w-4 text-muted-foreground' />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end'>
          <div className='flex items-center gap-3 px-2 py-2'>
            <Avatar className='size-7 rounded-lg'>
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                className='rounded-lg'
              />
              <AvatarFallback className='rounded-lg bg-primary text-primary-foreground text-xs font-medium'>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold text-foreground'>
                {user.name}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {user.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          {menuItems.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.map((item, itemIndex) => (
                <DropdownMenuItem
                  key={itemIndex}
                  onClick={() => handleMenuItemClick(item)}
                  className='cursor-pointer'
                >
                  <item.icon className='size-4 mr-2' />
                  <span>{item.label}</span>
                  {item.badge !== '' && (
                    <Badge variant='secondary' className='ml-auto'>
                      {item.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              {groupIndex < menuItems.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
