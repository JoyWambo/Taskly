import { asyncHandler } from '../middleware/utilityMiddleware.js';
import generateToken from '../utils/generateToken.js';
import { generateAvatar, getAvatarVariations } from '../utils/avatarUtils.js';
import User from '../models/userModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Check if account is active
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      avatar: user.avatar,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: generateAvatar(avatar, name, { theme: 'light' }),
    isEmailVerified: false,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const oldName = user.name;
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Handle avatar update - regenerate if name changed or new avatar provided
    if (req.body.avatar || (req.body.name && req.body.name !== oldName)) {
      user.avatar = generateAvatar(req.body.avatar, user.name, {
        theme: user.preferences?.theme,
      });
    }

    // Update preferences if provided
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isActive: updatedUser.isActive,
      avatar: updatedUser.avatar,
      isEmailVerified: updatedUser.isEmailVerified,
      preferences: updatedUser.preferences,
      lastLogin: updatedUser.lastLogin,
      updatedAt: updatedUser.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { email: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await User.countDocuments({ ...keyword });
  const users = await User.find({ ...keyword })
    .select('-password')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    hasMore: page < Math.ceil(count / pageSize),
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }

    // Soft delete by deactivating instead of permanent deletion
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User account deactivated',
      userId: user._id,
      deactivatedAt: new Date(),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const oldName = user.name;
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin =
      req.body.isAdmin !== undefined ? Boolean(req.body.isAdmin) : user.isAdmin;
    user.isActive =
      req.body.isActive !== undefined
        ? Boolean(req.body.isActive)
        : user.isActive;

    // Handle avatar update
    if (req.body.avatar || (req.body.name && req.body.name !== oldName)) {
      user.avatar = generateAvatar(req.body.avatar, user.name, {
        theme: user.preferences?.theme,
      });
    }

    // Update preferences if provided
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isActive: updatedUser.isActive,
      avatar: updatedUser.avatar,
      isEmailVerified: updatedUser.isEmailVerified,
      preferences: updatedUser.preferences,
      lastLogin: updatedUser.lastLogin,
      updatedAt: updatedUser.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateUserPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.preferences = {
      ...user.preferences,
      ...req.body,
    };

    const updatedUser = await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Import Task model here to avoid circular dependency issues
  const Task = (await import('../models/taskModel.js')).default;

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

  const userStats = stats[0] || {
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
  userStats.completionRate =
    userStats.totalTasks > 0
      ? Math.round((userStats.completedTasks / userStats.totalTasks) * 100)
      : 0;

  // Calculate productivity score
  userStats.productivityScore =
    userStats.totalEstimatedHours > 0
      ? Math.round(
          (userStats.totalActualHours / userStats.totalEstimatedHours) * 100
        )
      : 0;

  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    stats: userStats,
    generatedAt: new Date(),
  });
});

// @desc    Reactivate user account
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
const reactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isActive = true;
    await user.save();

    res.json({
      message: 'User account reactivated',
      userId: user._id,
      reactivatedAt: new Date(),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get avatar variations for user
// @route   GET /api/users/avatar-variations
// @access  Private
const getUserAvatarVariations = asyncHandler(async (req, res) => {
  const userName = req.query.name || req.user.name;

  if (!userName) {
    res.status(400);
    throw new Error('Name is required to generate avatar variations');
  }

  const variations = getAvatarVariations(userName);

  res.json({
    name: userName,
    variations,
    totalCount: variations.length,
  });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserStats,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  reactivateUser,
  getUserAvatarVariations,
};
