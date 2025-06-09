import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model.js';
import { emailService } from '../services/email.service.js';
import { logger } from '../config/logger.config.js';
import { Types } from 'mongoose';
import { emailTemplates } from '../config/mail.config.js';

// Extend Express Session interface
declare module 'express-session' {
    interface SessionData {
        userId: string;
        isAuthenticated: boolean;
    }
}

// Signup
export const signupGetController = (req: Request, res: Response) => {
    res.render("authentication/signup", {
        errors: [],
        oldInput: {}
    });
};

export const signupPostController = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("authentication/signup", {
                errors: [{ msg: 'Email already in use' }],
                oldInput: req.body
            });
        }

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        // Log user in
        req.session.userId = (user._id as Types.ObjectId).toString();
        
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Signup error:', error);
        res.render("authentication/signup", {
            errors: [{ msg: 'An error occurred during signup' }],
            oldInput: req.body
        });
    }
};

// Login
export const loginGetController = (req: Request, res: Response) => {
    res.render("authentication/login", {
        errors: [],
        oldInput: {}
    });
};

export const loginPostController = async (req: Request, res: Response) => {
    try {
        const { email, password, remember } = req.body;

        // Find user and check password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password))) {
            return res.render("authentication/login", {
                errors: [{ msg: 'Invalid email or password' }],
                oldInput: req.body
            });
        }

        // Set session
        req.session.userId = (user._id as Types.ObjectId).toString();
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.redirect('/user/profile');
    } catch (error) {
        console.error('Login error:', error);
        res.render("authentication/login", {
            errors: [{ msg: 'An error occurred during login' }],
            oldInput: req.body
        });
    }
};

// Logout
export const logoutController = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};

// Password Reset
export const resetGetController = (req: Request, res: Response) => {
    res.render("authentication/reset", {
        errors: [],
        oldInput: {}
    });
};

export const resetPostController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not
            return res.render('authentication/reset', {
                success: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        // Send reset email
        const resetUrl = `${process.env.APP_URL}/auth/reset/${user._id}`;
        await emailService.sendEmail(
            user.email,
            emailTemplates.passwordReset(resetUrl).subject,
            emailTemplates.passwordReset(resetUrl).html,
        );

        res.render('authentication/reset', {
            success: 'If an account exists with this email, you will receive a password reset link.'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.render('authentication/reset', {
            error: 'An error occurred. Please try again.'
        });
    }
};

export const resetConfirmGetController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.render('authentication/reset', {
                error: 'Invalid or expired reset link.'
            });
        }

        res.render('authentication/reset-confirm', { userId: id });
    } catch (error) {
        console.error('Show reset form error:', error);
        res.render('authentication/reset', {
            error: 'An error occurred. Please try again.'
        });
    }
};

export const resetConfirmPostController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { password, confirmPassword } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.render('authentication/reset-confirm', {
                userId: id,
                errors: [{ param: 'confirmPassword', msg: 'Passwords do not match' }]
            });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.render('authentication/reset', {
                error: 'Invalid or expired reset link.'
            });
        }

        // Update password
        user.password = password;
        await user.save();

        // Send confirmation email
        await emailService.sendEmail(
            user.email,
            emailTemplates.passwordResetConfirm().subject,
            emailTemplates.passwordResetConfirm().html
            
        );

        res.redirect('/auth/login?success=Password has been reset successfully');
    } catch (error) {
        console.error('Reset password error:', error);
        res.render('authentication/reset-confirm', {
            userId: req.params.id,
            error: 'An error occurred. Please try again.'
        });
    }
};

// Google OAuth
export const googleCallbackController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new Error('No user data from Google');
        }

        const user = req.user as IUser;
        req.session.userId = user._id.toString();
        req.session.isAuthenticated = true;

        res.redirect('/projects');
    } catch (error) {
        logger.error('Google OAuth error:', error);
        res.status(500).render("error", {
            message: "An error occurred during Google authentication"
        });
    }
}; 