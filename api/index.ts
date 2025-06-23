// api/index.js (or .ts)
import { default as app } from "../dist/app.js"; // Path to compiled app
import { createServer } from "http";

// This is the Vercel serverless function handler
export default (req, res) => {
    return app(req, res);
};
