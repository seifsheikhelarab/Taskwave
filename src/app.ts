import dotenv from "dotenv";
dotenv.config();

import express from "express";
import passport from "passport";
import { router } from "./routes/main.routes.js";
import databaseSetup from "./config/database.config.js";
import middlewareSetup from "./config/middleware.config.js";
import sessionSetup from "./config/session.config.js";
import { configurePassport } from "./config/passport.config.js";
import { logger } from "./config/logger.config.js";
import swaggerSetup from "./config/swagger.config.js";

const app = express();

// Setup database
databaseSetup();

// Setup session first
sessionSetup(app);

// Setup passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Setup other middleware
middlewareSetup(app);

//Setup Swagger Docs
swaggerSetup(app);

// Routes
app.use(router);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`App Started on http://localhost:${port}`));

export default app;