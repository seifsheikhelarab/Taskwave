import { Request, Response } from "express";
import Project from "../models/project.model.js";
import { Types } from "mongoose";

// Get all boards (projects) for the current user
export async function boardsGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).sort({ updatedAt: -1 });

        res.render("project/projects", {
            projects,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.render("project/projects", {
            projects: [],
            errors: [{ msg: 'An error occurred while fetching your boards' }],
            oldInput: {}
        });
    }
}

// Show form to create a new board
export function newBoardGetController(req: Request, res: Response) {
    res.render("project/new", {
        errors: [],
        oldInput: {}
    });
}

// Create a new board
export async function newBoardPostController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const { name, description, visibility } = req.body;

        // Create new project
        const project = await Project.create({
            name,
            description,
            visibility,
            createdBy: userId,
            members: [{
                user: userId,
                role: 'owner'
            }]
        });

        res.redirect(`/projects/${project._id}`);
    } catch (error) {
        console.error('Error creating board:', error);
        res.render("project/new", {
            errors: [{ msg: 'An error occurred while creating the board' }],
            oldInput: req.body
        });
    }
}

// Get a single board
export async function oneBoardGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const projectId = req.params.boardId;
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).populate('members.user', 'firstName lastName email avatar');

        if (!project) {
            return res.status(404).render("error", {
                message: "Board not found or you don't have access to it"
            });
        }

        res.render("project/project", {
            project
        });
    } catch (error) {
        console.error('Error fetching board:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching the board"
        });
    }
}

// Update a board
export async function oneBoardPutController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = req.params.boardId;
        const { name, description, status, visibility } = req.body;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.role': { $in: ['owner', 'admin'] } }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: "Board not found or you don't have permission to update it" });
        }

        // Update project
        project.name = name;
        project.description = description;
        project.status = status;
        project.visibility = visibility;
        await project.save();

        res.json({ message: 'Board updated successfully' });
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ message: 'An error occurred while updating the board' });
    }
}

// Delete a board
export async function oneBoardDeleteController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const projectId = req.params.boardId;
        const project = await Project.findOne({
            _id: projectId,
            createdBy: userId // Only creator can delete
        });

        if (!project) {
            return res.status(404).json({ message: "Board not found or you don't have permission to delete it" });
        }

        await project.deleteOne();
        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ message: 'An error occurred while deleting the board' });
    }
}
