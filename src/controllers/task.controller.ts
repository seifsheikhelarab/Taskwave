import { Request, Response } from "express";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { Types } from "mongoose";
import { emailService } from "../services/email.service.js";
import { logger } from "../config/logger.config.js";

// Get all tasks
export async function tasksGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        
        const { search, status, priority, sort } = req.query;
        const projectId = req.params.projectId;

        // Build query
        const query: any = {
            $or: [
                { createdBy: userId },
                { assignees: userId }
            ]
        };

        // Add project filter if specified
        if (projectId) {
            query.project = new Types.ObjectId(projectId);
        }

        // Add search filter
        if (search) {
            query.$and = [
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        // Add status filter
        if (status) {
            query.status = status;
        }

        // Add priority filter
        if (priority) {
            query.priority = priority;
        }

        // Build sort object
        let sortObj: any = { createdAt: -1 }; // Default sort
        if (sort) {
            switch (sort) {
                case 'dueDate':
                    sortObj = { dueDate: 1 };
                    break;
                case 'priority':
                    sortObj = { 
                        priority: {
                            $cond: {
                                if: { $eq: ['$priority', 'high'] },
                                then: 1,
                                else: {
                                    $cond: {
                                        if: { $eq: ['$priority', 'medium'] },
                                        then: 2,
                                        else: 3
                                    }
                                }
                            }
                        }
                    };
                    break;
                case 'createdAt':
                    sortObj = { createdAt: -1 };
                    break;
            }
        }

        const tasks = await Task.find(query)
            .sort(sortObj)
            .populate('project', 'name')
            .populate('assignees', 'firstName lastName email avatar')
            .lean();

        // Get project if projectId is specified
        let project = null;
        if (projectId) {
            project = await Project.findById(projectId)
                .populate('members.user', 'firstName lastName email avatar')
                .lean();
        }

        // Calculate task statistics
        const taskCount = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'inProgress').length;
        const todoTasks = tasks.filter(t => t.status === 'todo').length;
        
        // Calculate due soon tasks (due within 7 days and not completed)
        const dueSoonTasks = tasks.filter(t => {
            if (!t.dueDate || t.status === 'done') return false;
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays > 0;
        }).length;

        res.render("task/tasks", {
            title: project ? `${project.name} Tasks` : 'My Tasks',
            tasks,
            project,
            query: req.query,
            taskCount,
            completedTasks,
            inProgressTasks,
            todoTasks,
            dueSoonTasks,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error fetching tasks:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while fetching tasks"
        });
    }
}

// Show form to create a new task
export async function newTaskGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;

        // Get all projects the user has access to
        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).populate('members.user', 'firstName lastName email avatar');

        if (!projects || projects.length === 0) {
            res.status(404).render("public/error", {
                message: "You don't have access to any projects. Please create or join a project first."
            });
            return;
        }

        res.render("task/new", {
            projects,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error showing new task form:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while loading the form"
        });
    }
}

// Create a new task
export async function newTaskPostController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).redirect("/error");
            return;
        }
        const userIdObj = new Types.ObjectId(req.session.userId);
        const projectId = new Types.ObjectId(req.body.project);

        const { title, description, status, priority, dueDate, assignees } = req.body;

        // Check if user has access to the project
        const project = await Project.findOne({
            _id: projectId,
            createdBy: userIdObj,
        });

        if (!project) {
            res.status(404).json({ message: "Project not found or you don't have access to it" });
            return;
        }

        // Get the current task count for the project
        const taskCount = await Task.countDocuments({ project: projectId });

        // Handle assignees - convert to array if single value
        const assigneeIds = assignees ? (Array.isArray(assignees) ? assignees : [assignees]).filter(Boolean) : [];

        // Create new task
        const task = await Task.create({
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            project: projectId,
            createdBy: userId,
            assignees: assigneeIds.map(id => new Types.ObjectId(id)),
            taskNumber: taskCount + 1,
            taskId: `${project.settings.taskPrefix}-${taskCount + 1}`
        });

        // Send emails to assignees
        if (assignees && assignees.length > 0) {
            const project = await Project.findById(projectId).select('name').lean();
            const assigneeUsers = await User.find({ _id: { $in: assignees } }).select('email').lean();
            
            for (const assignee of assigneeUsers) {
                await emailService.sendTaskAssignmentEmail(assignee.email, task, project);
            }
        }

        // Redirect back to project page
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({ message: 'An error occurred while creating the task' });
    }
}

