import { Request, Response } from "express";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import { Types } from "mongoose";
import Invitation from '../models/invitation.model.js';
import crypto from 'crypto';
import { emailService } from '../services/email.service.js';
import { logger } from "../config/logger.config.js";
import User from "../models/user.model.js";

// Type guard function
function isProjectNotNull(project: any): project is NonNullable<typeof project> {
    return project !== null && project !== undefined;
}

// Get all projects for the current user
export async function projectsGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;

        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        })
        .populate('members.user', 'firstName lastName email avatar')
        .sort({ updatedAt: -1 });

        // Calculate project statistics
        const projectsWithStats = await Promise.all(projects.map(async (project) => {
            const tasks = await Task.find({ project: project._id });
            const completedTasks = tasks.filter(t => t.isComplete).length;
            const dueSoonTasks = tasks.filter(t => {
                if (!t.dueDate || t.isComplete) {
                    return false;
                }
                const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
                const now = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && diffDays > 0;
            }).length;
            const overdueTasks = tasks.filter(t => {
                if (!t.dueDate || t.isComplete) {
                    return false;
                }
                const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
                return dueDate < new Date();
            }).length;

            const projectStats = {
                ...project.toObject(),
                taskCount: tasks.length,
                completedTasks,
                dueSoonTasks,
                overdueTasks
            };

            return projectStats;
        }));

        res.render("project/projects", {
            projects: projectsWithStats,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error fetching projects:', error);
        res.render("project/projects", {
            projects: [],
            errors: [{ msg: 'An error occurred while fetching your projects' }],
            oldInput: {}
        });
    }
}

// Show form to create a new project
export function newProjectGetController(req: Request, res: Response) {
    res.render("project/new", {
        errors: [],
        oldInput: {}
    });
}

// Create a new project
export async function newProjectPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        const { name, description, visibility, startDate, dueDate } = req.body;

        // Validate required fields
        if (!name) {
            return res.render("project/new", {
                errors: [{ msg: 'Project name is required' }],
                oldInput: req.body
            });
        }

        // Create new project
        const project = await Project.create({
            name,
            description,
            visibility: visibility || 'public',
            status: 'active',
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
            createdBy: userId,
            members: [{
                user: userId,
                role: 'owner',
                joinedAt: new Date()
            }],
            settings: {
                taskPrefix: 'TASK',
                defaultTaskStatus: 'todo'
            }
        });

        res.redirect(`/projects/${project._id}`);
    } catch (error) {
        logger.error('Error creating project:', error);
        res.render("project/new", {
            errors: [{ msg: 'An error occurred while creating the project' }],
            oldInput: req.body
        });
    }
}

// Get a single project
export async function oneProjectGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        let projectId;
        try {
            projectId = new Types.ObjectId(req.params.projectId);
        } catch (error) {
            res.status(404).render('public/error', { 
                message: 'Project not found',
                error: { status: 404 }
            });
            return;
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).populate('members.user', 'firstName lastName email avatar');

        if (!project) {
            res.status(404).render('public/error', { 
                message: 'Project not found or you do not have access to it',
                error: { status: 404 }
            });
            return;
        }

        // Get project tasks
        const tasks = await Task.find({ project: projectId })
            .populate('assignees', 'firstName lastName email avatar')
            .populate('createdBy', 'firstName lastName email avatar')
            .sort({ createdAt: -1 });

        // Calculate project statistics
        const taskCount = tasks.length;
        const completedTasks = tasks.filter(t => t.isComplete).length;
        const dueSoonTasks = tasks.filter(t => {
            if (!t.dueDate || t.isComplete) return false;
            const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
            const now = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays > 0;
        }).length;

        // Add tasks and stats to project object
        const projectWithTasks = {
            ...project.toObject(),
            tasks,
            taskCount,
            completedTasks,
            dueSoonTasks
        };

        res.render('project/project', {
            title: project.name,
            project: projectWithTasks,
            user: res.locals.user
        });
    } catch (error) {
        logger.error('Error fetching project:', error);
        res.status(500).render('public/error', { 
            message: 'An error occurred while fetching the project',
            error: { status: 500 }
        });
    }
}

