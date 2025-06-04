import express from "express";
import { 
    googleGetController, 
    loginGetController, 
    loginPostController, 
    logoutGetController, 
    resetConfirmGetController, 
    resetConfirmPostController, 
    resetGetController, 
    resetPostController, 
    signupGetController, 
    signupPostController 
} from "../controllers/authentication.controller.js";
import passport from "passport";

const router = express.Router();

router.route("/signup")
    .get(signupGetController)
    .post(signupPostController);

router.route("/login")
    .get(loginGetController)
    .post(loginPostController);

router.route("/logout")
    .get(logoutGetController)

//forget password routes
router.route("/reset")
    .get(resetGetController)
    .post(resetPostController)

router.route("/reset/token")
    .get(resetConfirmGetController)
    .get(resetConfirmPostController)


// //google routes
// //need fixing
router.route("/auth/callback")
    .get(passport.authenticate("google",{failureRedirect:"/"}),googleGetController);

// router.get("/auth/google", passport.authenticate("google",{scope:['profile','email']}));

// router.get("/profile/google",async (req, res) => {
//     let user = UserModel.findById(req.user.id).then(function (user) {
//         res.render("profile-google",{
//             displayName: user.google.displayName,
//             email: user.google.email,
//         })
//     })
//     .catch(function (err) {console.error(err)});
// });


// //twitter routes
// //needs fixing
// router.get("/auth/twitter", passport.authenticate("twitter"));

// router.get("/auth/callbacktwt", passport.authenticate("twitter",{failureRedirect:"/"}),(req, res) => {
//     res.redirect("/profile/twitter");
// })

// router.get("/profile/twitter", async (req, res) => {
//     let user = UserModel.findById(req.user.id)
//     .then(user => {
//         res.render("profile-twitter",{
//             displayName: user.twitter.displayName,
//             id: user.twitter.id,
//             username: user.twitter.username,
//         })
//     })
//     .catch(err => {console.error(err);});
    
// });


export default router;