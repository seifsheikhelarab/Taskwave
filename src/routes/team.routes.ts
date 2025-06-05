import express from "express";
import { 
    teamGetController,
    inviteTeamPostController,
    removeTeamMemberPostController,
    changeRolePostController
} from "../controllers/team.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get team page
router.get("/", isAuthenticated, teamGetController);

// Invite team member
router.post("/invite", isAuthenticated, inviteTeamPostController);

// Remove team member
router.post("/:memberId/remove", isAuthenticated, removeTeamMemberPostController);

// Change team member role
router.post("/change-role", isAuthenticated, changeRolePostController);

export default router; 