// Get a single task
export async function oneTaskGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;

        let taskId;
        try {
            taskId = new Types.ObjectId(req.params.taskId);
        } catch (error) {
            return res.status(400).render("public/error", {
                message: "Invalid task ID format"
            });
        }
        
        const task = await Task.findById(taskId).lean();

        if (!task) {
            res.status(404).render("public/error", {
                message: "Task not found"
            });
            return;
        }

        // Check if user has access to the project
        const project = await Project.findOne({
            _id: task.project,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        });

        if (!project) {
            res.status(404).render("public/error", {
                message: "You don't have access to this task"
            });
            return;
        }

        res.render("task/task", {
            task,
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        logger.error('Error fetching task:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while fetching the task"
        });
    }
}

// Update task status
export async function updateTaskStatusController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const { taskId } = req.params;
        const { isComplete } = req.body;

        const task = await Task.findOne({
            _id: taskId,
            assignees: userId
        });

        if (!task) {
            res.status(404).json({ message: 'Task not found or you are not assigned to it' });
        }

        task!.isComplete = isComplete;
        task!.status = isComplete ? 'done' : 'todo';
        task!.completedAt = isComplete ? new Date() : undefined;
        await task!.save();

        res.json({ message: 'Task status updated successfully' });
    } catch (error) {
        logger.error('Error updating task status:', error);
        res.status(500).json({ message: 'An error occurred while updating task status' });
    }
}

// Update task
export async function oneTaskPutController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const { taskId } = req.params;
        const { title, description, dueDate, priority, status, assignees } = req.body;

        const task = await Task.findOne({
            _id: taskId,
            $or: [
                { createdBy: userId },
                { assignees: userId }
            ]
        });

        if (!task) {
            res.status(404).json({ message: 'Task not found or you do not have permission to edit it' });
        }

        // Update task fields
        task!.title = title;
        task!.description = description;
        task!.dueDate = dueDate ? new Date(dueDate) : undefined;
        task!.priority = priority;
        task!.status = status;
        
        // Handle assignees
        if (assignees) {
            const assigneeIds = Array.isArray(assignees) ? assignees : [assignees];
            task!.assignees = assigneeIds.map(id => new Types.ObjectId(id));
        }

        await task!.save();

        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).json({ message: 'An error occurred while updating the task' });
    }
}

// Delete task
export async function oneTaskDeleteController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const { taskId } = req.params;

        const task = await Task.findOne({
            _id: taskId,
            createdBy: userId
        });

        if (!task) {
            res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
        }

        await task!.deleteOne();

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        logger.error('Error deleting task:', error);
        res.status(500).json({ message: 'An error occurred while deleting the task' });
    }
}

// Assign users to a task
export async function assignTaskPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = new Types.ObjectId(req.params.taskId);
        const { assignees } = req.body;

        if (!Array.isArray(assignees)) {
            return res.status(400).json({ message: "Assignees must be an array" });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user has access to the project
        const project = await Project.findOne({
            _id: task.project,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: "You don't have permission to assign users to this task" });
        }

        // Verify all assignees are project members
        const projectMemberIds = project.members.map(m => m.user);
        const validAssignees = await User.find({
            _id: { $in: assignees.filter(id => projectMemberIds.includes(id)) }
        });

        if (validAssignees.length !== assignees.length) {
            return res.status(400).json({ message: "Some assignees are not project members" });
        }

        task.assignees = assignees.map((id: string) => new Types.ObjectId(id));
        await task.save();

        res.json({
            message: 'Task assignees updated successfully',
            task
        });
    } catch (error) {
        logger.error('Error assigning users to task:', error);
        res.status(500).json({ message: 'An error occurred while assigning users to the task' });
    }
}

