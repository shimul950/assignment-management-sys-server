import { Router } from "express";
import { authRouters } from "../app/modules/auth/auth.routes";
import { userRouters } from "../app/modules/user/user.route";
import { teacherRouters } from "../app/modules/teacher/teacher.route";
import { studentRouters } from "../app/modules/student/student.route";


const router = Router();

router.use("/auth", authRouters);
router.use("/user", userRouters);
router.use("/teacher", teacherRouters);
router.use("/student", studentRouters);


export const indexRoutes = router;