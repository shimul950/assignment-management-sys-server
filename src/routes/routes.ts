import { Router } from "express";
import { authRouters } from "../app/modules/auth/auth.routes";
import { userRouters } from "../app/modules/user/user.route";


const router = Router();

router.use("/auth", authRouters);
router.use("/user", userRouters);


export const indexRoutes = router;