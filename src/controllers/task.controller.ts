import { Request, Response } from "express";
import Task, { ITask } from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { Types } from "mongoose";

// Get all tasks for a project or user
export async function tasksGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/auth/login');
        }

        const projectId = req.params.projectId;
        let tasks;
        let project;
        let viewData: any = {
            title: 'My Tasks | TaskWave',
            tasks: [],
            project: null,
            user: res.locals.user
        };

        if (projectId) {
            // Get tasks for a specific project
            project = await Project.findOne({
                _id: new Types.ObjectId(projectId),
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

            tasks = await Task.find({ project: projectId })
                .populate('assignees', 'firstName lastName email avatar')
                .populate('createdBy', 'firstName lastName email avatar')
                .sort({ createdAt: -1 })
                .lean();

            viewData.title = `${project.name} Tasks | TaskWave`;
            viewData.project = project;
        } else {
            // Get all tasks assigned to the user
            tasks = await Task.find({ assignees: userId })
                .populate('project', 'name')
                .populate('assignees', 'firstName lastName email avatar')
                .populate('createdBy', 'firstName lastName email avatar')
                .sort({ dueDate: 1 })
                .lean();
        }

        // Calculate task statistics
        const taskCount = tasks.length;
        const completedTasks = tasks.filter(t => t.isComplete).length;
        const dueSoonTasks = tasks.filter(t => {
            if (!t.dueDate || t.isComplete) return false;
            const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
            const now = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays > 0;
        }).length;

        viewData.tasks = tasks;
        viewData.taskCount = taskCount;
        viewData.completedTasks = completedTasks;
        viewData.dueSoonTasks = dueSoonTasks;

        return res.render("task/tasks", viewData);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).render("error", {
            message: "An error occurred while fetching tasks"
        });
    }
}

// Show form to create a new task
export async function newTaskGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/login');
            return;
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
            res.status(404).render("error", {
                message: "Project not found or you don't have access to it"
            });
            return;
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
export async function newTaskPostController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const projectId = new Types.ObjectId(req.params.projectId);
        const { title, description, status, priority, dueDate, assignees } = req.body;

        // Check if user has access to the project
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
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

        // Redirect back to project page
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'An error occurred while creating the task' });
    }
}

// Get a single task
export async function oneTaskGetController(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.redirect('/login');
            return;
        }

        const taskId = new Types.ObjectId(req.params.taskId);
        
        const task = await Task.findById(taskId).lean();

        if (!task) {
            res.status(404).render("error", {
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
            res.status(404).render("error", {
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
        console.error('Error fetching task:', error);
        res.status(500).render("error", {
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
        console.error('Error updating task status:', error);
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
        console.error('Error updating task:', error);
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
