import express from "express";
import { indexController } from "../controllers/main.controller.js";
import authenticationRouter from "./authentication.routes.js";
import boardRouter from "./board.routes.js";

export const router = express.Router();

router.get("/", indexController);

router.use("/auth",authenticationRouter);
router.use("/boards",boardRouter);