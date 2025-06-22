import express from "express";
import { 
    editProjectDeleteController, 
    editProjectGetController, 
    editProjectPutController, 
    inviteProjectGetController, 
    inviteProjectPostController, 
    joinProjectGetController, 
    joinProjectPostController, 
    leaveProjectGetController, 
    leaveProjectPostController, 
    newProjectGetController, 
    newProjectPostController, 
    oneProjectGetController, 
    projectsGetController 
} from "../controllers/project.controller.js";

/**
 * Description placeholder
 *
 * @type {*}
 */
const router = express.Router();

router.route("/")
/**
 * @swagger
 * /projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get all projects for current user
 *     description: Retrieves all projects where the user is either the creator or a member, with project statistics
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying user's projects with statistics
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(projectsGetController)

router.route("/new")
/**
 * @swagger
 * /projects/new:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get new project form
 *     description: Renders the form for creating a new project
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: New project form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for creating a new project
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     description: Creates a new project and adds the current user as the owner
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *                 example: "TaskWave Mobile App"
 *               description:
 *                 type: string
 *                 description: Project description
 *                 example: "A mobile application for task management"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 description: Project visibility setting
 *                 example: "public"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Project start date
 *                 example: "2024-01-15"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Project due date
 *                 example: "2024-06-30"
 *     responses:
 *       302:
 *         description: Project created successfully and redirected to project page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects/507f1f77bcf86cd799439011"
 *       400:
 *         description: Validation error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with validation errors
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(newProjectGetController)
    .post(newProjectPostController)

router.route("/:projectId")
/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get a specific project
 *     description: Retrieves a single project with its tasks and statistics
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
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying project details with tasks
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
    .get(oneProjectGetController)

router.route("/:projectId/edit")
/**
 * @swagger
 * /projects/{projectId}/edit:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project edit form
 *     description: Renders the form for editing a project (owner and admin only)
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
 *     responses:
 *       200:
 *         description: Edit form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for editing project
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update project
 *     description: Updates project details (owner and admin only)
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *                 example: "Updated TaskWave Mobile App"
 *               description:
 *                 type: string
 *                 description: Project description
 *                 example: "Updated description for the mobile app"
 *               status:
 *                 type: string
 *                 enum: [active, completed, on-hold, cancelled]
 *                 description: Project status
 *                 example: "active"
 *     responses:
 *       302:
 *         description: Project updated successfully and redirected to project page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects/507f1f77bcf86cd799439011"
 *       400:
 *         description: Validation error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with validation errors
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete project
 *     description: Permanently deletes a project and all its tasks (owner only)
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
 *     responses:
 *       302:
 *         description: Project deleted successfully and redirected to projects list
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(editProjectGetController)
    .put(editProjectPutController)
    .delete(editProjectDeleteController)

router.route("/:projectId/invite")
/**
 * @swagger
 * /projects/{projectId}/invite:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project invitation form
 *     description: Renders the form for inviting users to a project (owner and admin only)
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
 *     responses:
 *       200:
 *         description: Invitation form rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML form for inviting users to project
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags:
 *       - Projects
 *     summary: Send project invitation
 *     description: Sends an invitation email to join the project (owner and admin only)
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
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the person to invite
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 enum: [member, admin]
 *                 description: Role to assign to the invited user
 *                 example: "member"
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with success message
 *       400:
 *         description: Validation error or user already a member
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page with validation errors
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(inviteProjectGetController)
    .post(inviteProjectPostController)

router.route("/:projectId/join")
/**
 * @swagger
 * /projects/{projectId}/join:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project join page
 *     description: Renders the page for joining a project via invitation
 *     security: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Join page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page for joining project
 *       400:
 *         description: Invalid or expired invitation
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags:
 *       - Projects
 *     summary: Join project
 *     description: Processes the request to join a project via invitation
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
 *     responses:
 *       302:
 *         description: Successfully joined project and redirected to project page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects/507f1f77bcf86cd799439011"
 *       400:
 *         description: Invalid invitation or already a member
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(joinProjectGetController)
    .post(joinProjectPostController)

router.route("/:projectId/join/:token")
/**
 * @swagger
 * /projects/{projectId}/join/{token}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project join page with token
 *     description: Renders the page for joining a project using an invitation token
 *     security: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *       - name: token
 *         in: path
 *         required: true
 *         description: Invitation token
 *         schema:
 *           type: string
 *           example: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
 *     responses:
 *       200:
 *         description: Join page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page for joining project with token
 *       400:
 *         description: Invalid or expired invitation token
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags:
 *       - Projects
 *     summary: Join project with token
 *     description: Processes the request to join a project using an invitation token
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
 *       - name: token
 *         in: path
 *         required: true
 *         description: Invitation token
 *         schema:
 *           type: string
 *           example: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
 *     responses:
 *       302:
 *         description: Successfully joined project and redirected to project page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/projects/507f1f77bcf86cd799439011"
 *       400:
 *         description: Invalid invitation token or already a member
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(joinProjectGetController)
    .post(joinProjectPostController)

router.route("/:projectId/leave")
/**
 * @swagger
 * /projects/{projectId}/leave:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project leave confirmation page
 *     description: Renders the confirmation page for leaving a project
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
 *     responses:
 *       200:
 *         description: Leave confirmation page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page for confirming project leave
 *       400:
 *         description: Project owner cannot leave
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags:
 *       - Projects
 *     summary: Leave project
 *     description: Removes the current user from the project (project owner cannot leave)
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
 *     responses:
 *       200:
 *         description: Successfully left the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully left the project"
 *       400:
 *         description: Project owner cannot leave
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project owner cannot leave. Please transfer ownership or delete the project."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project not found or user not a member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project not found or you're not a member"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(leaveProjectGetController)
    .post(leaveProjectPostController)

export default router;