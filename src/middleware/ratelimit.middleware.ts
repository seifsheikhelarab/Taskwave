import rateLimit from 'express-rate-limit';
import { timeoutController } from '../controllers/main.controller.js';

export const authRateLimit = rateLimit({
    windowMs: 60000,
    limit: 5,
    handler: timeoutController,
    standardHeaders: true,
    legacyHeaders: false
})