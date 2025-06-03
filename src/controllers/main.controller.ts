//Main Controllers

import express, {Request,Response} from "express";

export async function indexController(req:Request, res:Response){
    res.render("index");
}