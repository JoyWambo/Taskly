import { NavLink } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const appItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Tasks', to: '/tasks' },
  { label: 'Categories', to: '/categories' },
];

const publicItems = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  // { label: 'Insights', href: '#insights' },
  // { label: 'Security', href: '#security' },
];

export const NavMenu = ({
  isAuthenticated = false,
  orientation = 'horizontal',
  className,
  onNavigate,
}) => {
  const items = isAuthenticated ? appItems : publicItems;
  const baseClass = navigationMenuTriggerStyle();

  return (
    <NavigationMenu
      orientation={orientation}
      className={cn(orientation === 'vertical' ? 'w-full' : 'w-auto', className)}
    >
      <NavigationMenuList className='data-[orientation=vertical]:-ms-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start'>
        {items.map((item) => (
          <NavigationMenuItem key={item.label}>
            {item.to ? (
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    baseClass,
                    isActive && 'bg-accent text-accent-foreground'
                  )
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <a
                href={item.href}
                onClick={onNavigate}
                className={cn(baseClass)}
              >
                {item.label}
              </a>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
