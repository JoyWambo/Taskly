import express from 'express';
const router = express.Router();
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  getOverdueTasks,
  toggleTaskArchive,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkObjectId } from '../middleware/utilityMiddleware.js';

// Routes without ID parameter - must come before /:id routes
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get user tasks with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *       - name: priority
 *         in: query
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     pages:
 *                       type: number
 *                     total:
 *                       type: number
 *   post:
 *     tags: [Tasks]
 *     summary: Create new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 default: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.route('/').get(protect, getTasks).post(protect, createTask);

/**
 * @swagger
 * /api/tasks/overdue:
 *   get:
 *     tags: [Tasks]
 *     summary: Get overdue tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.route('/overdue').get(protect, getOverdueTasks);

router.route('/stats').get(protect, getTaskStats);

// Routes with ID parameter - must come after specific routes
router
  .route('/:id')
  .get(protect, checkObjectId, getTaskById)
  .put(protect, checkObjectId, updateTask)
  .delete(protect, checkObjectId, deleteTask);

router.route('/:id/comments').post(protect, checkObjectId, addTaskComment);

router.route('/:id/archive').put(protect, checkObjectId, toggleTaskArchive);

export default router;
