//Configuration for Sessions

import session from "express-session";
import MongoStore from "connect-mongo";
import { Application } from "express";

export default function sessionSetup(app: Application) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskwave',
            collectionName: 'sessions',
            ttl: 14 * 24 * 60 * 60 // 14 days
        }),
        cookie: {
            maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
    }));
}