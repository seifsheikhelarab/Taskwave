import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
    windowMs: 60000,
    limit: 5,
    handler: (req:Request, res:Response) => {
        res.status(429).render("timeout");
    },
    standardHeaders: true,
    legacyHeaders: false
})