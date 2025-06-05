import express from "express";
import { 
    currentUserDeleteController, 
    currentUserGetController, 
    currentUserPutController, 
    publicUserGetController 
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

// Profile routes
router.route("/profile")
    .get(isAuthenticated, currentUserGetController)
    .put(isAuthenticated, currentUserPutController)
    .delete(isAuthenticated, currentUserDeleteController);

// Settings route
router.route("/settings")
    .get(isAuthenticated, currentUserGetController);

// Public profile route
router.route("/:id")
    .get(publicUserGetController);

export default router;