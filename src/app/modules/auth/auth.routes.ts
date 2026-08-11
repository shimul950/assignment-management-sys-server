import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();

router.post("/register", authController.registerStudent);
router.post("/resend-otp", authController.resendOtp);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.loginUser);
router.get("/me",checkAuth("ADMIN", "STUDENT", "TEACHER", "SUPER_ADMIN"), authController.getme);
router.post("/refresh-token", authController.getNewToken);

router.post("/change-password", checkAuth("ADMIN", "STUDENT", "TEACHER", "SUPER_ADMIN"), authController.changePassword);
router.post("/logout", checkAuth("ADMIN", "STUDENT", "TEACHER", "SUPER_ADMIN"), authController.logoutUser);

router.get("/login/google", authController.googleLogin);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/oauth/error", authController.handleOAuthError)


export const authRouters = router;