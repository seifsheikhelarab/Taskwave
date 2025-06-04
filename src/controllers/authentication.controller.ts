import express,{ Request, Response } from "express";

export function signupGetController(req:Request, res:Response){
    res.render("authentication/signup");
}

export function signupPostController(req:Request, res:Response){
    res.send("hi");
}

export function loginGetController(req:Request, res:Response){
    res.render("authentication/login");
}

export function loginPostController(req:Request, res:Response){
    res.send("hi");
}

export function logoutGetController(req:Request, res:Response){
    res.send("hi");
}

export function resetGetController(req:Request, res:Response){
    res.send("hi");
}

export function resetPostController(req:Request, res:Response){
    res.send("hi");
}

export function resetConfirmGetController(req:Request, res:Response){
    res.send("hi");
}

export function resetConfirmPostController(req:Request, res:Response){
    res.send("hi");
}

export function googleGetController(req:Request, res:Response){
    res.redirect("/me");
}

// export function resetConfirmPostController(req:Request, res:Response){
//     res.send("hi");
// }
