import express from "express";
import passport from 'passport';
import { 
    loginGetController, 
    loginPostController, 
    logoutController, 
    resetConfirmGetController, 
    resetConfirmPostController, 
    resetGetController, 
    resetPostController, 
    signupGetController, 
    signupPostController,
    googleCallbackController
} from "../controllers/authentication.controller.js";
import { isNotAuthenticated } from "../middleware/authentication.middleware.js";
import { authRateLimit } from "../middleware/ratelimit.middleware.js";

const router = express.Router();

// Regular authentication routes
router.route("/signup")
/**
 * @swagger
 * /auth/signup:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get signup form
 *     description: Renders the user registration form
 *     security: []
 *     responses:
 *       200:
 *         description: Signup form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for user registration
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account and sends verification email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the account
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the account
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the account
 *                 example: "securePassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Password confirmation
 *                 example: "securePassword123"
 *     responses:
 *       302:
 *         description: User registered successfully and redirected to login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/auth/login"
 *       400:
 *         description: Validation error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with validation errors
 *       409:
 *         description: Username or email already exists
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with error message
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(isNotAuthenticated, authRateLimit ,signupGetController)
    .post(isNotAuthenticated, authRateLimit, signupPostController);

router.route("/login")
/**
 * @swagger
 * /auth/login:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get login form
 *     description: Renders the user login form
 *     security: []
 *     responses:
 *       200:
 *         description: Login form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for user login
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate user
 *     description: Authenticates user credentials and creates a session
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password
 *                 example: "securePassword123"
 *               rememberMe:
 *                 type: boolean
 *                 description: Remember user session
 *                 example: true
 *     responses:
 *       302:
 *         description: User authenticated successfully and redirected to dashboard
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with error message
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(isNotAuthenticated, authRateLimit ,loginGetController)
    .post(isNotAuthenticated, authRateLimit, loginPostController);

router.route("/logout")
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Destroys the user session and logs them out
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       302:
 *         description: User logged out successfully and redirected to home page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .post(logoutController);

// Password reset routes
router.route("/reset")
/**
 * @swagger
 * /auth/reset:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get password reset form
 *     description: Renders the password reset request form
 *     security: []
 *     responses:
 *       200:
 *         description: Password reset form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for password reset request
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Sends a password reset email to the user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for password reset
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with success message
 *       400:
 *         description: Invalid email or user not found
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with error message
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(isNotAuthenticated, authRateLimit ,resetGetController)
    .post(isNotAuthenticated, authRateLimit, resetPostController);

router.route("/reset/:id")
/**
 * @swagger
 * /auth/reset/{id}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get password reset confirmation form
 *     description: Renders the password reset confirmation form using the reset token
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *           example: "abc123def456ghi789"
 *     responses:
 *       200:
 *         description: Password reset confirmation form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for password reset confirmation
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with error message
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Confirm password reset
 *     description: Updates the user's password using the reset token
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *           example: "abc123def456ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password
 *                 example: "newSecurePassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: New password confirmation
 *                 example: "newSecurePassword123"
 *     responses:
 *       302:
 *         description: Password updated successfully and redirected to login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/auth/login"
 *       400:
 *         description: Invalid token, password mismatch, or validation error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with error message
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(isNotAuthenticated, authRateLimit ,resetConfirmGetController)
    .post(isNotAuthenticated, authRateLimit, resetConfirmPostController);

// OAuth routes
router.get('/google', isNotAuthenticated, 
/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Google OAuth login
 *     description: Redirects user to Google OAuth for authentication
 *     security: []
 *     responses:
 *       302:
 *         description: Redirected to Google OAuth
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               description: Google OAuth URL
 */
    passport.authenticate('google', { 
        scope: ['profile', 'email']
    })
);

router.get('/google/callback', 
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google OAuth after successful authentication
 *     security: []
 *     parameters:
 *       - name: code
 *         in: query
 *         description: Authorization code from Google
 *         schema:
 *           type: string
 *       - name: state
 *         in: query
 *         description: State parameter for CSRF protection
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: User authenticated successfully and redirected to dashboard, or authentication failed and redirected to login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects" # or "/auth/login" on failure
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    passport.authenticate('google', { 
        failureRedirect: '/auth/login'
    }),
    googleCallbackController
);

export default router;