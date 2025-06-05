import express, { Request, Response } from "express";
import User from "../models/user.model.js";
import crypto from 'crypto';
import { Types } from 'mongoose';

// Extend Express Session interface
declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

export function signupGetController(req: Request, res: Response) {
    res.render("authentication/signup", {
        errors: [],
        oldInput: {}
    });
}

export async function signupPostController(req: Request, res: Response) {
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
        
        res.redirect('/me');
    } catch (error) {
        console.error('Signup error:', error);
        res.render("authentication/signup", {
            errors: [{ msg: 'An error occurred during signup' }],
            oldInput: req.body
        });
    }
}

export function loginGetController(req: Request, res: Response) {
    res.render("authentication/login", {
        errors: [],
        oldInput: {}
    });
}

export async function loginPostController(req: Request, res: Response) {
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

        res.redirect('/me');
    } catch (error) {
        console.error('Login error:', error);
        res.render("authentication/login", {
            errors: [{ msg: 'An error occurred during login' }],
            oldInput: req.body
        });
    }
}

export function logoutGetController(req: Request, res: Response) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
}

export function resetGetController(req: Request, res: Response) {
    res.render("authentication/reset", {
        errors: [],
        oldInput: {}
    });
}

export async function resetPostController(req: Request, res: Response) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal that the email doesn't exist
            return res.render("authentication/reset-confirm", {
                message: 'If an account exists with that email, you will receive a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: Send reset email
        // For now, just show the token in development
        const resetURL = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;
        console.log('Reset URL:', resetURL);

        res.render("authentication/reset-confirm", {
            message: 'If an account exists with that email, you will receive a password reset link.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.render("authentication/reset", {
            errors: [{ msg: 'An error occurred while processing your request' }],
            oldInput: req.body
        });
    }
}

export async function resetConfirmGetController(req: Request, res: Response) {
    try {
        const { token } = req.params;
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render("authentication/reset-confirm", {
                message: 'Password reset token is invalid or has expired'
            });
        }

        res.render("authentication/reset-password", {
            token,
            errors: [],
            oldInput: {}
        });
    } catch (error) {
        console.error('Reset confirm error:', error);
        res.render("authentication/reset-confirm", {
            message: 'An error occurred while processing your request'
        });
    }
}

export async function resetConfirmPostController(req: Request, res: Response) {
    try {
        const { token } = req.params;
        const { password, passwordConfirm } = req.body;

        if (password !== passwordConfirm) {
            return res.render("authentication/reset-password", {
                token,
                errors: [{ msg: 'Passwords do not match' }],
                oldInput: req.body
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render("authentication/reset-confirm", {
                message: 'Password reset token is invalid or has expired'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Log user in
        req.session.userId = (user._id as Types.ObjectId).toString();

        res.redirect('/me');
    } catch (error) {
        console.error('Reset password error:', error);
        res.render("authentication/reset-password", {
            token: req.params.token,
            errors: [{ msg: 'An error occurred while resetting your password' }],
            oldInput: req.body
        });
    }
}

export function googleGetController(req: Request, res: Response) {
    // Google OAuth callback - user is already authenticated by passport
    res.redirect('/me');
}
