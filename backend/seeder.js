import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import tasks from './data/tasks.js';
import User from './models/userModel.js';
import Task from './models/taskModel.js';
import Category from './models/categoryModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await Task.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('Existing data cleared...'.yellow);

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log('Users imported...'.green);

    const adminUser = createdUsers[0]._id;
    const regularUser1 = createdUsers[1]._id;
    const regularUser2 = createdUsers[2]._id;

    // Create default categories for admin user
    const adminCategories = await Category.createDefaultCategories(adminUser);
    console.log('Default categories created for admin...'.green);

    // Create some custom categories for regular users
    const userCategories = await Category.insertMany([
      {
        name: 'Development',
        description: 'Software development tasks',
        color: '#2c3e50',
        icon: 'code',
        user: regularUser1,
        sortOrder: 1,
      },
      {
        name: 'Design',
        description: 'UI/UX design tasks',
        color: '#e67e22',
        icon: 'paint-brush',
        user: regularUser1,
        sortOrder: 2,
      },
      {
        name: 'Testing',
        description: 'Quality assurance and testing',
        color: '#8e44ad',
        icon: 'bug',
        user: regularUser1,
        sortOrder: 3,
      },
    ]);

    console.log('Custom categories created...'.green);

    // Create sample tasks with proper user and category references
    const sampleTasks = tasks.map((task, index) => {
      // Distribute tasks among users
      let taskUser;
      let taskCategory;

      if (index % 3 === 0) {
        taskUser = adminUser;
        taskCategory = adminCategories[index % adminCategories.length]._id;
      } else if (index % 3 === 1) {
        taskUser = regularUser1;
        // Use custom categories for development tasks, default for others
        if (task.category === 'Development') {
          taskCategory = userCategories[0]._id;
        } else if (task.category === 'Design') {
          taskCategory = userCategories[1]._id;
        } else if (task.category === 'Testing') {
          taskCategory = userCategories[2]._id;
        } else {
          taskCategory = adminCategories[0]._id; // Default to first admin category
        }
      } else {
        taskUser = regularUser2;
        taskCategory = adminCategories[index % adminCategories.length]._id;
      }

      return {
        ...task,
        user: taskUser,
        category: taskCategory,
        // Add some sample subtasks for certain tasks
        subtasks: index % 4 === 0 ? [
          {
            title: `${task.title} - Phase 1`,
            isCompleted: task.status === 'completed',
            completedAt: task.status === 'completed' ? new Date() : null,
          },
          {
            title: `${task.title} - Phase 2`,
            isCompleted: false,
            completedAt: null,
          }
        ] : [],
        // Add some sample comments
        comments: index % 5 === 0 ? [
          {
            user: taskUser,
            text: 'Started working on this task',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          }
        ] : [],
      };
    });

    await Task.insertMany(sampleTasks);
    console.log('Sample tasks imported...'.green);

    // Update task counts for all categories
    const allCategories = [...adminCategories, ...userCategories];
    for (const category of allCategories) {
      await category.updateTaskCount();
    }
    console.log('Category task counts updated...'.green);

    console.log('Data Imported Successfully!'.green.inverse);
    console.log(`
Created:
- ${createdUsers.length} users
- ${allCategories.length} categories
- ${sampleTasks.length} tasks
    `.cyan);

    process.exit();
  } catch (error) {
    console.error(`Import Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Task.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('All Data Destroyed!'.red.inverse);
    console.log(`
Deleted:
- All tasks
- All categories
- All users
    `.yellow);

    process.exit();
  } catch (error) {
    console.error(`Destroy Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}