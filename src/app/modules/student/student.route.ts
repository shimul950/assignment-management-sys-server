import { Router } from "express";
import { studentController } from "./student.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.use(checkAuth("STUDENT"));

router.get("/assignments", studentController.getAssignedAssignments);
router.get("/assignments/:id", studentController.getAssignmentDetails);
router.post("/assignments/:id/submit", studentController.submitAnswer);

router.get("/submissions", studentController.getMySubmissions);
router.get("/submissions/:id", studentController.getSingleSubmission);

export const studentRouters = router;
