import express from "express";
import { 
    currentUserDeleteController, 
    currentUserGetController, 
    currentUserPutController, 
    publicUserGetController 
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/me")
    .get(currentUserGetController)
    .put(currentUserPutController)
    .delete(currentUserDeleteController)

router.route("/:id")
    .get(publicUserGetController);

export default router;