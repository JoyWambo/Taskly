import { asyncHandler } from '../middleware/utilityMiddleware.js';
import Task from '../models/taskModel.js';
import Category from '../models/categoryModel.js';

// @desc    Fetch all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  // Build search query
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
        ],
      }
    : {};

  // Build filters
  const filters = {
    user: req.user._id,
    isArchived:
      req.query.includeArchived === 'true' ? { $in: [true, false] } : false,
    ...keyword,
  };

  if (req.query.status) {
    filters.status = req.query.status;
  }

  if (req.query.priority) {
    filters.priority = req.query.priority;
  }

  if (req.query.category) {
    filters.category = req.query.category;
  }

  // Date range filtering
  if (req.query.dueBefore) {
    filters.deadline = {
      ...filters.deadline,
      $lte: new Date(req.query.dueBefore),
    };
  }

  if (req.query.dueAfter) {
    filters.deadline = {
      ...filters.deadline,
      $gte: new Date(req.query.dueAfter),
    };
  }

  const count = await Task.countDocuments({ ...filters });
  const tasks = await Task.find({ ...filters })
    .populate('category', 'name color')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    tasks,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    hasMore: page < Math.ceil(count / pageSize),
  });
});

// @desc    Fetch single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('category', 'name color icon')
    .populate('comments.user', 'name avatar');

  if (task) {
    return res.json(task);
  } else {
    // NOTE: this will run if a valid ObjectId but no task was found
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    status = 'pending',
    priority = 'medium',
    category,
    deadline,
    estimatedHours,
    tags,
  } = req.body;

  // Validate required fields
  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  // Validate category if provided
  if (category) {
    const categoryExists = await Category.findOne({
      _id: category,
      user: req.user._id,
    });
    if (!categoryExists) {
      res.status(400);
      throw new Error('Category not found');
    }
  }

  const task = new Task({
    title,
    description: description || '',
    status,
    priority,
    category: category || null,
    user: req.user._id,
    deadline: deadline || null,
    estimatedHours: estimatedHours || 0,
    tags: tags || [],
    startDate: new Date(),
  });

  const createdTask = await task.save();

  // Update category task count if category was assigned
  if (category) {
    const categoryDoc = await Category.findOne({
      _id: category,
      user: req.user._id,
    });
    if (categoryDoc) {
      await categoryDoc.updateTaskCount();
    }
  }

  // Populate category for response
  await createdTask.populate('category', 'name color icon');

  res.status(201).json(createdTask);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    category,
    deadline,
    estimatedHours,
    actualHours,
    tags,
    progression,
  } = req.body;

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (task) {
    // Validate category if provided and changed
    if (category && category !== task.category?.toString()) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });
      if (!categoryExists) {
        res.status(400);
        throw new Error('Category not found');
      }
    }

    const oldCategory = task.category;

    task.title = title || task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.category = category !== undefined ? category : task.category;
    task.deadline = deadline !== undefined ? deadline : task.deadline;
    task.estimatedHours =
      estimatedHours !== undefined ? estimatedHours : task.estimatedHours;
    task.actualHours =
      actualHours !== undefined ? actualHours : task.actualHours;
    task.tags = tags !== undefined ? tags : task.tags;
    task.progression =
      progression !== undefined ? progression : task.progression;

    const updatedTask = await task.save();

    // Update category task counts if category changed
    if (oldCategory && oldCategory.toString() !== task.category?.toString()) {
      const oldCategoryDoc = await Category.findOne({
        _id: oldCategory,
        user: req.user._id,
      });
      if (oldCategoryDoc) {
        await oldCategoryDoc.updateTaskCount();
      }
    }

    if (task.category) {
      const newCategoryDoc = await Category.findOne({
        _id: task.category,
        user: req.user._id,
      });
      if (newCategoryDoc) {
        await newCategoryDoc.updateTaskCount();
      }
    }

    // Populate category for response
    await updatedTask.populate('category', 'name color icon');

    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (task) {
    const categoryId = task.category;

    await Task.deleteOne({ _id: task._id });

    // Update category task count if task had a category
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        user: req.user._id,
      });
      if (category) {
        await category.updateTaskCount();
      }
    }

    res.json({
      message: 'Task removed successfully',
      deletedTask: {
        id: task._id,
        title: task.title,
      },
    });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addTaskComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (task) {
    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    // Populate the new comment with user info
    await task.populate({
      path: 'comments.user',
      select: 'name avatar',
      match: { _id: req.user._id },
    });

    const newComment = task.comments[task.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
    });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Get user's overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
const getOverdueTasks = asyncHandler(async (req, res) => {
  const overdueTasks = await Task.find({
    user: req.user._id,
    deadline: { $lt: new Date() },
    status: { $ne: 'completed' },
    isArchived: false,
  })
    .populate('category', 'name color')
    .sort({ deadline: 1 })
    .limit(10);

  res.json({
    tasks: overdueTasks,
    count: overdueTasks.length,
  });
});

// @desc    Archive/unarchive task
// @route   PUT /api/tasks/:id/archive
// @access  Private
const toggleTaskArchive = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (task) {
    task.isArchived = !task.isArchived;
    const updatedTask = await task.save();

    res.json({
      message: `Task ${task.isArchived ? 'archived' : 'unarchived'} successfully`,
      task: {
        id: updatedTask._id,
        title: updatedTask.title,
        isArchived: updatedTask.isArchived,
      },
    });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Get task statistics for user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Task.aggregate([
    { $match: { user: userId, isArchived: false } },
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
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
        avgProgression: { $avg: '$progression' },
      },
    },
  ]);

  const taskStats = stats[0] || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    avgProgression: 0,
  };

  // Calculate completion rate
  taskStats.completionRate =
    taskStats.totalTasks > 0
      ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100)
      : 0;

  res.json({
    stats: taskStats,
    generatedAt: new Date(),
  });
});

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  getOverdueTasks,
  toggleTaskArchive,
  getTaskStats,
};
