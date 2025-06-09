//Main Controllers

import {Request,Response} from "express";

export async function indexController(req:Request, res:Response){
    res.render("index");
}

export async function errorController(req:Request, res:Response){
    res.status(404).render("error")
}
