import express from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import { errorController } from "../controllers/main.controller.js";

import authenticationRouter from "./authentication.routes.js";
import projectRouter from "./project.routes.js";
import taskRouter from "./task.routes.js";
import userRouter from "./user.routes.js";
import publicRouter from "./public.routes.js";

/**
 * Description placeholder
 *
 * @type {*}
 */
export const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session cookie for authentication
 *   responses:
 *     UnauthorizedError:
 *       description: User is not authenticated
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             description: HTML page redirecting to login
 *     ForbiddenError:
 *       description: User does not have permission to access this resource
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             description: HTML page with access denied message
 *     RateLimitError:
 *       description: Too many requests, rate limit exceeded
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             description: HTML page with rate limit message
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         text/html:
 *           schema:
 *             type: string
 *             description: HTML page with error message
 */

// Public routes
/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Public routes accessible without authentication
 *   - name: Authentication
 *     description: User authentication and authorization routes
 *   - name: Projects
 *     description: Project management routes
 *   - name: Tasks
 *     description: Task management routes
 *   - name: Users
 *     description: User profile and settings routes
 */

/**
 * Mounts public routes (accessible without authentication)
 * Includes: home page, about, features, etc.
 */
router.use("/", publicRouter);

/**
 * Mounts authentication routes (accessible without authentication)
 * Includes: login, signup, password reset, OAuth
 */
router.use("/auth", authenticationRouter);

// Protected routes
/**
 * Mounts project routes (requires authentication)
 * Includes: project CRUD operations, project management
 */
router.use("/projects", isAuthenticated, projectRouter);

/**
 * Mounts task routes (requires authentication)
 * Includes: task CRUD operations, task management
 */
router.use("/tasks", isAuthenticated, taskRouter);

/**
 * Mounts user routes (requires authentication)
 * Includes: user profile, settings, preferences
 */
router.use("/user", isAuthenticated, userRouter);

/**
 * Global error handling middleware
 * Catches and handles any unhandled errors in the application
 */
router.use(errorController);