import { Request, Response } from "express";
import Task, { ITask } from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { Types } from "mongoose";

// Get all tasks for a project
export async function tasksGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        
        // Check if user has access to the project
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        });

        if (!project) {
            return res.status(404).render("error", {
                message: "Project not found or you don't have access to it"
            });
        }

        const tasks = await Task.find({ project: projectId })
            .sort({ createdAt: -1 })
            .lean();

        res.render("task/tasks", {
            tasks,
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching tasks"
        });
    }
}

// Show form to create a new task
export async function newTaskGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        
        // Check if user has access to the project
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).populate('members.user', 'firstName lastName email avatar');

        if (!project) {
            return res.status(404).render("error", {
                message: "Project not found or you don't have access to it"
            });
        }

        res.render("task/new", {
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error showing new task form:', error);
        res.status(500).render("error", {
            message: "An error occurred while loading the form"
        });
    }
}

// Create a new task
export async function newTaskPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const { title, description, status, priority, dueDate, assignees, labels } = req.body;

        // Check if user has access to the project
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found or you don't have access to it" });
        }

        // Create new task
        const task = await Task.create({
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            project: projectId,
            createdBy: userId,
            assignees: assignees ? assignees.map((id: string) => new Types.ObjectId(id)) : [],
            labels: labels || []
        });

        res.json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'An error occurred while creating the task' });
    }
}

// Get a single task
export async function oneTaskGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const taskId = new Types.ObjectId(req.params.taskId);
        
        const task = await Task.findById(taskId).lean();

        if (!task) {
            return res.status(404).render("error", {
                message: "Task not found"
            });
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
            return res.status(404).render("error", {
                message: "You don't have access to this task"
            });
        }

        res.render("task/task", {
            task,
            project,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching the task"
        });
    }
}

// Update a task
export async function oneTaskPutController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = new Types.ObjectId(req.params.taskId);
        const { title, description, status, priority, dueDate, assignees, labels, isComplete } = req.body;

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
            return res.status(404).json({ message: "You don't have permission to update this task" });
        }

        // Update task fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (status && ['todo', 'inProgress', 'done', 'backlog', 'blocked'].includes(status)) {
            task.status = status;
        }
        if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
            task.priority = priority;
        }
        if (dueDate) task.dueDate = new Date(dueDate);
        if (assignees) {
            task.assignees = assignees.map((id: string) => new Types.ObjectId(id));
        }
        if (labels) task.labels = labels;
        if (typeof isComplete === 'boolean') {
            task.isComplete = isComplete;
            if (isComplete) {
                task.completedAt = new Date();
            } else {
                task.completedAt = undefined;
            }
        }

        await task.save();

        res.json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'An error occurred while updating the task' });
    }
}

// Delete a task
export async function oneTaskDeleteController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const taskId = new Types.ObjectId(req.params.taskId);
        
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
            return res.status(404).json({ message: "You don't have permission to delete this task" });
        }

        await task.deleteOne();

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
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
        console.error('Error assigning users to task:', error);
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

        res.json({
            message: 'Task status updated successfully',
            task
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'An error occurred while updating the task status' });
    }
}
