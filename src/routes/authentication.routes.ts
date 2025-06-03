import express,{ Request, Response } from "express";
import passport from "passport";

const router = express.Router();

router.route("/signup")
    .get((req:Request, res:Response)=>{
        res.render("authentication/signup");
    })
    .post((req:Request, res:Response)=>{
        res.send("hi");
    });

router.route("/login")
    .get((req:Request, res:Response)=>{
        res.render("authentication/login");
    })
    .post((req:Request, res:Response)=>{
        res.send("hi");
    });

router.route("/logout")
    .get((req:Request, res:Response)=>{
        res.send("hi");
    })

//forget password routes
router.route("/logout")
    .get((req:Request, res:Response)=>{
        res.send("hi");
    })

router.route("/logout/:token")
    .get((req:Request, res:Response)=>{
        res.send("hi");
    })


// //google routes
// //need fixing
// router.get("/auth/callback", passport.authenticate("google",{failureRedirect:"/"}),(req, res) => {
//     res.redirect("/profile/google");
// })

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