// Update task status
export async function updateTaskStatusPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = new Types.ObjectId(req.params.taskId);
        const { status } = req.body;

        if (!['todo', 'inProgress', 'done', 'backlog', 'blocked'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user has access to the project
        const project = await Project.findOne({
            _id: task.project,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: "You don't have permission to update this task" });
        }

        task.status = status;
        if (status === 'done') {
            task.isComplete = true;
            task.completedAt = new Date();
        } else {
            task.isComplete = false;
            task.completedAt = undefined;
        }
        await task.save();

        // Send emails for status change
        if (status !== task.status) {
            const project = await Project.findById(task.project).select('name').lean();
            const assigneeUsers = await User.find({ _id: { $in: task.assignees } }).select('email').lean();
            
            for (const assignee of assigneeUsers) {
                await emailService.sendTaskStatusUpdateEmail(assignee.email, task, project);
            }
        }

        res.json({
            message: 'Task status updated successfully',
            task
        });
    } catch (error) {
        logger.error('Error updating task status:', error);
        res.status(500).json({ message: 'An error occurred while updating the task status' });
    }
}

// Get search suggestions
export async function taskSearchSuggestionsController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const query = req.query.q as string;
        if (!query || query.length < 2) {
            res.json({ suggestions: [] });
            return;
        }

        const tasks = await Task.find({
            $or: [
                { createdBy: userId },
                { assignees: userId }
            ],
            $and: [
                {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .populate('project', 'name')
        .limit(5)
        .lean();

        const suggestions = tasks.map(task => ({
            title: task.title,
            project: task.project
        }));

        res.json({ suggestions });
    } catch (error) {
        logger.error('Error fetching search suggestions:', error);
        res.status(500).json({ message: 'An error occurred while fetching suggestions' });
    }
}

// Create task
export async function taskCreatePostController(req: Request, res: Response): Promise<void> {
    try {
        const { title, description, priority, dueDate, projectId, assignees } = req.body;
        const userId = req.session.userId;


        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            project: projectId,
            createdBy: userId,
            assignees: assignees || []
        });

        // Send emails to assignees
        if (assignees && assignees.length > 0) {
            const project = await Project.findById(projectId).select('name').lean();
            const assigneeUsers = await User.find({ _id: { $in: assignees } }).select('email').lean();
            
            for (const assignee of assigneeUsers) {
                await emailService.sendTaskAssignmentEmail(assignee.email, task, project);
            }
        }

        res.redirect('/tasks');
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while creating task"
        });
    }
}

// Update task
export async function taskUpdatePostController(req: Request, res: Response): Promise<void> {
    try {
        const { title, description, priority, dueDate, status, assignees } = req.body;
        const taskId = req.params.id;
        const userId = req.session.userId;


        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).render("public/error", {
                message: "Task not found"
            });
            return;
        }

        // Check if status changed
        const statusChanged = task.status !== status;

        // Update task
        task.title = title;
        task.description = description;
        task.priority = priority;
        task.dueDate = dueDate;
        task.status = status;
        task.assignees = assignees || [];

        await task.save();

        // Send emails for status change
        if (statusChanged) {
            const project = await Project.findById(task.project).select('name').lean();
            const assigneeUsers = await User.find({ _id: { $in: task.assignees } }).select('email').lean();
            
            for (const assignee of assigneeUsers) {
                await emailService.sendTaskStatusUpdateEmail(assignee.email, task, project);
            }
        }

        res.redirect('/tasks');
    } catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while updating task"
        });
    }
}
