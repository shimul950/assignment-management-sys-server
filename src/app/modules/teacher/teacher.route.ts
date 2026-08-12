import { Router } from "express";
import { teacherController } from "./teacher.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.use(checkAuth("TEACHER"));

// Assignments
router.post("/assignments", teacherController.createAssignment);
router.get("/assignments", teacherController.getMyAssignments);
router.get("/assignments/:id/submissions", teacherController.getSubmissions);
router.patch("/assignments/:id", teacherController.updateAssignment);
router.delete("/assignments/:id", teacherController.deleteAssignment);
router.patch("/assignments/:id/status", teacherController.changeAssignmentStatus);

// Submissions
router.patch("/submissions/:id/grade", teacherController.gradeSubmission);
router.patch("/submissions/:id/status", teacherController.changeSubmissionStatus);

export const teacherRouters = router;
