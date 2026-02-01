import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '@/context/layout/LayoutContext';

/**
 * Hook to manage page metadata including title and breadcrumbs
 * @param {Object} options - Configuration options
 * @param {string} options.title - Page title
 * @param {Array} options.breadcrumb - Breadcrumb items
 * @param {boolean} options.autoGenerate - Auto-generate breadcrumb from route
 */
export function usePageMeta({
  title,
  breadcrumb,
  autoGenerate = false
} = {}) {
  const { setPageTitle, setBreadcrumb } = useLayout();
  const location = useLocation();

  useEffect(() => {
    // Set page title
    if (title) {
      setPageTitle(title);
    }

    // Set breadcrumb
    if (breadcrumb) {
      setBreadcrumb(breadcrumb);
    } else if (autoGenerate) {
      // Auto-generate breadcrumb from current path
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const breadcrumbItems = [];

      let currentPath = '';
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;

        // Convert segment to readable label
        const label = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        breadcrumbItems.push({
          label,
          href: currentPath
        });
      });

      setBreadcrumb(breadcrumbItems);
    }

    // Cleanup on unmount
    return () => {
      if (title) setPageTitle('');
      if (breadcrumb || autoGenerate) setBreadcrumb([]);
    };
  }, [title, breadcrumb, autoGenerate, location.pathname, setPageTitle, setBreadcrumb]);
}

/**
 * Predefined page configurations for common routes
 */
export const PAGE_CONFIGS = {
  dashboard: {
    title: 'Dashboard',
    breadcrumb: []
  },
  tasks: {
    title: 'Tasks',
    breadcrumb: [{ label: 'Tasks', href: '/tasks' }]
  },
  'tasks-new': {
    title: 'Create Task',
    breadcrumb: [
      { label: 'Tasks', href: '/tasks' },
      { label: 'Create', href: '/tasks/new' }
    ]
  },
  projects: {
    title: 'Projects',
    breadcrumb: [{ label: 'Projects', href: '/projects' }]
  },
  settings: {
    title: 'Settings',
    breadcrumb: [{ label: 'Settings', href: '/settings' }]
  },
  profile: {
    title: 'Profile',
    breadcrumb: [{ label: 'Profile', href: '/profile' }]
  },
  reports: {
    title: 'Reports & Analytics',
    breadcrumb: [{ label: 'Reports', href: '/reports' }]
  }
};

/**
 * Hook to use predefined page configurations
 * @param {string} configKey - Key from PAGE_CONFIGS
 * @param {Object} overrides - Override specific config values
 */
export function usePageConfig(configKey, overrides = {}) {
  const config = PAGE_CONFIGS[configKey];
  const finalConfig = config ? { ...config, ...overrides } : overrides;

  usePageMeta(finalConfig);
}