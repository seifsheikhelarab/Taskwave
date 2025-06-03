import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { router } from "./routes/main.routes.js";
import databaseSetup from "./config/database.config.js";
import middlewareSetup from "./config/middleware.config.js";
import sessionSetup from "./config/session.config.js";
import { logger } from "./config/logger.config.js";

const app = express();

const __filename = fileURLToPath(import.meta.url); 
export const __dirname = path.dirname(__filename);

databaseSetup();
middlewareSetup(app);
sessionSetup(app);
app.use(router);

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`App Started on http://localhost:${port}`));