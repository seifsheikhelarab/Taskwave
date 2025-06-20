import express from "express";
import { aboutController, featuresController, indexController } from "../controllers/main.controller.js";

const router = express.Router();

router.route("/")
    .get(indexController);

router.route("/features")
    .get(featuresController);

router.route("/about")
    .get(aboutController);

export default router;