import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";

export async function attachUserToViews(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session) {
            console.warn('Session is not initialized');
            res.locals.user = null;
            return next();
        }

        if (req.session.userId) {
            const user = await User.findById(req.session.userId)
                .select('-password -passwordResetToken -passwordResetExpires');
            res.locals.user = user;
        } else {
            res.locals.user = null;
        }
        next();
    } catch (error) {
        console.error('Error attaching user to views:', error);
        res.locals.user = null;
        next();
    }
} 