import { Request, Response } from "express";
import User, { IUser } from "../models/user.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import bcrypt from "bcrypt";

// Get current user's profile
export async function currentUserGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).render("error", {
                message: "User not found"
            });
        }

        // Get user's projects
        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        })
        .select('name description status')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

        // Get user's tasks
        const tasks = await Task.find({
            assignees: userId
        })
        .select('title description status dueDate')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean();

        res.render("user/profile", {
            user,
            projects,
            tasks,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching your profile"
        });
    }
}

// Update current user's profile
export async function currentUserPutController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { firstName, lastName, email, currentPassword, newPassword, avatar } = req.body;

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update basic info
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;

        // Update password if provided
        if (typeof currentPassword === 'string' && typeof newPassword === 'string') {
            const isMatch = await user.correctPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            user.password = newPassword; // The pre-save hook will hash it
        }

        await user.save();

        res.json({ 
            message: 'Profile updated successfully',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'An error occurred while updating your profile' });
    }
}

// Delete current user's account
export async function currentUserDeleteController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { password } = req.body;
        if (typeof password !== 'string') {
            return res.status(400).json({ message: "Password is required to delete account" });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isMatch = await user.correctPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        // Delete user's projects where they are the owner
        await Project.deleteMany({ createdBy: userId });

        // Remove user from all projects where they are a member
        await Project.updateMany(
            { 'members.user': userId },
            { $pull: { members: { user: userId } } }
        );

        // Delete user's tasks
        await Task.deleteMany({ createdBy: userId });

        // Remove user from all assigned tasks
        await Task.updateMany(
            { assignees: userId },
            { $pull: { assignees: userId } }
        );

        // Delete the user
        await user.deleteOne();

        // Clear session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ message: 'An error occurred while deleting your account' });
    }
}

// Get public user profile
export async function publicUserGetController(req: Request, res: Response) {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).render("error", {
                message: "User ID is required"
            });
        }

        const user = await User.findById(userId)
            .select('firstName lastName avatar bio')
            .lean();

        if (!user) {
            return res.status(404).render("error", {
                message: "User not found"
            });
        }

        // Get user's public projects
        const projects = await Project.find({
            createdBy: userId,
            visibility: 'public'
        })
        .select('name description status')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

        res.render("user/public-profile", {
            user,
            projects,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Error fetching public user profile:', error);
        res.status(500).render("error", {
            message: "An error occurred while fetching the user profile"
        });
    }
}