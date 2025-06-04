import { Request, Response } from "express";

export function boardsGetController(req:Request,res:Response){
        res.send("view all boards");
}

export function newBoardGetController(req:Request, res:Response){
    res.send("create new board");
}

export function newBoardPostController(req:Request, res:Response){
    res.send("new board created");
}

export function oneBoardGetController(req:Request, res:Response){
    res.send("view the board");
}

export function oneBoardPutController(req:Request, res:Response){
    res.send("update the board");
}

export function oneBoardDeleteController(req:Request, res:Response){
    res.send("delete the board");
}
