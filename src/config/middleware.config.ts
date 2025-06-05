//Configuration for various Middleware used
//needs fixing

import { Application } from "express";
import express from "express";
import path from "path";
import { __dirname } from "../app.js";
import morgan from "morgan";
import { attachUserToViews } from "../middleware/user.middleware.js";
import methodOverride from "method-override";

export default function middlewareSetup(app: Application) {
    // Logging
    app.use(morgan("dev"));

    // View engine setup
    app.set("view engine", "ejs");
    app.set('views', path.join(__dirname, 'views'));

    // Static files
    app.use(express.static(path.join(__dirname, 'public')));

    // Body parsing
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    
    // Method override for DELETE, PUT, etc.
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            const method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
    
    // Attach user to all views
    app.use(attachUserToViews);
}