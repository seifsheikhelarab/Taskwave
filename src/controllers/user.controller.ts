import { Request, Response } from "express";

export function currentUserGetController(req:Request,res:Response){
    res.send("Get current user profile (protected)");
}

export function currentUserPutController(req:Request,res:Response){
    res.send("Update logged-in user profile");
}

export function currentUserDeleteController(req:Request,res:Response){
    res.send("Delete your own account");
}

export function publicUserGetController(req:Request,res:Response){
    res.send("Get public user profile");
}