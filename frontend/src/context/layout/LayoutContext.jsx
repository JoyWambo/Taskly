import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Layout types
export const LAYOUT_TYPES = {
  DASHBOARD: 'dashboard',
  FULLSCREEN: 'fullscreen',
  MODAL: 'modal',
  AUTH: 'auth',
  PUBLIC: 'public'
};

// Initial state
const initialState = {
  layout: LAYOUT_TYPES.DASHBOARD,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  breadcrumb: [],
  pageTitle: '',
  notifications: [],
  searchOpen: false,
  commandPaletteOpen: false,
  preferences: {
    theme: 'system',
    sidebarPosition: 'left',
    animations: true,
    compactMode: false
  }
};

// Action types
const ACTIONS = {
  SET_LAYOUT: 'SET_LAYOUT',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  SET_MOBILE_MENU_OPEN: 'SET_MOBILE_MENU_OPEN',
  SET_BREADCRUMB: 'SET_BREADCRUMB',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  TOGGLE_SEARCH: 'TOGGLE_SEARCH',
  TOGGLE_COMMAND_PALETTE: 'TOGGLE_COMMAND_PALETTE',
  SET_PREFERENCES: 'SET_PREFERENCES',
  RESET_LAYOUT: 'RESET_LAYOUT'
};

// Reducer
function layoutReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LAYOUT:
      return { ...state, layout: action.payload };

    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case ACTIONS.SET_SIDEBAR_COLLAPSED:
      return { ...state, sidebarCollapsed: action.payload };

    case ACTIONS.TOGGLE_MOBILE_MENU:
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };

    case ACTIONS.SET_MOBILE_MENU_OPEN:
      return { ...state, mobileMenuOpen: action.payload };

    case ACTIONS.SET_BREADCRUMB:
      return { ...state, breadcrumb: action.payload };

    case ACTIONS.SET_PAGE_TITLE:
      return { ...state, pageTitle: action.payload };

    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case ACTIONS.TOGGLE_SEARCH:
      return { ...state, searchOpen: !state.searchOpen };

    case ACTIONS.TOGGLE_COMMAND_PALETTE:
      return {
        ...state,
        commandPaletteOpen: !state.commandPaletteOpen,
        searchOpen: false // Close search when command palette opens
      };

    case ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };

    case ACTIONS.RESET_LAYOUT:
      return initialState;

    default:
      return state;
  }
}

// Context
const LayoutContext = createContext(null);

// Provider component
export function LayoutProvider({ children }) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Actions
  const setLayout = useCallback((layout) => {
    dispatch({ type: ACTIONS.SET_LAYOUT, payload: layout });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SIDEBAR });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed) => {
    dispatch({ type: ACTIONS.SET_SIDEBAR_COLLAPSED, payload: collapsed });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_MOBILE_MENU });
  }, []);

  const setMobileMenuOpen = useCallback((open) => {
    dispatch({ type: ACTIONS.SET_MOBILE_MENU_OPEN, payload: open });
  }, []);

  const setBreadcrumb = useCallback((breadcrumb) => {
    dispatch({ type: ACTIONS.SET_BREADCRUMB, payload: breadcrumb });
  }, []);

  const setPageTitle = useCallback((title) => {
    dispatch({ type: ACTIONS.SET_PAGE_TITLE, payload: title });
    // Also update document title
    document.title = title ? `${title} - Task Management` : 'Task Management';
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substring(2);
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: { ...notification, id, timestamp: Date.now() }
    });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const toggleSearch = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SEARCH });
  }, []);

  const toggleCommandPalette = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_COMMAND_PALETTE });
  }, []);

  const setPreferences = useCallback((preferences) => {
    dispatch({ type: ACTIONS.SET_PREFERENCES, payload: preferences });
    // Persist to localStorage
    localStorage.setItem('layoutPreferences', JSON.stringify(preferences));
  }, []);

  const resetLayout = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_LAYOUT });
  }, []);

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    setLayout,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileMenu,
    setMobileMenuOpen,
    setBreadcrumb,
    setPageTitle,
    addNotification,
    removeNotification,
    toggleSearch,
    toggleCommandPalette,
    setPreferences,
    resetLayout,

    // Computed values
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

// Hook to use layout context
export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState('desktop');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

export default LayoutContext;