import express from "express";

import { indexController } from "../controllers/main.controller.js";

import authenticationRouter from "./authentication.routes.js";
import boardRouter from "./board.routes.js";
import fileRouter from "./file.routes.js";
import projectRouter from "./project.routes.js";
import taskRouter from "./task.routes.js";
import userRouter from "./user.routes.js";


export const router = express.Router();

router.get("/", indexController);

router.use("/auth",authenticationRouter);
router.use("/projects/projectId/boards",boardRouter);
router.use("/upload",fileRouter);
router.use("/projects",projectRouter);
router.use("/projects/projectId/boards/boardId/tasks",taskRouter);
router.use("/users",userRouter);