import { Request, Response } from "express";

export async function indexController(req:Request, res:Response){
    res.render("public/index");
}

export async function featuresController(req:Request, res:Response){
    res.render("public/features");
}

export async function aboutController(req:Request, res:Response){
    res.render("public/about");
}

export async function errorController(req:Request, res:Response){
    res.status(404).render("public/error")
}

export async function timeoutController(req:Request, res:Response){
    res.status(429).render("authentication/timeout");
}
