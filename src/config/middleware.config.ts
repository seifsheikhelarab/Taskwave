//Configuration for various Middleware used
//Morgan is used for logging requests
//Method-override is used for DELETE, PUT, etc.
//AttachUserToViews is used to attach the current user to all views
//EJS is used to send dynamic pages

import { Application } from "express";
import express from "express";
import path from "path";
import morgan from "morgan";
import { attachUserToViews } from "../middleware/user.middleware.js";
import methodOverride from "method-override";

export default function middlewareSetup(app: Application) {

    app.use(morgan("dev"));

    app.set("view engine", "ejs");
    app.set('views', path.join(process.cwd(), 'views'));

    app.use(express.static(path.join(process.cwd(), 'public')));

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            const method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
    
    app.use(attachUserToViews);
}