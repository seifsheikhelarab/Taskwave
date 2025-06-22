import express from "express";
import { 
    newTaskGetController, 
    newTaskPostController, 
    oneTaskDeleteController, 
    oneTaskGetController, 
    oneTaskPutController, 
    tasksGetController,
    updateTaskStatusController,
    taskSearchSuggestionsController
} from "../controllers/task.controller.js";

const router = express.Router();

// User's tasks
router.route("/")
/**
 * @swagger
 * /tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks for current user
 *     description: Retrieves all tasks where the user is either the creator or assignee, with filtering, sorting, and search capabilities
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search term to filter tasks by title or description
 *         schema:
 *           type: string
 *         example: "bug fix"
 *       - name: status
 *         in: query
 *         description: Filter tasks by status
 *         schema:
 *           type: string
 *           enum: [todo, inProgress, done, backlog, blocked]
 *         example: "todo"
 *       - name: priority
 *         in: query
 *         description: Filter tasks by priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         example: "high"
 *       - name: sort
 *         in: query
 *         description: Sort tasks by field
 *         schema:
 *           type: string
 *           enum: [dueDate, priority, createdAt]
 *         example: "dueDate"
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying user's tasks with statistics and filtering options
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(tasksGetController);

// Project tasks
router.route("/project/:projectId")
/**
 * @swagger
 * /tasks/project/{projectId}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks for a specific project
 *     description: Retrieves all tasks for a specific project where the user has access, with filtering, sorting, and search capabilities
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *       - name: search
 *         in: query
 *         description: Search term to filter tasks by title or description
 *         schema:
 *           type: string
 *         example: "bug fix"
 *       - name: status
 *         in: query
 *         description: Filter tasks by status
 *         schema:
 *           type: string
 *           enum: [todo, inProgress, done, backlog, blocked]
 *         example: "todo"
 *       - name: priority
 *         in: query
 *         description: Filter tasks by priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         example: "high"
 *       - name: sort
 *         in: query
 *         description: Sort tasks by field
 *         schema:
 *           type: string
 *           enum: [dueDate, priority, createdAt]
 *         example: "dueDate"
 *     responses:
 *       200:
 *         description: Project tasks retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying project tasks with statistics and filtering options
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project not found or access denied
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(tasksGetController);

// Create task for a project
router.route("/project/:projectId/create")
/**
 * @swagger
 * /tasks/project/{projectId}/create:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task for a specific project
 *     description: Creates a new task within a specific project and sends email notifications to assignees
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Fix login bug"
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Users are unable to log in with valid credentials"
 *               status:
 *                 type: string
 *                 enum: [todo, inProgress, done, backlog, blocked]
 *                 description: Task status
 *                 example: "todo"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *                 example: "high"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *                 example: "2024-02-15"
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to assign to the task
 *                 example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *               project:
 *                 type: string
 *                 description: Project ID (should match path parameter)
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       302:
 *         description: Task created successfully and redirected to project page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects/507f1f77bcf86cd799439011"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project not found or you don't have access to it"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .post(newTaskPostController);

// Create task (general)
router.route("/new")
/**
 * @swagger
 * /tasks/new:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get new task form
 *     description: Renders the form for creating a new task with project selection
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: New task form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for creating a new task with project dropdown
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No accessible projects found
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page indicating no projects available
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     description: Creates a new task and sends email notifications to assignees
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Implement user dashboard"
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Create a comprehensive dashboard for users to view their projects and tasks"
 *               status:
 *                 type: string
 *                 enum: [todo, inProgress, done, backlog, blocked]
 *                 description: Task status
 *                 example: "todo"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *                 example: "medium"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *                 example: "2024-03-01"
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to assign to the task
 *                 example: ["507f1f77bcf86cd799439012"]
 *               project:
 *                 type: string
 *                 description: Project ID
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       302:
 *         description: Task created successfully and redirected to project page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects/507f1f77bcf86cd799439011"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project not found or you don't have access to it"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(newTaskGetController)
    .post(newTaskPostController);

// Task search suggestions
router.route("/search/suggestions")
/**
 * @swagger
 * /tasks/search/suggestions:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get task search suggestions
 *     description: Returns task suggestions based on search query for autocomplete functionality
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: Search query (minimum 2 characters)
 *         schema:
 *           type: string
 *           minLength: 2
 *         example: "bug"
 *     responses:
 *       200:
 *         description: Search suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: Task title
 *                         example: "Fix login bug"
 *                       project:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           name:
 *                             type: string
 *                             example: "TaskWave Mobile App"
 *             examples:
 *               suggestions:
 *                 summary: Task suggestions
 *                 value:
 *                   suggestions:
 *                     - title: "Fix login bug"
 *                       project:
 *                         _id: "507f1f77bcf86cd799439011"
 *                         name: "TaskWave Mobile App"
 *                     - title: "Bug in dashboard"
 *                       project:
 *                         _id: "507f1f77bcf86cd799439012"
 *                         name: "Website Redesign"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(taskSearchSuggestionsController);

// Task status update
router.route("/:taskId/status")
/**
 * @swagger
 * /tasks/{taskId}/status:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update task completion status
 *     description: Updates the completion status of a task (only for assigned users)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439014"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isComplete
 *             properties:
 *               isComplete:
 *                 type: boolean
 *                 description: Whether the task is completed
 *                 example: true
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task status updated successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Task not found or user not assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found or you are not assigned to it"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .put(updateTaskStatusController);

router.route("/:taskId")
/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a specific task
 *     description: Retrieves detailed information about a specific task
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439014"
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying task details with edit options
 *       400:
 *         description: Invalid task ID format
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Task not found or access denied
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update task
 *     description: Updates task details (creator or assignee only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439014"
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
 *                 description: Task title
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Updated task description"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *                 example: "2024-03-15"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *                 example: "high"
 *               status:
 *                 type: string
 *                 enum: [todo, inProgress, done, backlog, blocked]
 *                 description: Task status
 *                 example: "inProgress"
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to assign to the task
 *                 example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Task not found or no permission to edit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found or you do not have permission to edit it"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete task
 *     description: Permanently deletes a task (creator only)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439014"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Task not found or no permission to delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found or you do not have permission to delete it"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(oneTaskGetController)
    .put(oneTaskPutController)
    .delete(oneTaskDeleteController);

export default router;