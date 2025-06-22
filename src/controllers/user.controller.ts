import { Request, Response } from "express";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import { logger } from "../config/logger.config.js";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

// Get current user's profile
export async function currentUserGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;

        const user = await User.findById(userId)
            .select('-password')
            .lean();

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
        logger.error('Error fetching user profile:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while fetching your profile"
        });
    }
}

// Get settings page
export async function settingsGetController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;

        const user = await User.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            res.status(404).render("public/error", {
                message: "User not found"
            });
        }

        res.render("user/settings", {
            user,
            errors: [],
            oldInput: {},
            success: req.query.success || null
        });
    } catch (error) {
        logger.error('Error fetching user settings:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while loading settings"
        });
    }
}

// Update settings (profile, password)
export async function settingsPutController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        
        // Extract action from URL path
        const urlParts = req.url.split('/');
        const action = urlParts[urlParts.length - 1]; // Get the last part of the URL
        const user = await User.findById(userId);
        req.body._method = "PUT";
        switch (action) {
            case 'profile':
                await handleProfileUpdate(req, res, user);
                break;
            case 'password':
                await handlePasswordUpdate(req, res, user);
                break;
            default:
                res.status(400).json({ message: "Invalid action" });
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).render("public/error", {
            message: "An error occurred while updating settings"
        });
    }
}

// Handle profile update
async function handleProfileUpdate(req: Request, res: Response, user: any) {
    try {
        const { firstName, lastName, email } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: "First name, last name, and email are required" });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Update user fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;

        // Handle avatar upload
        if (req.file) {
            // Save the avatar path relative to public, matching OAuth
            const ext = path.extname(req.file.filename) || '.jpg';
            const userId = req.session?.userId || 'user';
            user.avatar = `/avatars/${userId}-avatar${ext}`;
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
        logger.error('Error updating profile:', error);
        res.status(500).json({ message: 'An error occurred while updating profile' });
    }
}

// Handle password update
async function handlePasswordUpdate(req: Request, res: Response, user: any) {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All password fields are required" });
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        // Ensure user has password field
        let userWithPassword = user;
        if (!user.password) {
            userWithPassword = await User.findById(user._id).select('+password');
        }
        if (!userWithPassword) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password using model method
        const isMatch = await userWithPassword.correctPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash and update password
        userWithPassword.password = newPassword;
        await userWithPassword.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'An error occurred while updating password' });
    }
}

// Delete settings (account deletion)
export async function settingsDeleteController(req: Request, res: Response) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }

        const { password } = req.body;
        if (!password) {
            res.status(400).json({ message: "Password is required to delete account" });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isMatch = await user!.correctPassword(password);
        if (!isMatch) {
            res.status(400).json({ message: "Password is incorrect" });
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

        // Delete user's avatar if exists
        if (user!.avatar && user!.avatar.startsWith('/avatars/')) {
            const avatarPath = path.join('public', user!.avatar);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        // Delete the user
        await user!.deleteOne();

        // Clear session
        req.session.destroy((err) => {
            if (err) {
                logger.error('Error destroying session:', err);
            }
        });

        res.json({ message: 'Account deleted successfully' });
        res.redirect('/');
    } catch (error) {
        logger.error('Error deleting user account:', error);
        res.status(500).json({ message: 'An error occurred while deleting your account' });
    }
}