// Show edit project form
export async function editProjectGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        
        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!project) {
            res.status(404).render("public/error", {
                message: "Project not found or you don't have permission to edit it"
            });
        }

        res.render("project/edit", {
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error fetching project for edit:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while fetching the project"
        });
    }
}

// Update project
export async function editProjectPutController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        const projectId = new Types.ObjectId(req.params.projectId);
        const { name, description, status } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!isProjectNotNull(project)) {
            res.render("project/edit", {
            project,
            errors: ["Project not found or you don't have permission to update it"],
            oldInput: {}
        });
        }

        // Update project
        project!.name = name;
        project!.description = description;
        project!.status = status;
        await project!.save();

        res.redirect(`/projects/${projectId}`);

    } catch (error) {
        logger.error('Error updating project:', error);
        res.render("project/edit", {
            errors: ["An error occurred while updating the project"],
            oldInput: {}
        });
    }
}

// Delete project
export async function editProjectDeleteController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            createdBy: userId // Only creator can delete
        });

        if (!isProjectNotNull(project)) {
            return res.status(404).render('public/error', { 
                message: "Project not found or you don't have permission to delete it",
                error: { status: 404 }
            });
        }

        // Delete all tasks associated with the project
        await Task.deleteMany({ project: projectId });
        
        // Delete the project
        await project!.deleteOne();

        res.redirect('/projects');
    } catch (error) {
        logger.error('Error deleting project:', error);
        res.status(500).render('public/error', { 
            message: 'An error occurred while deleting the project',
            error: { status: 500 }
        });
    }
}

// Show invite form
export async function inviteProjectGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;

        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        }).populate('members.user', 'firstName lastName email avatar');

        if (!project) {
            res.status(404).render("public/error", {
                message: "Project not found or you don't have permission to invite members"
            });
            return;
        }

        res.render("project/invite", {
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error fetching project for invite:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while fetching the project"
        });
    }
}

