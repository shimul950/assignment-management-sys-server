import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router()

router.post("/create-admin",checkAuth("SUPER_ADMIN"), userController.createAdmin)
router.post("/create-super-admin", checkAuth("SUPER_ADMIN"), userController.createSuperAdmin)
router.post("/create-teacher", checkAuth("SUPER_ADMIN","ADMIN"), userController.createTeacher)
export const userRouters = router;