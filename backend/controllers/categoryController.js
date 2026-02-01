import { asyncHandler } from '../middleware/utilityMiddleware.js';
import Category from '../models/categoryModel.js';
import Task from '../models/taskModel.js';

// @desc    Fetch all categories for authenticated user
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  // Build search query
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  // Build filters
  const filters = {
    user: req.user._id,
    ...keyword,
  };

  if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }

  if (req.query.isDefault !== undefined) {
    filters.isDefault = req.query.isDefault === 'true';
  }

  const categories = await Category.find({ ...filters }).sort({
    sortOrder: 1,
    createdAt: -1,
  });

  res.json({
    categories,
    total: categories.length,
  });
});

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    return res.json(category);
  } else {
    // NOTE: this will run if a valid ObjectId but no category was found
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    color = '#3498db',
    icon = 'folder',
    isDefault = false,
    sortOrder = 0,
    settings,
  } = req.body;

  // Validate required fields
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Check for duplicate category name for this user
  const categoryExists = await Category.findOne({
    user: req.user._id,
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this name already exists');
  }

  const category = new Category({
    name,
    description: description || '',
    color,
    icon,
    user: req.user._id,
    isDefault,
    sortOrder,
    settings: settings || {},
  });

  const createdCategory = await category.save();

  res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    color,
    icon,
    isDefault,
    isActive,
    sortOrder,
    settings,
  } = req.body;

  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    // Check for duplicate name if name is being changed
    if (name && name !== category.name) {
      const duplicateCategory = await Category.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id },
      });

      if (duplicateCategory) {
        res.status(400);
        throw new Error('Category with this name already exists');
      }
    }

    category.name = name || category.name;
    category.description =
      description !== undefined ? description : category.description;
    category.color = color || category.color;
    category.icon = icon || category.icon;
    category.isDefault =
      isDefault !== undefined ? isDefault : category.isDefault;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    category.sortOrder =
      sortOrder !== undefined ? sortOrder : category.sortOrder;
    category.settings =
      settings !== undefined
        ? { ...category.settings, ...settings }
        : category.settings;

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    // Check if category is default
    if (category.isDefault) {
      res.status(400);
      throw new Error('Cannot delete default category');
    }

    // Get task count before deletion
    const taskCount = await Task.countDocuments({
      category: category._id,
      user: req.user._id,
    });

    await Category.deleteOne({ _id: category._id });

    res.json({
      message: 'Category removed successfully',
      deletedCategory: {
        id: category._id,
        name: category.name,
        tasksAffected: taskCount,
      },
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private
const getCategoryStats = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    const stats = await category.getStats();

    res.json({
      category: {
        id: category._id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
      stats,
      generatedAt: new Date(),
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Get tasks by category
// @route   GET /api/categories/:id/tasks
// @access  Private
const getCategoryTasks = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    // Build filters
    const filters = {
      category: category._id,
      user: req.user._id,
      isArchived:
        req.query.includeArchived === 'true' ? { $in: [true, false] } : false,
    };

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.priority) {
      filters.priority = req.query.priority;
    }

    const count = await Task.countDocuments({ ...filters });
    const tasks = await Task.find({ ...filters })
      .populate('category', 'name color icon')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      category: {
        id: category._id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
      tasks,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
      hasMore: page < Math.ceil(count / pageSize),
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Update category task count
// @route   PUT /api/categories/:id/update-count
// @access  Private
const updateCategoryTaskCount = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    const count = await category.updateTaskCount();

    res.json({
      message: 'Category task count updated successfully',
      category: {
        id: category._id,
        name: category.name,
        taskCount: count,
      },
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Toggle category active status
// @route   PUT /api/categories/:id/toggle-active
// @access  Private
const toggleCategoryActive = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (category) {
    category.isActive = !category.isActive;
    const updatedCategory = await category.save();

    res.json({
      message: `Category ${
        category.isActive ? 'activated' : 'deactivated'
      } successfully`,
      category: {
        id: updatedCategory._id,
        name: updatedCategory.name,
        isActive: updatedCategory.isActive,
      },
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create default categories for user
// @route   POST /api/categories/create-defaults
// @access  Private
const createDefaultCategories = asyncHandler(async (req, res) => {
  // Check if user already has default categories
  const existingDefaults = await Category.findOne({
    user: req.user._id,
    isDefault: true,
  });

  if (existingDefaults) {
    res.status(400);
    throw new Error('Default categories already exist for this user');
  }

  const categories = await Category.createDefaultCategories(req.user._id);

  res.status(201).json({
    message: 'Default categories created successfully',
    categories,
    total: categories.length,
  });
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getCategoryTasks,
  updateCategoryTaskCount,
  toggleCategoryActive,
  createDefaultCategories,
};
