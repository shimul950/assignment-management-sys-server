import express from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = express.Router();

// ---------- Users ----------
router.get("/users", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllUsers);
router.get("/users/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getSingleUser);
router.patch("/users/:id/status", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.updateUserStatus);
router.delete("/users/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.deleteUser);

// ---------- Classes ----------
router.post("/classes", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.createClass);
router.get("/classes", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllClasses);
router.patch("/classes/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.updateClass);
router.delete("/classes/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.deleteClass);

// ---------- Subjects ----------
router.post("/subjects", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.createSubject);
router.get("/subjects", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllSubjects);
router.patch("/subjects/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.updateSubject);
router.delete("/subjects/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.deleteSubject);

// ---------- Teacher assignment ----------
router.post("/teacher-assignments", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.assignTeacher);
router.delete("/teacher-assignments/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.unassignTeacher);
router.get("/teacher-assignments", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllTeacherAssignments);

// ---------- View assignments / submissions ----------
router.get("/assignments", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllAssignments);
router.get("/assignments/:id", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getSingleAssignment);
router.get("/submissions", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllSubmissions);

// ---------- Settings ----------
router.get("/settings", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.getAllSettings);
router.put("/settings", checkAuth("ADMIN", "SUPER_ADMIN"), adminController.upsertSetting);

export const adminRoutes = router;