import express from 'express';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const router = express.Router();

// Health check endpoint with detailed system info
router.get('/health', (_, res) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
    },
    node: process.version,
  });
});

// API documentation endpoint
router.get('/', (_, res) => {
  res.json({
    name: 'Task Management API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'A comprehensive task management system API',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      tasks: '/api/tasks',
      categories: '/api/categories',
    },
    documentation: {
      users: {
        'POST /api/users': 'Register new user',
        'POST /api/users/auth': 'Login user',
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'GET /api/users/stats': 'Get user statistics',
      },
      tasks: {
        'GET /api/tasks': 'Get user tasks with pagination and filters',
        'POST /api/tasks': 'Create new task',
        'GET /api/tasks/:id': 'Get task by ID',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task',
        'GET /api/tasks/overdue': 'Get overdue tasks',
        'GET /api/tasks/stats': 'Get task statistics',
        'POST /api/tasks/:id/comments': 'Add comment to task',
        'PUT /api/tasks/:id/archive': 'Toggle task archive status',
      },
      categories: {
        'GET /api/categories': 'Get user categories',
        'POST /api/categories': 'Create new category',
        'GET /api/categories/:id': 'Get category by ID',
        'PUT /api/categories/:id': 'Update category',
        'DELETE /api/categories/:id': 'Delete category',
        'GET /api/categories/:id/stats': 'Get category statistics',
        'GET /api/categories/:id/tasks': 'Get tasks in category',
        'POST /api/categories/create-defaults': 'Create default categories',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/categories', categoryRoutes);

export default router;