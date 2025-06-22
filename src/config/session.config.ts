//Configuration for Sessions and Session Stores

import session from "express-session";
import MongoStore from "connect-mongo";
import { Application } from "express";
import { logger } from "./logger.config.js";

export default function sessionSetup(app: Application) {
    const store = MongoStore.create({
        mongoUrl: process.env.MONGO_URI!,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 3600
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

    app.use((err: any, req: any, res: any, next: any) => {
        if (err.code === 'ECONNREFUSED') {
            logger.error('Session store connection failed');
            return res.status(500).render('public/error', { 
                message: 'Session service unavailable' 
            });
        }
        next(err);
    });
}