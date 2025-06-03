import express,{ Request, Response } from "express";

const router = express.Router();

router.route("/")
    .get((req:Request,res:Response) => {
        res.send("view all boards");
    })

router.route("/new")
    .get((req:Request,res:Response) => {
        res.send("create new board");
    })
    .post((req:Request,res:Response)=>{
        res.send("new board created");
    })

router.route("/:boardId")
    .get((req:Request,res:Response) => {
        res.send("view all boards");
    })
    .put((req:Request,res:Response)=>{
        res.send("update the board");
    })
    .delete((req:Request,res:Response)=>{
        res.send("delete the board");
    })



export default router;