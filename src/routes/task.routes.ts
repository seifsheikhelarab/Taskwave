import express from "express";
import { 
    newTaskGetController, 
    newTaskPostController, 
    oneTaskDeleteController, 
    oneTaskGetController, 
    oneTaskPutController, 
    tasksGetController,
    updateTaskStatusController
} from "../controllers/task.controller.js";

const router = express.Router();

// User's tasks
router.route("/")
    .get(tasksGetController);

// Project tasks
router.route("/project/:projectId")
    .get(tasksGetController);

// Create task for a project
router.route("/project/:projectId/create")
    .post(newTaskPostController);

// Create task (general)
router.route("/create")
    .get(newTaskGetController)
    .post(newTaskPostController);

// Task status update
router.route("/:taskId/status")
    .put(updateTaskStatusController);

router.route("/:taskId")
    .get(oneTaskGetController)
    .put(oneTaskPutController)
    .delete(oneTaskDeleteController);

export default router;