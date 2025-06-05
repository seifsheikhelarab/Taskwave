import { Request, Response } from "express";
import Project, { IProjectMember } from "../models/project.model.js";
import Task from "../models/task.model.js";
import User, { IUser } from "../models/user.model.js";
import { Types } from "mongoose";

// Type guard function
function isProjectNotNull(project: any): project is NonNullable<typeof project> {
    return project !== null && project !== undefined;
}

// Get all projects for the current user
export async function projectsGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/login');
        }

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
        console.error('Error fetching projects:', error);
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
        if (!userId) {
            return res.redirect('/auth/login');
        }

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
        console.error('Error creating project:', error);
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
        if (!userId) {
            res.redirect('/auth/login');
            return;
        }

        let projectId;
        try {
            projectId = new Types.ObjectId(req.params.projectId);
        } catch (error) {
            res.status(404).render('error', { 
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
            res.status(404).render('error', { 
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
        console.error('Error fetching project:', error);
        res.status(500).render('error', { 
            message: 'An error occurred while fetching the project',
            error: { status: 500 }
        });
    }
}

// Show edit project form
export async function editProjectGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/auth/login');
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!project) {
            res.status(404).render("error", {
                message: "Project not found or you don't have permission to edit it"
            });
        }

        res.render("project/edit", {
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching project for edit:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching the project"
        });
    }
}

// Update project
export async function editProjectPutController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const { name, description, status, visibility } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!isProjectNotNull(project)) {
            res.status(404).json({ message: "Project not found or you don't have permission to update it" });
        }

        // Update project
        project!.name = name;
        project!.description = description;
        project!.status = status;
        project!.visibility = visibility;
        await project!.save();

        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'An error occurred while updating the project' });
    }
}

// Delete project
export async function editProjectDeleteController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/auth/login');
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            createdBy: userId // Only creator can delete
        });

        if (!isProjectNotNull(project)) {
            return res.status(404).render('error', { 
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
        console.error('Error deleting project:', error);
        res.status(500).render('error', { 
            message: 'An error occurred while deleting the project',
            error: { status: 500 }
        });
    }
}

// Show invite form
export async function inviteProjectGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/auth/login');
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!project) {
            res.status(404).render("error", {
                message: "Project not found or you don't have permission to invite members"
            });
        }

        res.render("project/invite", {
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching project for invite:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching the project"
        });
    }
}

// Send invite
export async function inviteProjectPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const { email, role } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!isProjectNotNull(project)) {
            res.status(404).json({ message: "Project not found or you don't have permission to invite members" });
        }

        // Find user by email
        const userDoc = await User.findOne({ email });
        if (!userDoc) {
            res.status(404).json({ message: "User not found" });
        }

        const user = userDoc as unknown as IUser & { _id: Types.ObjectId };

        // Check if user is already a member
        if (project!.members.some(m => m.user.toString() === user._id.toString())) {
            res.status(400).json({ message: "User is already a member of this project" });
        }

        // Add user to project
        const newMember: IProjectMember = {
            user: user._id,
            role: role || 'member',
            joinedAt: new Date()
        };
        
        project!.members.push(newMember);
        await project!.save();

        // TODO: Send email notification

        res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ message: 'An error occurred while sending the invitation' });
    }
}

// Show join project page
export async function joinProjectGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/login');
        }

        const { token } = req.params;
        // TODO: Validate invitation token

        res.render("project/join", {
            token,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error showing join page:', error);
        res.status(500).render("error", {
            message: "An error occurred while processing your request"
        });
    }
}

// Process join request
export async function joinProjectPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const { token } = req.params;
        // TODO: Validate invitation token and add user to project

        res.json({ message: 'Successfully joined the project' });
    } catch (error) {
        console.error('Error joining project:', error);
        res.status(500).json({ message: 'An error occurred while joining the project' });
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
            res.status(404).render("error", {
                message: "Project not found or you're not a member"
            });
        }

        // Check if user is the owner
        if (project!.createdBy.toString() === userId) {
            res.status(400).render("error", {
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
        res.status(500).render("error", {
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
        console.error('Error leaving project:', error);
        res.status(500).json({ message: 'An error occurred while leaving the project' });
    }
}