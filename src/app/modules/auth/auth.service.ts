import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { tokenUtils } from "../../../../utils/token";
import { IChangePasswordPayload, LoginUserPayload, RegisterStudentPayload } from "./auth.interface";
import AppError from "../../errorHelpers/appError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { JwtPayload } from "jsonwebtoken";
import { jwtUtils } from "../../../../utils/jwt";
import { envVars } from "../../../config/env";



const registerStudent = async (payload: RegisterStudentPayload) => {
    const { name, email, password } = payload;

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (existingUser) {
        throw new AppError(status.BAD_REQUEST, "User with this email already exists")
    }

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: Role.STUDENT
        }
    })
    console.log("Register student data:", data);

    

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register student")
    }

    //todo : create student profile in transection after sign up of student in user model

    try {
        const student = await prisma.$transaction(async (tx) => {
            const studentTx = await tx.student.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email
                }
            })
            return studentTx
        })

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVarified: data.user.emailVerified
        })

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVarified: data.user.emailVerified
        })

        return {
            ...data,
            accessToken,
            refreshToken,
            student
        }
    } catch (error) {
        console.log("Transaction error:", error);
        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })
        throw error
    }
}


const resendOtp = async (payload: { email: string; type?: "email-verification" | "sign-in" | "forget-password" }) => {
    const { email, type } = payload;

    if (!email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }

    try {
        await auth.api.sendVerificationOTP({
            body: {
                email,
                type: type || "email-verification"
            }
        });
    } catch (error: any) {
        const message =
            (error?.body?.message as string) ||
            (error?.message as string) ||
            "Failed to resend OTP";

        // Better Auth throws when your rateLimit customRule blocks the request
        if (error?.status === 429 || message.toLowerCase().includes("rate")) {
            throw new AppError(status.TOO_MANY_REQUESTS, "Please wait before requesting another OTP");
        }

        throw new AppError(status.INTERNAL_SERVER_ERROR, message);
    }

    return { email };
};

const verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp
        }
    })

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email
            },
            data: {
                emailVerified: true
            }
        })
    }
}


const loginUser = async (payload: LoginUserPayload) => {
    const { email, password } = payload;

    let data;
    try {
        data = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        })
    } catch (error: any) {
        // Supabase-style / better-auth errors may include a body with more info
        const message =
            (error?.body?.message as string) ||
            (error?.message as string) ||
            "Invalid email or password";

        throw new AppError(status.UNAUTHORIZED, message);
    }

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is blocked")
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is Deleted")
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVarified: data.user.emailVerified
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVarified: data.user.emailVerified
    })


    return {
        ...data,
        accessToken,
        refreshToken
    };
}

const getme = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
            student: {
                include: {
                    studentEnrollments: true,
                    submissions: true,        
                }
            },
            teacher: {
                include: {
                    assignments: true,     
                }
            },
            admin: {}
        }
    })

    if (!isUserExists) {
        throw new AppError(status.NOT_FOUND, "User not found")
    }

    return isUserExists;
}

const getNewToken = async (refreshToken: string, sessionToken: string) => {

    const isSessionTokenExists = await prisma.session.findUnique({
        where: {
            token: sessionToken
        },
        include: {
            user: true
        }
    })

    if (!isSessionTokenExists) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token")
    }

    const varifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);

    if (!varifiedRefreshToken.success && varifiedRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token")
    }

    const data = varifiedRefreshToken.data as JwtPayload

    console.log(data);

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVarified: data.emailVerified
    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVarified: data.emailVerified
    })

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date()
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token
    }

}

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {

    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })

    })
    if (!session) {
        throw new AppError(status.UNAUTHORIZED, "Invalied session token")
    }

    const { currentPassword, newPassword } = payload

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    if (session.user.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: session.user.id
            },
            data: {
                needPasswordChange: false
            }
        })
    }


    const newAccessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVarified: session.user.emailVerified
    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVarified: session.user.emailVerified
    })

    return {
        ...result,
        newAccessToken,
        newRefreshToken
    }
}


const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer${sessionToken}`
        })
    })
    return result
}

const forgetPassword = async (email: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isExistUser) {
        throw new AppError(status.NOT_FOUND, "user not found")
    }

    if (!isExistUser.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not varified.");
    }

    if (isExistUser.isDeleted || isExistUser.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "user not found")
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email
        }
    })
}

const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isExistUser) {
        throw new AppError(status.NOT_FOUND, "user not found")
    }

    if (!isExistUser.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not varified.");
    }

    if (isExistUser.isDeleted || isExistUser.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "user not found")
    }

    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password: newPassword
        }
    })

    if (isExistUser.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isExistUser.id
            },
            data: {
                needPasswordChange: false
            }
        })
    }

    await prisma.session.deleteMany({
        where: {
            userId: isExistUser.id
        }
    })
}

const googleLoginSuccess = async (session: Record<string, any>) => {

    console.log(session);
    const isStudentExist = await prisma.student.findUnique({
        where: {
            userId: session.user.id
        }
    })

    if (!isStudentExist) {
        await prisma.student.create({
            data: {
                userId: session.user.id,
                name: session.user.name,
                email: session.user.email
            }
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        name: session.user.name,
        role: session.user.role
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        name: session.user.name,
        role: session.user.role
    })

    return{
        accessToken,
        refreshToken
    }
}


export const authService = {
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
    googleLoginSuccess
}