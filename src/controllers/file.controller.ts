import express,{ Request, Response } from "express";

export function fileGetController(req:Request,res:Response){
    res.send("hi");
}
