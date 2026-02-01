import bcrypt from 'bcryptjs';
import { generateAvatar } from '../utils/avatarUtils.js';

const users = [
  {
    name: 'Admin User',
    email: 'admin@email.com',
    password: bcrypt.hashSync('123456', 10),
    avatar: generateAvatar(null, 'Admin User', { isAdmin: true }),
    isAdmin: true,
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        deadlineReminders: true,
        taskUpdates: true,
      },
      dateFormat: 'DD/MM/YYYY',
      timezone: 'America/New_York',
    },
  },
  {
    name: 'John Doe',
    email: 'john@email.com',
    password: bcrypt.hashSync('123456', 10),
    avatar: generateAvatar(null, 'John Doe', { theme: 'dark' }),
    isAdmin: false,
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        deadlineReminders: true,
        taskUpdates: false,
      },
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Europe/London',
    },
  },
  {
    name: 'Jane Smith',
    email: 'jane@email.com',
    password: bcrypt.hashSync('123456', 10),
    avatar: generateAvatar(null, 'Jane Smith', { theme: 'light' }),
    isAdmin: false,
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    preferences: {
      theme: 'light',
      notifications: {
        email: false,
        deadlineReminders: true,
        taskUpdates: true,
      },
      dateFormat: 'YYYY-MM-DD',
      timezone: 'America/Los_Angeles',
    },
  },
  {
    name: 'Mike Johnson',
    email: 'mike@email.com',
    password: bcrypt.hashSync('123456', 10),
    avatar: generateAvatar(null, 'Mike Johnson', { isAdmin: false }),
    isAdmin: false,
    isActive: true,
    isEmailVerified: false,
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        deadlineReminders: false,
        taskUpdates: true,
      },
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Australia/Sydney',
    },
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@email.com',
    password: bcrypt.hashSync('123456', 10),
    avatar: generateAvatar(null, 'Sarah Wilson', { theme: 'light' }),
    isAdmin: false,
    isActive: false,
    isEmailVerified: true,
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        deadlineReminders: true,
        taskUpdates: true,
      },
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Europe/Berlin',
    },
  },
];

export default users;
