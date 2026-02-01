import jwt from 'jsonwebtoken';
import { asyncHandler } from './utilityMiddleware.js';
import User from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first, then Authorization header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and check if account is active
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (!user.isActive) {
        res.status(401);
        throw new Error('Account has been deactivated');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// User must be an admin
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin && req.user.isActive) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
});

// Check if user owns the resource or is admin
const ownerOrAdmin = asyncHandler(async (req, res, next) => {
  if (
    req.user &&
    (req.user.isAdmin || req.user._id.toString() === req.params.userId)
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this resource');
  }
});

export { protect, admin, ownerOrAdmin };
