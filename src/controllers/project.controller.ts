import { Request, Response } from "express";

export function projectsGetController(req:Request,res:Response){
    res.render("project/projects")
}

export function newProjectGetController(req:Request,res: Response){
    res.render("project/new");
}

export function newProjectPostController(req:Request,res: Response){
    res.send("new project made");
}

export function oneProjectGetController(req:Request,res: Response){
    res.send("Get specific project details");
}

export function editProjectGetController(req:Request,res: Response){
    res.send("Get project edit page");
}

export function editProjectPutController(req:Request,res: Response){
    res.send("Edit specific project details");
}

export function editProjectDeleteController(req:Request,res: Response){
    res.send("Delete a project (Admin only)");
}

export function inviteProjectGetController(req:Request,res: Response){
    res.send("Invite user via email");
}

export function inviteProjectPostController(req:Request,res: Response){
    res.send("Invite user via email");
}

export function joinProjectGetController(req:Request,res: Response){
    res.send("Accept invite and join project");
}

export function joinProjectPostController(req:Request,res: Response){
    res.send("Accept invite and join project");
}

export function leaveProjectGetController(req:Request,res: Response){
    res.send("Leave the project");
}

export function leaveProjectPostController(req:Request,res: Response){
    res.send("Leave the project");
}