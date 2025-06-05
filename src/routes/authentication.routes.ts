import express from "express";
import { 
    loginGetController, 
    loginPostController, 
    logoutPostController, 
    resetConfirmGetController, 
    resetConfirmPostController, 
    resetGetController, 
    resetPostController, 
    signupGetController, 
    signupPostController 
} from "../controllers/authentication.controller.js";
import { isNotAuthenticated } from "../middleware/auth.middleware.js";
import { loginLimiter, signupLimiter, passwordResetLimiter } from "../middleware/auth.rate-limit.js";

const router = express.Router();

// Regular authentication routes
router.route("/signup")
    .get(isNotAuthenticated, signupGetController)
    .post(isNotAuthenticated, signupLimiter, signupPostController);

router.route("/login")
    .get(isNotAuthenticated, loginGetController)
    .post(isNotAuthenticated, loginLimiter, loginPostController);

router.route("/logout")
    .post(logoutPostController);

// Password reset routes
router.route("/reset")
    .get(isNotAuthenticated, resetGetController)
    .post(isNotAuthenticated, passwordResetLimiter, resetPostController);

router.route("/reset/:token")
    .get(isNotAuthenticated, resetConfirmGetController)
    .post(isNotAuthenticated, passwordResetLimiter, resetConfirmPostController);

export default router;