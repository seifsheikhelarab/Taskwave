//Configuration for Sessions

import session from "express-session";
import MongoStore from "connect-mongo";
import { Application } from "express";
import { logger } from "./logger.config.js";

export default function sessionSetup(app: Application) {
    const store = MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/taskwave',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'native', // Use MongoDB's TTL index
        touchAfter: 24 * 3600 // Only update session if it's been more than 24 hours
    });

    // Monitor session store
    store.on('error', (error) => {
        logger.error('Session store error:', error);
    });

    store.on('connected', () => {
        logger.info('Session store connected');
    });

    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: true,
        saveUninitialized: true,
        store: store,
        cookie: {
            maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        },
        name: 'sessionId',
        rolling: true
    }));

    // Add error handling for session store
    app.use((err: any, req: any, res: any, next: any) => {
        if (err.code === 'ECONNREFUSED') {
            logger.error('Session store connection failed');
            return res.status(500).render('error', { 
                message: 'Session service unavailable' 
            });
        }
        next(err);
    });
}