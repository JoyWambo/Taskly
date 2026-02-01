import express from 'express';
const router = express.Router();
import {
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
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkObjectId } from '../middleware/utilityMiddleware.js';

// Routes without ID parameter
/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get user categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: Create new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.route('/').get(protect, getCategories).post(protect, createCategory);

/**
 * @swagger
 * /api/categories/create-defaults:
 *   post:
 *     tags: [Categories]
 *     summary: Create default categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Default categories created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.route('/create-defaults').post(protect, createDefaultCategories);

// Routes with ID parameter - must come after specific routes
router
  .route('/:id')
  .get(protect, checkObjectId, getCategoryById)
  .put(protect, checkObjectId, updateCategory)
  .delete(protect, checkObjectId, deleteCategory);

router.route('/:id/stats').get(protect, checkObjectId, getCategoryStats);

router.route('/:id/tasks').get(protect, checkObjectId, getCategoryTasks);

router
  .route('/:id/update-count')
  .put(protect, checkObjectId, updateCategoryTaskCount);

router
  .route('/:id/toggle-active')
  .put(protect, checkObjectId, toggleCategoryActive);

export default router;
