import express from "express";
import { aboutController, featuresController, indexController } from "../controllers/main.controller.js";

/**
 * Description placeholder
 *
 * @type {*}
 */
const router = express.Router();

router.route("/")
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Public
 *     summary: Get home page
 *     description: Renders the main landing page of the TaskWave application. This page serves as the entry point for users and showcases the application's main value proposition, call-to-action buttons, and key features overview.
 *     security: []
 *     responses:
 *       200:
 *         description: Home page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page containing the main landing page with navigation, hero section, and call-to-action elements
 *             examples:
 *               landingPage:
 *                 summary: Main landing page
 *                 description: The complete HTML page for the TaskWave landing page
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(indexController);

router.route("/features")
/**
 * @swagger
 * /features:
 *   get:
 *     tags:
 *       - Public
 *     summary: Get features page
 *     description: Renders the features page that showcases all the capabilities and functionality of the TaskWave application. This page provides detailed information about project management, task tracking, team collaboration, and other key features.
 *     security: []
 *     responses:
 *       200:
 *         description: Features page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page displaying comprehensive feature information with detailed descriptions, screenshots, and benefits
 *             examples:
 *               featuresPage:
 *                 summary: Features showcase page
 *                 description: Complete HTML page showcasing TaskWave features including project management, task tracking, team collaboration, and more
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(featuresController);

router.route("/about")
/**
 * @swagger
 * /about:
 *   get:
 *     tags:
 *       - Public
 *     summary: Get about page
 *     description: Renders the about page containing information about the TaskWave application, its mission, team, and company details. This page helps users understand the story behind the application and build trust.
 *     security: []
 *     responses:
 *       200:
 *         description: About page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML page containing company information, mission statement, team details, and contact information
 *             examples:
 *               aboutPage:
 *                 summary: About page
 *                 description: Complete HTML page with company information, mission, team details, and contact information
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
    .get(aboutController);

export default router;