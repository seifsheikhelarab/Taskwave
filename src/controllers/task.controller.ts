import { Request, Response } from "express";

export function tasksGetController(req:Request,res:Response){
        res.send("Get all tasks in a board");
}

export function createTaskGetController(req:Request,res:Response){
        res.send("Create a task");
}

export function createTaskPostController(req:Request,res:Response){
        res.send("Create a task");
}

export function oneTaskGetController(req:Request,res:Response){
        res.send("Get Task");
}

export function oneTaskPutController(req:Request,res:Response){
        res.send("Update task (status, assignment, etc.)");
}

export function oneTaskDeleteController(req:Request,res:Response){
        res.send("Delete task");
}
