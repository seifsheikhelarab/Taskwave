import express from "express";
import { 
    createTaskGetController, 
    createTaskPostController, 
    oneTaskDeleteController, 
    oneTaskGetController, 
    oneTaskPutController, 
    tasksGetController 
} from "../controllers/task.controller.js";

const router = express.Router();

router.route("/")
    .get(tasksGetController);

router.route("/create")
    .get(createTaskGetController)
    .post(createTaskPostController)

router.route("/:taskId")
    .get(oneTaskGetController)
    .put(oneTaskPutController)
    .delete(oneTaskDeleteController)

export default router;