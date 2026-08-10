import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import {tokenUtils } from "../../../../utils/token";
import { RegisterStudentPayload } from "./auth.interface";
import AppError from "../../errorHelpers/appError";
import { prisma } from "../../lib/prisma";



const registerStudent = async (payload: RegisterStudentPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: Role.STUDENT
        }
    })

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register student")
    }

    //todo : create student profile in transection after sign up of student in user model

    try {
        const student = await prisma.$transaction(async (tx) => {
            const studentTx = await tx.user.create({
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