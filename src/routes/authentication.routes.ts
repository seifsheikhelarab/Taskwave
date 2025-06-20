import express from "express";
import passport from 'passport';
import { 
    loginGetController, 
    loginPostController, 
    logoutController, 
    resetConfirmGetController, 
    resetConfirmPostController, 
    resetGetController, 
    resetPostController, 
    signupGetController, 
    signupPostController,
    googleCallbackController
} from "../controllers/authentication.controller.js";
import { isNotAuthenticated } from "../middleware/authentication.middleware.js";
import { authRateLimit } from "../middleware/ratelimit.middleware.js";

const router = express.Router();

// Regular authentication routes
router.route("/signup")
    .get(isNotAuthenticated, authRateLimit ,signupGetController)
    .post(isNotAuthenticated, authRateLimit, signupPostController);

router.route("/login")
    .get(isNotAuthenticated, authRateLimit ,loginGetController)
    .post(isNotAuthenticated, authRateLimit, loginPostController);

router.route("/logout")
    .post(logoutController);

// Password reset routes
router.route("/reset")
    .get(isNotAuthenticated, authRateLimit ,resetGetController)
    .post(isNotAuthenticated, authRateLimit, resetPostController);

router.route("/reset/:id")
    .get(isNotAuthenticated, authRateLimit ,resetConfirmGetController)
    .post(isNotAuthenticated, authRateLimit, resetConfirmPostController);

// OAuth routes
router.get('/google', isNotAuthenticated, 
    passport.authenticate('google', { 
        scope: ['profile', 'email']
    }
));
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/auth/login'
    }),
    googleCallbackController
);


export default router;