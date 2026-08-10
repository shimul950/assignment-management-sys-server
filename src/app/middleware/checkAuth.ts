/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../../../utils/cookie";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/appError";
import status from "http-status";
import { jwtUtils } from "../../../utils/jwt";
import { envVars } from "../../config/env";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: Role;
                email: string;
            };
        }
    }
}

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        //---------------------SESSION TOKEN VARIFICATION-----------------
        
        const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

        if (!sessionToken) {
            throw new Error('Unauthorized access! No session token provided.');
        }

        if (sessionToken) {
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date()
                    },

                },
                include: {
                    user: true
                }
            })

            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;

                const now = new Date();
                const expiresAt = new Date(sessionExists.expiresAt)
                const createdAt = new Date(sessionExists.createdAt)

                const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                const timeRemaining = expiresAt.getTime() - now.getTime();
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

                if (percentRemaining < 20) {
                    res.setHeader('X-session-Refresh', 'true');
                    res.setHeader('X-session-expires-at', expiresAt.toISOString());
                    res.setHeader('X-time-remaining', timeRemaining.toString());

                    console.log("Session expiring soon!!");
                }

                if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is deleted.');
                }

                if (user.isDeleted) {
                    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is deleted.');
                }

                if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                    throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this rosourcw')
                }
                req.user ={
                    userId: user.id,
                    role: user.role,
                    email: user.email
                }
            }

            const accessToken = cookieUtils.getCookie(req, 'accessToken');

            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided')
            }
        }


        //--------------------ACCESS TOKEN VARIFICATION-----------------

        const accessToken = await cookieUtils.getCookie(req, 'accessToken');

        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided')
        }

        const varifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

        if (!varifiedToken.success) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided')
        }

        if (authRoles.length > 0 && !authRoles.includes(varifiedToken.data!.role as Role)) {
            throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource')
        }

        next()

    } catch (error: any) {
        next(error)
    }
}