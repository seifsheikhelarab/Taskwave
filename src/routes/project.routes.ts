import express from "express";
import { 
    editProjectDeleteController, 
    editProjectGetController, 
    editProjectPutController, 
    inviteProjectGetController, 
    inviteProjectPostController, 
    joinProjectGetController, 
    joinProjectPostController, 
    leaveProjectGetController, 
    leaveProjectPostController, 
    newProjectGetController, 
    newProjectPostController, 
    oneProjectGetController, 
    projectsGetController 
} from "../controllers/project.controller.js";

const router = express.Router();

router.route("/")
    .get(projectsGetController)

router.route("/new")
    .get(newProjectGetController)
    .post(newProjectPostController)

router.route("/:projectId")
    .get(oneProjectGetController)

router.route("/:projectId/edit")
    .get(editProjectGetController)
    .put(editProjectPutController)
    .delete(editProjectDeleteController)

router.route("/:projectId/invite")
    .get(inviteProjectGetController)
    .post(inviteProjectPostController)

router.route("/:projectId/join")
    .get(joinProjectGetController)
    .post(joinProjectPostController)

router.route("/:projectId/leave")
    .get(leaveProjectGetController)
    .post(leaveProjectPostController)


export default router;