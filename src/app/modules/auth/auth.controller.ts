import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { tokenUtils } from "../../../../utils/token";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { cookieUtils } from "../../../../utils/cookie";
import AppError from "../../errorHelpers/appError";
import { envVars } from "../../../config/env";
import { auth } from "../../lib/auth";
import { ISessionPayload } from "./auth.interface";



const registerStudent = catchAsync(
    async(req: Request, res:Response) =>{
        const payload = req.body;

        const result = await authService.registerStudent(payload)
        
        const {accessToken, refreshToken, token, ...rest} = result

        tokenUtils.setAccesssTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBeterAuthSessionCookie(res, token as string);

        sendResponce(res, {
            httpStatusCode:status.CREATED,
            success: true,
            message:"Student registered successfully",
            data:{
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
    }
)

const resendOtp = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await authService.resendOtp(payload);

        sendResponce(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "OTP resent successfully",
            data: result
        });
    }
);

const verifyEmail = catchAsync(
    async(req: Request, res: Response)=>{
        const {email, otp} = req.body;
        await authService.verifyEmail(email, otp);

        sendResponce(res,{
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully"
        })
    }
)


const loginUser = catchAsync(
    async(req:Request, res:Response)=>{
        const payload = req.body;

        const result = await authService.loginUser(payload);

        const {accessToken, refreshToken, token, ...rest} = result

        tokenUtils.setAccesssTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBeterAuthSessionCookie(res, token);

        sendResponce(res, {
            httpStatusCode:status.OK,
            success: true,
            message:"User logged in successfully",
            data:{
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })

    }
)

const getme = catchAsync(async(req:Request, res:Response)=>{
    const user = req.user;
    const result = await authService.getme(user as IRequestUser);
    sendResponce(res,{
        httpStatusCode: status.OK,
        success: true,
        message: 'user profile fetched successfully',
        data: result
    })
})


const getNewToken = catchAsync(
    async(req: Request, res: Response) =>{
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        if(!refreshToken){
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing")
        }

        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken)

        const {accessToken, sessionToken, refreshToken: newRefreshToken} = result

        tokenUtils.setAccesssTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBeterAuthSessionCookie(res, sessionToken)

        sendResponce(res,{
            httpStatusCode: status.OK,
            success: true,
            message:"Refresh token updated successfully",
            data:result
        })
    }
)

const changePassword = catchAsync(
    async(req:Request, res:Response) =>{
        const payload = req.body;

        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        
        const result = await authService.changePassword(payload, betterAuthSessionToken);

        const {newAccessToken, newRefreshToken, token} = result
        
        tokenUtils.setAccesssTokenCookie(res, newAccessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBeterAuthSessionCookie(res, token as string)

        sendResponce(res,{
            httpStatusCode: status.OK,
            success: true,
            message: "Password change successfully",
            data: result
        })
    }
)

const logoutUser = catchAsync(
    async(req: Request, res: Response)=>{
        const betterAuthSessiontoken = req.cookies["better-auth.session_token"];

        const result = await authService.logoutUser(betterAuthSessiontoken);

        cookieUtils.clearCookie(res, 'accessToken', {
            httpOnly:true,
            secure: true,
            sameSite: 'none'
        })

        cookieUtils.clearCookie(res, 'refreshToken',{
            httpOnly:true,
            secure: true,
            sameSite: 'none'
        })

        cookieUtils.clearCookie(res, "better-auth.session_token", {
            httpOnly:true,
            secure: true,
            sameSite: 'none'
        })

        sendResponce(res,{
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result
        })
    }
)

const forgetPassword = catchAsync(
    async(req: Request, res: Response)=>{
        const {email} = req.body;
        await authService.forgetPassword(email);

        sendResponce(res,{
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset OTP sent to email successfully"
        })
    }
)
const resetPassword = catchAsync(
    async(req: Request, res: Response)=>{
        const {email, otp, newPassword} = req.body;
        await authService.resetPassword(email, otp, newPassword);

        sendResponce(res,{
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully"
        })
    }
)

//  /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync((req: Request, res: Response) =>{
    const redirectPath = req.query.redirect || "/dashboard";

    const encodedRedirectPath  = encodeURIComponent(redirectPath as string);

    const callbackUrl = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`

    res.render("googleRedirect",{
        callBackUrl: callbackUrl,
        betterAuthUrl: envVars.BETTER_AUTH_URL
    })
})

const googleLoginSuccess = catchAsync(async(req: Request, res: Response) =>{
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if(!sessionToken){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`)
    }

    const session = await auth.api.getSession({
        headers:{
            "Cookie" : `better-auth.session_token=${sessionToken}`
        }
    })

    if(!session){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`)
    }

    if(session && !session.user){
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`)
    }

    const result = await authService.googleLoginSuccess(session as ISessionPayload);

    const {accessToken, refreshToken} = result;

    tokenUtils.setAccesssTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    // redirect=//profile -> /profile
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");

    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`)
})


const handleOAuthError = catchAsync((req: Request, res: Response) =>{
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`)
})



export const authController = {
    registerStudent,
    resendOtp,
    verifyEmail,
    loginUser,
    getme,
    getNewToken,
    changePassword,
    logoutUser,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError
}