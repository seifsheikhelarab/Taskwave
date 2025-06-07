import express from "express";
import { 
    boardsGetController, 
    newBoardGetController, 
    newBoardPostController, 
    oneBoardDeleteController, 
    oneBoardGetController, 
    oneBoardPutController 
} from "../controllers/board.controller.js";

const router = express.Router();

router.route("/")
    .get(boardsGetController)

router.route("/new")
    .get(newBoardGetController)
    .post(newBoardPostController)

router.route("/:boardId")
    .get(oneBoardGetController)
    .put(oneBoardPutController)
    .delete(oneBoardDeleteController)

export default router;