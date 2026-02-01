import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a category name'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    color: {
      type: String,
      default: '#3498db',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
    },
    icon: {
      type: String,
      default: 'folder',
      maxlength: [30, 'Icon name cannot exceed 30 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    taskCount: {
      type: Number,
      default: 0,
    },
    settings: {
      defaultPriority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
      defaultEstimatedHours: {
        type: Number,
        min: 0,
        default: 1,
      },
      autoArchive: {
        type: Boolean,
        default: false,
      },
      autoArchiveDays: {
        type: Number,
        default: 30,
        min: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for getting tasks in this category
categorySchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'category',
});

// Method to get category statistics
categorySchema.methods.getStats = async function () {
  const Task = mongoose.model('Task');

  const stats = await Task.aggregate([
    { $match: { category: this._id, user: this.user, isArchived: false } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
        },
        pendingTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$deadline', new Date()] },
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$deadline', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              {
                $divide: [
                  { $subtract: ['$completedAt', '$startDate'] },
                  1000 * 60 * 60 * 24, // Convert to days
                ],
              },
              null,
            ],
          },
        },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
      },
    },
  ]);

  return stats[0] || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    avgCompletionTime: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
  };
};

// Method to update task count
categorySchema.methods.updateTaskCount = async function () {
  const Task = mongoose.model('Task');
  const count = await Task.countDocuments({
    category: this._id,
    user: this.user,
    isArchived: false
  });

  this.taskCount = count;
  await this.save({ validateBeforeSave: false });

  return count;
};

// Static method to create default categories for a user
categorySchema.statics.createDefaultCategories = async function (userId) {
  const defaultCategories = [
    {
      name: 'Personal',
      description: 'Personal tasks and activities',
      color: '#e74c3c',
      icon: 'user',
      user: userId,
      isDefault: true,
      sortOrder: 1,
    },
    {
      name: 'Work',
      description: 'Work-related tasks and projects',
      color: '#3498db',
      icon: 'briefcase',
      user: userId,
      isDefault: true,
      sortOrder: 2,
    },
    {
      name: 'Shopping',
      description: 'Shopping lists and purchases',
      color: '#f39c12',
      icon: 'shopping-cart',
      user: userId,
      isDefault: true,
      sortOrder: 3,
    },
    {
      name: 'Health',
      description: 'Health and fitness related tasks',
      color: '#27ae60',
      icon: 'heart',
      user: userId,
      isDefault: true,
      sortOrder: 4,
    },
    {
      name: 'Learning',
      description: 'Educational and skill development tasks',
      color: '#9b59b6',
      icon: 'graduation-cap',
      user: userId,
      isDefault: true,
      sortOrder: 5,
    },
  ];

  try {
    const categories = await this.insertMany(defaultCategories);
    return categories;
  } catch (error) {
    throw new Error('Failed to create default categories: ' + error.message);
  }
};

// Middleware to update task count when category is deleted
categorySchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Task = mongoose.model('Task');

  // Update all tasks in this category to have no category
  await Task.updateMany(
    { category: this._id },
    { $unset: { category: 1 } }
  );
});

// Indexes for better query performance
categorySchema.index({ user: 1, name: 1 }, { unique: true });
categorySchema.index({ user: 1, sortOrder: 1 });
categorySchema.index({ user: 1, isActive: 1 });
categorySchema.index({ isDefault: 1 });

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
