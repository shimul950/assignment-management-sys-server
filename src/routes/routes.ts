import { Router } from "express";
import { authRouters } from "../app/modules/auth/auth.routes";


const router = Router();

router.use("/auth", authRouters);


export const indexRoutes = router;