import express from "express";
import { 
    currentUserGetController, 
    settingsDeleteController,
    settingsGetController,
    settingsPutController
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import { avatarUpdate } from "../middleware/user.middleware.js";
import { upload } from "../config/multer.config.js";

const router = express.Router();


// Profile routes
router.route("/profile")
/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user's profile
 *     description: Retrieves the current user's profile information
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
.get(isAuthenticated, currentUserGetController);

// Settings routes
router.route("/settings")
/**
 * @swagger
 * /user/settings:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user settings page
 *     description: Renders the user settings page with profile, security, and notification settings
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User settings page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying user settings with tabs for profile, security, and notifications
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user settings
 *     description: Updates user settings based on the action parameter (profile, password, notifications, two-factor)
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: action
 *         in: path
 *         required: true
 *         description: Type of settings to update
 *         schema:
 *           type: string
 *           enum: [profile, password, notifications, two-factor]
 *           example: "profile"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name (for profile action)
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name (for profile action)
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (for profile action)
 *                 example: "john.doe@example.com"
 *               bio:
 *                 type: string
 *                 description: User's bio (for profile action)
 *                 example: "Software developer passionate about building great products"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: User's avatar image file (for profile action)
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password (for password action)
 *                 example: "currentpassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (for password action)
 *                 example: "newpassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Password confirmation (for password action)
 *                 example: "newpassword123"
 *               emailTaskUpdates:
 *                 type: string
 *                 description: Enable email notifications for task updates (for notifications action)
 *                 example: "on"
 *               emailProjectUpdates:
 *                 type: string
 *                 description: Enable email notifications for project updates (for notifications action)
 *                 example: "on"
 *               emailMentions:
 *                 type: string
 *                 description: Enable email notifications for mentions (for notifications action)
 *                 example: "on"
 *               inAppTaskUpdates:
 *                 type: string
 *                 description: Enable in-app notifications for task updates (for notifications action)
 *                 example: "on"
 *               inAppProjectUpdates:
 *                 type: string
 *                 description: Enable in-app notifications for project updates (for notifications action)
 *                 example: "on"
 *               inAppMentions:
 *                 type: string
 *                 description: Enable in-app notifications for mentions (for notifications action)
 *                 example: "on"
 *               enabled:
 *                 type: string
 *                 description: Enable/disable two-factor authentication (for two-factor action)
 *                 example: "true"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or invalid action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "First name, last name, and email are required"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user account
 *     description: Permanently deletes the current user's account and all associated data
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password for account deletion confirmation
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       400:
 *         description: Password required or incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password is required to delete account"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(isAuthenticated, settingsGetController)
    .put(isAuthenticated, avatarUpdate, settingsPutController)
    .delete(isAuthenticated, settingsDeleteController);

// Specific settings routes
router.route("/settings/profile")
/**
 * @swagger
 * /user/settings/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Updates the user's profile information including avatar upload
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               bio:
 *                 type: string
 *                 description: User's bio
 *                 example: "Software developer passionate about building great products"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: User's avatar image file (JPEG, PNG, GIF, max 5MB)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "First name, last name, and email are required"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .put(isAuthenticated, avatarUpdate, settingsPutController);


router.route("/settings/password")
/**
 * @swagger
 * /user/settings/password:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user password
 *     description: Updates the user's password with current password verification
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password for verification
 *                 example: "currentpassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (minimum 8 characters)
 *                 example: "newpassword123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Password confirmation
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Current password is incorrect"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .put(isAuthenticated, settingsPutController)

export default router;