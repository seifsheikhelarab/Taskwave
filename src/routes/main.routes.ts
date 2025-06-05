import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { indexController } from "../controllers/main.controller.js";

import authenticationRouter from "./authentication.routes.js";
import projectRouter from "./project.routes.js";
import taskRouter from "./task.routes.js";
import userRouter from "./user.routes.js";
import teamRouter from "./team.routes.js";

export const router = express.Router();

// Public routes
router.get("/", indexController);
router.use("/auth", authenticationRouter);

// Protected routes
router.use("/projects", isAuthenticated, projectRouter);
router.use("/tasks", isAuthenticated, taskRouter);
router.use("/team", isAuthenticated, teamRouter);
router.use("/user", isAuthenticated, userRouter);

// User profile routes
router.get("/me", isAuthenticated, (req, res) => res.redirect("/users/profile"));
router.get("/settings", isAuthenticated, (req, res) => res.redirect("/users/settings"));

// Catch-all route for 404
router.use((req, res) => {
    res.status(404).render("error", {
        message: "Page not found",
        error: {
            status: 404
        }
    });
});