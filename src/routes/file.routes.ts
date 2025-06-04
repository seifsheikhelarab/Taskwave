import express from "express";
import { fileGetController } from "../controllers/file.controller.js";

const router = express.Router();

router.route("/")
    .get(fileGetController)

export default router;