// Use environment variable for API URL
// In development, use relative paths (proxy handles it)
// In production, use the production API URL
const isProduction = import.meta.env.PROD;

// Use relative paths in development (Vite proxy), production URL in production
const apiUrl = isProduction ? import.meta.env.VITE_API_URL_PROD || '' : '';

export const BASE_URL = apiUrl;
export const TASKS_URL = '/api/tasks';
export const USERS_URL = '/api/users';
export const CATEGORY_URL = '/api/categories';
