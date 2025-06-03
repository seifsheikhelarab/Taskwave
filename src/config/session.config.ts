//Configuration for Sessions

import session from "express-session";
import mongoStore from "connect-mongo";
import { Application } from "express";

export default function sessionSetup(app:Application){
    app.use(session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: true,
        store: mongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions'
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: false
        }
    }));
}