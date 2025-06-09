import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { logger } from "../config/logger.config.js";

export async function attachUserToViews(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session) {
            logger.warn('Session is not initialized');
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
        logger.error('Error attaching user to views:', error);
        res.locals.user = null;
        next();
    }
} 