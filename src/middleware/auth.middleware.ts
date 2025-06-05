import { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/auth/login');
}

export function isNotAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        return next();
    }
    res.redirect('/');
} 