// Send invite
export async function inviteProjectPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        const projectId = new Types.ObjectId(req.params.projectId);
        const { email, role } = req.body;

        // Validate input
        const errors = [];
        if (!email) {
            errors.push({ msg: 'Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push({ msg: 'Please enter a valid email address' });
        }
        if (!role) {
            errors.push({ msg: 'Role is required' });
        } else if (!['member', 'admin'].includes(role)) {
            errors.push({ msg: 'Invalid role selected' });
        }

        if (errors.length > 0) {
            const project = await Project.findById(projectId).populate('members.user', 'firstName lastName email avatar');
            return res.render("project/invite", {
                project,
                errors,
                oldInput: req.body
            });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!project) {
            return res.status(404).render("public/error", {
                message: "Project not found or you don't have permission to invite members"
            });
        }

        // Check if user is trying to invite themselves
        const userDoc = await User.findOne({ email });
        if (userDoc && userDoc._id.toString() === userId) {
            const project = await Project.findById(projectId).populate('members.user', 'firstName lastName email avatar');
            return res.render("project/invite", {
                project,
                errors: [{ msg: "You cannot invite yourself to your own project." }],
                oldInput: req.body
            });
        }
        // Check if user is already a member
        if (userDoc && project.members.some(m => (m.user._id ? m.user._id.toString() : m.user.toString()) === userDoc._id.toString())) {
            const project = await Project.findById(projectId).populate('members.user', 'firstName lastName email avatar');
            return res.render("project/invite", {
                project,
                errors: [{ msg: "User is already a member of this project" }],
                oldInput: req.body
            });
        }

        // Create invitation
        const token = crypto.randomBytes(32).toString('hex');

        // Save invitation to database
        await Invitation.create({
            project: projectId,
            email: email.toLowerCase(),
            role: role,
            token: token,
            invitedBy: userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        // Send invitation email
        const joinLink = `${process.env.BASE_URL}/projects/${project._id}/join/${token}`;
        const inviter = await User.findById(userId);
        if (inviter) {
            await emailService.sendProjectInvitationEmail(email, project, inviter, joinLink);
        }

        // Redirect back to invite page with success message
        const projectWithMembers = await Project.findById(projectId).populate('members.user', 'firstName lastName email avatar');
        res.render("project/invite", {
            project: projectWithMembers,
            success: "Invitation sent successfully",
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error sending invitation:', error);
        const project = await Project.findById(req.params.projectId).populate('members.user', 'firstName lastName email avatar');
        res.render("project/invite", {
            project,
            errors: [{ msg: 'An error occurred while sending the invitation' }],
            oldInput: req.body
        });
    }
}

// Show join project page
export async function joinProjectGetController(req: Request, res: Response) {
    try {
        const { projectId, token } = req.params;
        
        // Log the request details for debugging
        logger.info(`Join project request - ProjectId: ${projectId}, Token: ${token}`);
        
        // First check if the invitation exists at all
        const invitation = await Invitation.findOne({ project: projectId, token });
        
        if (!invitation) {
            logger.warn(`Invitation not found - ProjectId: ${projectId}, Token: ${token}`);
            return res.status(400).render('public/error', { message: 'Invalid or expired invitation link.' });
        }
        
        // Log invitation details for debugging
        logger.info(`Invitation found - Status: ${invitation.status}, ExpiresAt: ${invitation.expiresAt}, Current time: ${new Date()}`);
        
        // Check if invitation is pending and not expired
        if (invitation.status !== 'pending') {
            logger.warn(`Invitation status is not pending - Status: ${invitation.status}`);
            return res.status(400).render('public/error', { message: 'This invitation has already been used or is no longer valid.' });
        }
        
        if (invitation.expiresAt < new Date()) {
            logger.warn(`Invitation has expired - ExpiresAt: ${invitation.expiresAt}, Current time: ${new Date()}`);
            return res.status(400).render('public/error', { message: 'This invitation has expired.' });
        }
        
        res.render('project/join', { token, projectId, email: invitation.email, errors: [], oldInput: {} });
    } catch (error) {
        logger.error('Error showing join page:', error);
        res.status(500).render('public/error', { message: 'An error occurred while processing your request' });
    }
}

// Process join request
export async function joinProjectPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }
        const { projectId, token } = req.params;
        const invitation = await Invitation.findOne({ project: projectId, token, status: 'pending', expiresAt: { $gt: new Date() } });
        if (!invitation) {
            res.status(400).render('public/error', { message: 'Invalid or expired invitation link.' });
        }
        // Add user to project
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).render('public/error', { message: 'Project not found.' });
        }
        if (project!.members.some(m => m.user.toString() === userId)) {
            res.status(400).render('public/error', { message: 'You are already a member of this project.' });
        }
        project!.members.push({ user: new Types.ObjectId(userId), role: invitation!.role, joinedAt: new Date() });
        await project!.save();
        invitation!.status = 'accepted';
        await invitation!.save();
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        logger.error('Error joining project:', error);
        res.status(500).render('public/error', { message: 'An error occurred while joining the project' });
    }
}

// Leave project
export async function leaveProjectGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/login');
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            'members.user': userId
        });

        if (!isProjectNotNull(project)) {
            res.status(404).render("public/error", {
                message: "Project not found or you're not a member"
            });
        }

        // Check if user is the owner
        if (project!.createdBy.toString() === userId) {
            res.status(400).render("public/error", {
                message: "Project owner cannot leave. Please transfer ownership or delete the project."
            });
        }

        res.render("project/leave", {
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error showing leave page:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while processing your request"
        });
    }
}

// Process leave request
export async function leaveProjectPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            'members.user': userId
        });

        if (!isProjectNotNull(project)) {
            res.status(404).json({ message: "Project not found or you're not a member" });
        }

        // Check if user is the owner
        if (project!.createdBy.toString() === userId) {
            res.status(400).json({ 
                message: "Project owner cannot leave. Please transfer ownership or delete the project."
            });
        }

        // Remove user from project
        project!.members = project!.members.filter(m => m.user.toString() !== userId);
        await project!.save();

        res.json({ message: 'Successfully left the project' });
    } catch (error) {
        logger.error('Error leaving project:', error);
        res.status(500).json({ message: 'An error occurred while leaving the project' });
    }
}